"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { NAV_LINKS } from "@/lib/clinic-info";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
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
          className="fixed inset-0 top-[var(--header-h,0px)] z-50 bg-background"
        >
          <nav
            aria-label="モバイルメニュー"
            className="h-full overflow-y-auto px-4 py-4"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={cn(
                      "block rounded-lg px-4 py-3.5 text-lg font-semibold",
                      pathname === link.href
                        ? "bg-secondary text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t pt-4">
              <a
                href="tel:0977253611"
                className="flex items-center justify-center rounded-lg bg-primary px-4 py-3.5 text-lg font-bold text-primary-foreground"
              >
                電話する（0977-25-3611）
              </a>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
