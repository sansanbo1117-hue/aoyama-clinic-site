import Link from "next/link";
import { Phone, CalendarCheck } from "lucide-react";

import { CLINIC, NAV_LINKS } from "@/lib/clinic-info";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="border-b bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-4 px-4 py-1.5 text-sm">
          <Link href="/faq" className="hover:underline">
            よくある質問
          </Link>
          <Link href="/recruit" className="hover:underline">
            採用情報
          </Link>
          <Link href="/contact" className="hover:underline">
            お問い合わせ
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
            青
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs text-muted-foreground">
              医療法人
            </span>
            <span className="block truncate text-lg font-bold text-primary sm:text-xl">
              {CLINIC.name}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
            <Link href="/reserve">
              <CalendarCheck /> Web予約
            </Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href={CLINIC.telHref}>
              <Phone /> {CLINIC.tel}
            </a>
          </Button>
          <MobileNav />
        </div>
      </div>

      <nav
        aria-label="メインナビゲーション"
        className="hidden border-t bg-secondary/40 md:block"
      >
        <div className="mx-auto max-w-6xl px-4">
          <ul className="flex flex-wrap">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block px-3.5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
