import Image from "next/image";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "院内紹介",
  description: "青山整形外科クリニックの院内設備のご紹介。",
};

const rooms = [
  { src: "/images/waiting-room.jpg", alt: "待合室", caption: "待合室" },
  { src: "/images/reception.jpg", alt: "受付", caption: "受付" },
  {
    src: "/images/exam-room.jpg",
    alt: "診察室（X-P（CR）、MRIビューア、電子カルテ「イザナミ」を設置）",
    caption: "診察室（X-P（CR）、MRIビューア、電子カルテ「イザナミ」を設置）",
  },
  {
    src: "/images/rehab-room.jpg",
    alt: "リハビリテーション室",
    caption: "リハビリテーション室",
  },
  {
    src: "/images/mri-room.jpg",
    alt: "MRI室（撮影後はデータをCD-Rでお渡しします）",
    caption: "MRI室（撮影後はデータをCD-Rでお渡しします）",
  },
];

export default function FacilityPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <PageHeader title="院内紹介" description="安心して受診いただけるよう院内をご紹介します。" />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((r) => (
          <figure
            key={r.src}
            className="overflow-hidden rounded-xl border bg-card shadow-sm"
          >
            <Image
              src={r.src}
              alt={r.alt}
              width={640}
              height={480}
              className="aspect-4/3 w-full object-cover"
            />
            <figcaption className="p-3 text-sm text-muted-foreground">
              {r.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
