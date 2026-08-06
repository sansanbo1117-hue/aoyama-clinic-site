import Link from "next/link";
import { Phone, MapPin, Printer, Mail } from "lucide-react";

import { CLINIC, FOOTER_LINKS } from "@/lib/clinic-info";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-secondary/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-primary">{CLINIC.name}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              {CLINIC.fullAddress}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden />
              <a href={CLINIC.telHref} className="hover:text-primary hover:underline">
                {CLINIC.tel}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Printer className="size-4 shrink-0" aria-hidden />
              FAX：{CLINIC.fax}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden />
              <a
                href={`mailto:${CLINIC.email}`}
                className="hover:text-primary hover:underline"
              >
                {CLINIC.email}
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label="フッターナビゲーション">
          <p className="text-sm font-bold text-foreground">サイトメニュー</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {FOOTER_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-primary hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-bold text-foreground">お急ぎの方へ</p>
          <p className="mt-4 text-sm text-muted-foreground">
            初診・お久しぶりの方は事前のお電話予約をお願いしております。
          </p>
          <a
            href={CLINIC.telHref}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground"
          >
            <Phone className="size-4" aria-hidden /> {CLINIC.tel}
          </a>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        &copy; {CLINIC.legalName}
      </div>
    </footer>
  );
}
