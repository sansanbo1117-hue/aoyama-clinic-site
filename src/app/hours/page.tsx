import Link from "next/link";
import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { CLINIC, WEEKLY_HOURS, RECEPTION_HOURS } from "@/lib/clinic-info";

export const metadata: Metadata = {
  title: "診療時間",
  description: "青山整形外科クリニックの診療時間・受付時間・休診日のご案内。",
};

function HoursTable({
  caption,
  rows,
}: {
  caption: string;
  rows: { day: string; am: string | null; pm: string | null }[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <table className="w-full border-collapse text-sm sm:text-base">
        <caption className="bg-primary p-3 text-left font-bold text-primary-foreground">
          {caption}
        </caption>
        <thead>
          <tr className="bg-secondary/50 text-primary">
            <th className="p-3 text-left">曜日</th>
            <th className="p-3 text-left">午前</th>
            <th className="p-3 text-left">午後</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.day} className="border-t">
              <td className="p-3 font-semibold">{row.day}</td>
              <td className="p-3">{row.am ?? <span className="font-bold text-destructive">休診</span>}</td>
              <td className="p-3">{row.pm ?? <span className="font-bold text-destructive">休診</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HoursPage() {
  return (
    <>
      <PageHero eyebrow="HOURS" title="診療時間・休診案内" />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10">
      <section className="mt-8">
        <h2 className="text-xl font-bold text-primary">診療時間</h2>
        <div className="mt-4">
          <HoursTable caption="診療時間" rows={WEEKLY_HOURS} />
        </div>
        <p className="mt-4 rounded-lg bg-secondary/40 p-4 text-sm">
          症状によりますが、リハビリ治療を行う場合は治療終了まで1時間ほど必要です。木曜日の午後は診察・リハビリともに休診です。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-primary">受付時間</h2>
        <div className="mt-4 flex flex-col gap-6">
          <HoursTable caption="新患受付" rows={RECEPTION_HOURS.newPatient} />
          <p className="rounded-lg bg-secondary/40 p-4 text-sm">
            新患・お久しぶりの来院・別部位での診察をご希望の方は、すべて事前のご予約が必要です。
            <Link href="/reserve" className="font-semibold text-primary hover:underline">
              Web予約
            </Link>
            またはお電話（
            <a href={CLINIC.telHref} className="font-semibold text-primary hover:underline">
              {CLINIC.tel}
            </a>
            ）にてご予約のうえご来院ください。
          </p>
          <HoursTable caption="再診受付" rows={RECEPTION_HOURS.returningPatient} />
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            お久しぶりに来院される方は、新患の受付時間が適用されます。
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-primary">休診日・診療時間変更について</h2>
        <p className="mt-3 leading-relaxed">
          平成20（2008）年4月より、木曜日の午後は休診となりました。木曜日の受付時間は午前11時30分までです。
        </p>
        <p className="mt-3 leading-relaxed">
          初めての方は診療・治療に時間がかかりますので、早めのご来院をお願いいたします。
        </p>
        <p className="mt-3 rounded-lg bg-secondary/40 p-4 text-sm">
          祝祭日や学会出席等により、臨時休診・診療時間変更となる場合があります。最新の休診情報は
          <Link href="/news" className="font-semibold text-primary hover:underline">
            お知らせ
          </Link>
          ページまたはお電話でご確認ください。
        </p>
      </section>
      </div>
    </>
  );
}
