import Image from "next/image";
import type { Metadata } from "next";

import { CLINIC } from "@/lib/clinic-info";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "医院紹介",
  description: "青山整形外科クリニックの医院全景・医院概要のご紹介。",
};

const overviewPhotos = [
  {
    src: "/images/clinic-overview.jpg",
    alt: "クリニック全景（左：リハビリ棟　右：外来診察棟）",
    caption: "クリニック全景（左：リハビリ棟　右：外来診察棟）",
  },
  {
    src: "/images/outpatient-building.jpg",
    alt: "外来棟",
    caption: "外来棟",
  },
  {
    src: "/images/entrance.jpg",
    alt: "玄関前（先代から引き継いだ石灯籠）",
    caption: "玄関前（先代から引き継いだ石灯籠）",
  },
  {
    src: "/images/parking.jpg",
    alt: "駐車場（19台、海側隣接の愛の里駐車場にも8台駐車可）",
    caption: "駐車場（19台、隣接の「愛の里」駐車場にも8台駐車可）",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="ABOUT" title="医院紹介" description="青山整形外科クリニックについて" />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <section className="mt-8">
        <h2 className="text-xl font-bold text-primary">医院全景</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {overviewPhotos.map((p) => (
            <figure
              key={p.src}
              className="overflow-hidden rounded-xl border bg-card shadow-sm"
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={640}
                height={480}
                className="aspect-4/3 w-full object-cover"
              />
              <figcaption className="p-3 text-sm text-muted-foreground">
                {p.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-primary">医院概要</h2>
        <div className="mt-4 overflow-hidden rounded-xl border shadow-sm">
          <table className="w-full border-collapse text-sm sm:text-base">
            <tbody>
              {[
                ["名称", CLINIC.legalName],
                ["住所", CLINIC.fullAddress],
                ["電話番号", CLINIC.tel],
                ["FAX番号", CLINIC.fax],
                ["診療科目", "整形外科、リハビリテーション科"],
                ["駐車場", "19台（隣接の「愛の里」駐車場にも8台駐車可）"],
              ].map(([label, value]) => (
                <tr key={label} className="border-b last:border-b-0 even:bg-muted/40">
                  <th className="w-32 shrink-0 bg-secondary/40 p-3 text-left align-top font-semibold text-primary sm:w-48 sm:p-4">
                    {label}
                  </th>
                  <td className="p-3 sm:p-4">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </>
  );
}
