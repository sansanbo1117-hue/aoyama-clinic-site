import Image from "next/image";
import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "ダウンロード",
  description: "スポーツ部活動帯同依頼書・メディカルチェックシートなど各種書類のダウンロード。",
};

const files = [
  {
    href: "/downloads/sports-club-visit-request.pdf",
    label: "スポーツ部活動帯同依頼書（スポーツ部活動帯同のお願い）",
    type: "PDF",
  },
  {
    href: "/downloads/sports-health-checksheet.doc",
    label: "スポーツ・ヘルス・チェックシート",
    type: "DOC",
  },
  {
    href: "/downloads/medical-checksheet.pdf",
    label: "メディカルチェックシート（大分県サッカー協会スポーツ医学委員会推奨）",
    type: "PDF",
  },
];

export default function DownloadsPage() {
  return (
    <>
      <PageHero eyebrow="DOWNLOADS" title="ダウンロード" />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10">
      <ul className="mt-8 flex flex-col gap-3">
        {files.map((f) => (
          <li key={f.href}>
            <a
              href={f.href}
              className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm hover:border-primary"
            >
              <FileText className="size-6 shrink-0 text-primary" aria-hidden />
              <span className="font-semibold">{f.label}</span>
              <span className="ml-auto shrink-0 rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
                {f.type}
              </span>
            </a>
          </li>
        ))}
      </ul>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-primary">メディカルチェックシートについて</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-3">
          {[
            { src: "/images/checksheet-1.gif", caption: "メディカルチェックシート（1）" },
            { src: "/images/checksheet-2.gif", caption: "メディカルチェックシート（2）" },
            { src: "/images/checksheet-3.gif", caption: "食事チェック" },
          ].map((img) => (
            <figure key={img.src} className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <Image
                src={img.src}
                alt={img.caption}
                width={530}
                height={750}
                className="w-full object-cover"
              />
              <figcaption className="p-3 text-sm text-muted-foreground">
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-secondary/40 p-4 text-sm">
          未成年のスポーツ障害は早期発見・早期治療が大切です。上記シートで気になる項目があれば、お早めにご相談ください。
        </p>
      </section>
      </div>
    </>
  );
}
