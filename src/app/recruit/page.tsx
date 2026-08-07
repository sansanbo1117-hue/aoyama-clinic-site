import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { CLINIC } from "@/lib/clinic-info";

export const metadata: Metadata = {
  title: "採用情報",
  description: "青山整形外科クリニックの採用情報。",
};

export default function RecruitPage() {
  return (
    <>
      <PageHero eyebrow="RECRUIT" title="採用情報" />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10">
      <div className="mt-8 rounded-xl border bg-secondary/40 p-6">
        <p>
          現在、こちらのページで公開できる募集要項はご用意がございません。
          求人・採用に関するお問い合わせは、下記までお電話にてご連絡ください。
        </p>
        <p className="mt-4 font-bold text-primary">
          <a href={CLINIC.telHref} className="hover:underline">
            {CLINIC.tel}
          </a>
          （医療法人青山整形外科クリニック　事務）
        </p>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        募集職種・応募資格・待遇などの詳細情報が確定次第、このページで公開いたします。
      </p>
      </div>
    </>
  );
}
