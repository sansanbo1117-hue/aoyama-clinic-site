"use server";

import { redirect } from "next/navigation";

import { checkPassword, createSession, destroySession } from "@/lib/auth";
import { allowPublicSubmission } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import type { ActionState } from "@/lib/actions/reservation";

// 監査ログはベストエフォート。DB障害等で書き込みに失敗しても、
// ログイン・ログアウト自体は失敗させない（ロギングが認証機能の単一障害点にならないように）。
async function logAuthEvent(action: string): Promise<void> {
  try {
    await prisma.auditEvent.create({ data: { actorType: "admin", action, entityType: "Session" } });
  } catch (error) {
    console.error("Failed to record audit event", action, error instanceof Error ? error.message : error);
  }
}

export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await allowPublicSubmission("admin-login"))) {
    return {
      success: false,
      message: "試行回数が多すぎます。しばらくしてから、もう一度お試しください。",
    };
  }

  const password = String(formData.get("password") ?? "");

  if (!password || !checkPassword(password)) {
    await logAuthEvent("auth.login_failed");
    return { success: false, message: "パスワードが正しくありません。" };
  }

  await createSession();
  await logAuthEvent("auth.login_succeeded");
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  await logAuthEvent("auth.logout");
  redirect("/admin/login");
}
