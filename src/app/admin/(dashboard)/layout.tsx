import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LogOut } from "lucide-react";

import { isAuthenticated } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "管理画面",
  robots: { index: false, follow: false },
};

const links = [
  { href: "/admin/reservations", label: "Web予約" },
  { href: "/admin/news", label: "お知らせ管理" },
  { href: "/admin/contacts", label: "お問い合わせ" },
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
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-lg font-bold text-primary">管理画面</p>
          <nav aria-label="管理メニュー" className="mt-2 flex flex-wrap gap-2">
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
    </div>
  );
}
