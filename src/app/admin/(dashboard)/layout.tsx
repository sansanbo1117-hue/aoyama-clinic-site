import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LogOut } from "lucide-react";

import { isAuthenticated } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { isDemoMode, DEMO_NOTICE } from "@/lib/demo";

export const metadata: Metadata = {
  title: "管理画面",
  robots: { index: false, follow: false },
};

const links = [
  { href: "/admin", label: "今日" },
  { href: "/admin/patients", label: "患者" },
  { href: "/admin/appointments/new", label: "電話予約" },
  { href: "/admin/schedule", label: "診療枠管理" },
  { href: "/admin/notifications", label: "通知センター" },
  { href: "/admin/reservations", label: "予約依頼" },
  { href: "/admin/news", label: "お知らせ管理" },
  { href: "/admin/faq", label: "FAQ管理" },
  { href: "/admin/contacts", label: "お問い合わせ" },
  { href: "/admin/settings/notifications", label: "通知設定" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-shell mx-auto max-w-6xl px-4 py-5 pb-24 sm:py-8 sm:pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-lg font-bold text-primary">受付ワークベンチ</p>
          <nav aria-label="管理メニュー" className="mt-2 hidden flex-wrap gap-2 sm:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold hover:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut className="size-4" aria-hidden /> ログアウト
          </Button>
        </form>
      </div>

      <div className="mt-6">{children}</div>
      {isDemoMode && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950" role="status">
          {DEMO_NOTICE} 実患者情報は入力しないでください。
        </div>
      )}
      <nav aria-label="スマホ用管理メニュー" className="admin-mobile-nav fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t bg-card/95 p-2 shadow-[0_-8px_30px_rgba(15,55,76,.12)] backdrop-blur sm:hidden">
        {links.slice(0, 5).map((l) => <Link key={l.href} href={l.href} className="flex min-h-12 flex-col items-center justify-center rounded-lg px-1 text-[11px] font-bold text-muted-foreground hover:bg-secondary hover:text-primary">{l.label}</Link>)}
      </nav>
    </div>
  );
}
