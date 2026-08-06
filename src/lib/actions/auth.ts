"use server";

import { redirect } from "next/navigation";

import { checkPassword, createSession, destroySession } from "@/lib/auth";
import type { ActionState } from "@/lib/actions/reservation";

export async function login(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");

  if (!password || !checkPassword(password)) {
    return { success: false, message: "パスワードが正しくありません。" };
  }

  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
