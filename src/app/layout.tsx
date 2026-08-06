import type { Metadata, Viewport } from "next";

import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CLINIC } from "@/lib/clinic-info";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: `${CLINIC.name}｜大分県別府市の整形外科・スポーツ整形外科`,
    template: `%s｜${CLINIC.name}`,
  },
  description:
    "大分県別府市の青山整形外科クリニック公式サイト。一般整形外科・スポーツ整形外科・リハビリテーション。診療時間・アクセス・院長紹介・Web予約のご案内。",
  applicationName: CLINIC.name,
  keywords: ["整形外科", "別府市", "大分県", "スポーツ整形外科", "リハビリテーション", "青山整形外科クリニック"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: CLINIC.name,
    title: `${CLINIC.name}｜大分県別府市の整形外科・スポーツ整形外科`,
    description:
      "一般整形外科・スポーツ整形外科・リハビリテーション。診療時間・アクセス・院長紹介・Web予約のご案内。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f62b4",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: CLINIC.legalName,
  medicalSpecialty: "Orthopedic",
  address: {
    "@type": "PostalAddress",
    streetAddress: CLINIC.address,
    postalCode: CLINIC.postalCode,
    addressRegion: "大分県",
    addressLocality: "別府市",
    addressCountry: "JP",
  },
  telephone: CLINIC.tel,
  geo: {
    "@type": "GeoCoordinates",
    latitude: CLINIC.lat,
    longitude: CLINIC.lng,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          本文へスキップ
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
