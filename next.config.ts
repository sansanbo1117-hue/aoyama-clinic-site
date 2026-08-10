import type { NextConfig } from "next";

// 患者の氏名・電話番号・診察券番号を扱うサイトのため、最低限のセキュリティヘッダーを設定する（Step6）。
// Googleマップの埋め込み（/access, トップページ）と、Next.jsが出力するJSON-LD/インラインstyleを
// 許可する必要があるため script-src / style-src には 'unsafe-inline' を含めている。
const CSP = [
  "default-src 'self'",
  "img-src 'self' data:",
  "frame-src https://www.google.com",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${process.env.VERCEL_ENV === "preview" ? " https://vercel.live" : ""}`,
  "connect-src 'self'",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HTTPで配信された場合ブラウザは無視するため、開発環境(http)でも安全に設定できる。
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  turbopack: { root: process.cwd() },
  async headers() {
    // 開発モードのReact DevTools/HMRはeval()やWebSocketを使うため、
    // 本番CSPを弱めずに両立させることができない。本番ビルドでのみ適用する。
    if (process.env.NODE_ENV !== "production") return [];
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
