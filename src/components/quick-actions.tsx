import Link from "next/link";
import { ArrowRight, CalendarCheck, Clock3, MapPin, Phone } from "lucide-react";

import { CLINIC } from "@/lib/clinic-info";

const actions = [
  { href: "/reserve", icon: CalendarCheck, label: "Web予約", sub: "初診・再診・変更" },
  { href: "/hours", icon: Clock3, label: "診療時間", sub: "受付時間・休診日" },
  { href: "/access", icon: MapPin, label: "アクセス", sub: "地図・駐車場" },
] as const;

export function QuickActions() {
  return (
    <section aria-label="受診のご案内" className="quick-actions-wrap">
      <div className="site-container quick-actions">
        <div className="quick-label">
          <span>VISIT GUIDE</span>
          <strong>受診のご案内</strong>
        </div>
        {actions.map(({ href, icon: Icon, label, sub }) => (
          <Link href={href} className="quick-link" key={href}>
            <Icon aria-hidden />
            <span><strong>{label}</strong><small>{sub}</small></span>
            <ArrowRight aria-hidden />
          </Link>
        ))}
        <a href={CLINIC.telHref} className="quick-phone">
          <Phone aria-hidden />
          <span><small>お電話でのお問い合わせ</small><strong>{CLINIC.tel}</strong></span>
        </a>
      </div>
    </section>
  );
}
