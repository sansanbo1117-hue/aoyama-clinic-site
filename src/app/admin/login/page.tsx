import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "管理画面ログイン",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAuthenticated()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="text-xl font-bold text-primary">管理画面ログイン</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        お知らせ・予約・お問い合わせの管理はこちらからログインしてください。
      </p>
      <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        確認用のデモ管理画面です。実患者の情報は入力しないでください。
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </div>
  );
}
