import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone, Printer } from "lucide-react";

import { CLINIC, FOOTER_LINKS } from "@/lib/clinic-info";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container footer-top">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden>青</span>
          <div><small>医療法人</small><strong>{CLINIC.name}</strong><em>AOYAMA ORTHOPAEDIC CLINIC</em></div>
        </div>
        <p>痛みの先に、もう一度動ける日常を。</p>
      </div>
      <div className="site-container footer-grid">
        <div className="footer-contact">
          <p><MapPin aria-hidden /> {CLINIC.fullAddress}</p>
          <p><Phone aria-hidden /> <a href={CLINIC.telHref}>{CLINIC.tel}</a></p>
          <p><Printer aria-hidden /> FAX {CLINIC.fax}</p>
          <p><Mail aria-hidden /> <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a></p>
          <Link href="/access">Google Maps / アクセス <ArrowUpRight aria-hidden /></Link>
        </div>
        <nav aria-label="フッターナビゲーション" className="footer-nav">
          {FOOTER_LINKS.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
        <div className="footer-cta">
          <small>初診・再診・予約変更</small>
          <strong>受診前のご連絡はこちら</strong>
          <Link href="/reserve">Web予約 <ArrowUpRight aria-hidden /></Link>
          <a href={CLINIC.telHref}><Phone aria-hidden /> {CLINIC.tel}</a>
        </div>
      </div>
      <div className="site-container footer-bottom">
        <span>&copy; {CLINIC.legalName}</span>
        <Link href="/privacy">プライバシーポリシー</Link>
      </div>
    </footer>
  );
}
