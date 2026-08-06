import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CLINIC } from "@/lib/clinic-info";

export const metadata: Metadata = {
  title: "よくある質問",
  description: "青山整形外科クリニックへのよくある質問（予約・駐車場・診療時間など）。",
};

const faqs = [
  {
    q: "初診ですが、予約は必要ですか？",
    a: "はい。新患の方、お久しぶりの来院、別部位での診察をご希望の方は、すべて事前予約が必要です。お電話またはWeb予約フォームからご予約のうえご来院ください。",
  },
  {
    q: "木曜日は診療していますか？",
    a: "木曜日の午前中は通常通り診療しておりますが、平成20年4月より午後は休診（診察・リハビリとも）となっております。",
  },
  {
    q: "駐車場はありますか？",
    a: "院内駐車場19台分に加え、海側隣接の「愛の里」駐車場にも8台駐車いただけます。",
  },
  {
    q: "クレジットカードは使えますか？",
    a: "現在、健康保険証をご持参のうえ現金でのお支払いをお願いしております。クレジットカード対応については準備中のため、詳細は受付までお問い合わせください。",
  },
  {
    q: "紹介状は必要ですか？",
    a: "当院は診療所のため、紹介状がなくてもご受診いただけます。ただし、初診の方は事前のご予約が必要です。",
  },
  {
    q: "労災保険は対応していますか？",
    a: "労災保険の取り扱いについては受付までご確認ください。",
  },
  {
    q: "スポーツによる怪我のリハビリ予約はできますか？",
    a: "はい。スポーツ外来のリハビリトレーニングは事前予約制です。特に平日夕方5時以降は混み合いますので、お電話でのご予約をおすすめします。",
  },
  {
    q: "MRI検査は受けられますか？",
    a: "はい、院内にMRI室を設置しております。撮影後のデータはCD-Rでお渡し可能です。",
  },
  {
    q: "チーム単位でのメディカルチェックをお願いできますか？",
    a: "はい。ご要望があれば、各クラブチーム単位で土日等を利用したメディカルチェックにも対応しています。詳しくはお電話でご相談ください。",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader title="よくある質問" description="お電話でよくいただくご質問をまとめました。" />

      <div className="mt-8 rounded-2xl border bg-card px-6 shadow-sm">
        <Accordion type="single" collapsible>
          {faqs.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <p className="mt-6 rounded-lg bg-secondary/40 p-4 text-sm">
        上記以外のご質問は、お電話（
        <a href={CLINIC.telHref} className="font-semibold text-primary hover:underline">
          {CLINIC.tel}
        </a>
        ）または
        <a href="/contact" className="font-semibold text-primary hover:underline">
          お問い合わせフォーム
        </a>
        までお気軽にご連絡ください。
      </p>
    </div>
  );
}
