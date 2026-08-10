"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, ClipboardCheck, Menu, Phone, X } from "lucide-react";

import { NAV_LINKS } from "@/lib/clinic-info";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CLINIC } from "@/lib/clinic-info";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative min-[1081px]:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="relative z-[70] rounded-full text-primary"
        aria-label={open ? "メニューを閉じる" : "メニューを開く"}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="fixed inset-x-0 bottom-0 z-[60] border-t bg-background"
          style={{ top: "var(--header-height)" }}
        >
          <nav
            aria-label="モバイルメニュー"
            className="h-full overflow-y-auto px-5 py-6"
          >
            <p className="mb-4 font-[Arial] text-[10px] font-bold tracking-[.2em] text-primary">
              SITE MENU
            </p>
            <ul className="grid grid-cols-2 border-l border-t">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="border-b border-r">
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={cn(
                      "block min-h-16 px-4 py-4 text-sm font-semibold",
                      pathname === link.href
                        ? "bg-primary text-white"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link
                href="/reserve"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 bg-accent px-4 py-3.5 text-sm font-bold text-accent-foreground"
              >
                <CalendarCheck className="size-5" aria-hidden /> Web予約
              </Link>
              <Link
                href="/appointments/manage"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 border border-primary bg-background px-4 py-3.5 text-sm font-bold text-primary"
              >
                <ClipboardCheck className="size-5" aria-hidden /> 予約確認・変更・取消
              </Link>
              <a
                href={CLINIC.telHref}
                className="flex items-center justify-center gap-2 bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground sm:col-span-2"
              >
                <Phone className="size-5" aria-hidden /> {CLINIC.tel}
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
