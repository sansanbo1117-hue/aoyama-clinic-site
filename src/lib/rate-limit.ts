import { headers } from "next/headers";
import crypto from "node:crypto";

type RateLimitConfig = { windowMs: number; max: number };

const LIMITS: Record<string, RateLimitConfig> = {
  contact: { windowMs: 10 * 60 * 1000, max: 5 },
  availability: { windowMs: 10 * 60 * 1000, max: 60 },
  "booking-hold": { windowMs: 10 * 60 * 1000, max: 10 },
  "booking-confirm": { windowMs: 10 * 60 * 1000, max: 5 },
  reschedule: { windowMs: 10 * 60 * 1000, max: 5 },
  "appointment-lookup": { windowMs: 15 * 60 * 1000, max: 5 },
  "admin-login": { windowMs: 15 * 60 * 1000, max: 5 },
};
const DEFAULT_LIMIT: RateLimitConfig = { windowMs: 10 * 60 * 1000, max: 10 };

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
let warnedMissingUpstash = false;

/**
 * インメモリ・フォールバック。インスタンスをまたいで共有されず、
 * コールドスタートで消える。UPSTASH_* 未設定時のみ使用する
 * （ローカル開発・デプロイ前確認では十分だが、本番のサーバーレス環境では
 * インスタンスごとに別カウントになるため確実な防御にはならない）。
 */
const memoryStore = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = 0;

function memoryCheck(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  if (now - lastCleanup > 60_000) {
    for (const [k, v] of memoryStore) if (v.resetAt <= now) memoryStore.delete(k);
    lastCleanup = now;
  }
  const current = memoryStore.get(key);
  if (!current || current.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }
  if (current.count >= config.max) return false;
  current.count += 1;
  return true;
}

async function redisCheck(key: string, config: RateLimitConfig): Promise<boolean> {
  const windowSeconds = Math.ceil(config.windowMs / 1000);
  const response = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, String(windowSeconds), "NX"],
    ]),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Upstash rate limit error: ${response.status}`);
  const results = (await response.json()) as Array<{ result: number }>;
  return (results[0]?.result ?? 0) <= config.max;
}

export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwardedFor =
    headerStore.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || headerStore.get("x-real-ip") || "unknown";
}

/** IPアドレスなど識別子をハッシュ化する（生IPをDBに残さないため）。 */
export function hashClientKey(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 32);
}

async function checkLimit(scope: string, key: string): Promise<boolean> {
  const config = LIMITS[scope] ?? DEFAULT_LIMIT;
  const storeKey = `ratelimit:${scope}:${key}`;

  if (UPSTASH_URL && UPSTASH_TOKEN) {
    try {
      return await redisCheck(storeKey, config);
    } catch (error) {
      console.error(
        "レート制限ストア(Upstash)に接続できません。一時的にメモリ実装へフォールバックします。",
        error instanceof Error ? error.message : error
      );
      return memoryCheck(storeKey, config);
    }
  }

  if (!warnedMissingUpstash) {
    warnedMissingUpstash = true;
    console.warn(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN が未設定です。" +
        "レート制限はインスタンス単位のメモリ実装にフォールバックしています。" +
        "本番のサーバーレス環境では確実に機能しないため、公開前に設定してください。"
    );
  }
  return memoryCheck(storeKey, config);
}

/** フォーム送信・予約APIなど、公開エンドポイントの連投を防ぐ。IPアドレス単位。 */
export async function allowPublicSubmission(scope: string): Promise<boolean> {
  const ip = await getClientIp();
  return checkLimit(scope, ip);
}

/** IP以外の任意キー（例：同一クライアントによる診療枠ホールドの多重取得防止）でのレート制限。 */
export async function allowByKey(scope: string, key: string): Promise<boolean> {
  return checkLimit(scope, key);
}
