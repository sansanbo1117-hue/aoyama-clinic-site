import type { Metadata } from "next";
import Link from "next/link";
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
      <p className="text-sm font-semibold text-primary">医療機関スタッフ向け</p>
      <h1 className="mt-1 text-xl font-bold text-primary">管理画面ログイン</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        予約・患者情報・お問い合わせを管理するスタッフ専用画面です。
      </p>
      <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
        患者さま向けの予約ページではありません。スタッフ以外の方はこの画面を閉じてください。
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
      <div className="mt-5 flex flex-col gap-2 text-center text-sm">
        <p className="text-muted-foreground">次回すぐ開けるよう、このページをお気に入りに登録できます。</p>
        <Link href="/" className="text-primary underline underline-offset-4">
          患者さま向け公式サイトへ戻る
        </Link>
      </div>
    </div>
  );
}
