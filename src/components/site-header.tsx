import Link from "next/link";
import { CalendarCheck, ClipboardCheck, Phone } from "lucide-react";

import { MobileNav } from "@/components/mobile-nav";
import { CLINIC } from "@/lib/clinic-info";

const MAIN_NAV = [
  { href: "/about", label: "医院について", en: "ABOUT" },
  { href: "/medical", label: "診療内容", en: "MEDICAL" },
  { href: "/doctor", label: "医師・スタッフ", en: "DOCTOR" },
  { href: "/hours", label: "診療時間", en: "HOURS" },
  { href: "/access", label: "アクセス", en: "ACCESS" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label={`${CLINIC.name} トップページ`}>
          <span className="brand-mark" aria-hidden>青</span>
          <span>
            <small>医療法人</small>
            <strong>{CLINIC.name}</strong>
            <em>AOYAMA ORTHOPAEDIC CLINIC</em>
          </span>
        </Link>

        <nav aria-label="メインナビゲーション" className="desktop-nav">
          {MAIN_NAV.map((item) => (
            <Link href={item.href} key={item.href}>
              <small>{item.en}</small><span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <a href={CLINIC.telHref} className="header-phone">
            <Phone aria-hidden />
            <span><small>電話でのお問い合わせ</small><strong>{CLINIC.tel}</strong></span>
          </a>
          <div className="header-booking-actions">
            <Link href="/reserve" className="header-reserve">
              <CalendarCheck aria-hidden /><span>Web予約</span>
            </Link>
            <Link href="/appointments/manage" className="header-manage">
              <ClipboardCheck aria-hidden />
              <span>予約確認・変更・取消</span>
            </Link>
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
