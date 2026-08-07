import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { PageHero } from "@/components/page-hero";
import { FirstVisitFlow } from "@/components/first-visit-flow";
import { CLINIC } from "@/lib/clinic-info";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "診療案内",
  description: "整形外科・リハビリテーション科・スポーツ整形外科の診療内容と予約方法。",
};

export default function MedicalPage() {
  return (
    <>
      <PageHero eyebrow="MEDICAL SERVICES" title="診療案内" />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <section className="mt-8">
        <h2 className="text-xl font-bold text-primary">診療科目</h2>
        <p className="mt-3 leading-relaxed">
          一般整形外科からスポーツ整形外科まで、運動器（骨・関節・靭帯・筋肉・脊椎脊髄・神経・血管）に関わる幅広い診療を行っています。骨折・捻挫などの外傷、関節の病気・リウマチ、スポーツ外傷・障害まで、日本整形外科学会専門医が診察します。
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-primary">初診の流れ</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          初めて受診される方は、以下の流れでご案内します。
        </p>
        <div className="mt-5">
          <FirstVisitFlow />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/reserve">
              Web予約をする <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <a href={CLINIC.telHref}>{CLINIC.tel} に電話する</a>
          </Button>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-primary">リハビリテーション科</h2>
        <p className="mt-3 leading-relaxed">
          当院のリハビリテーション科では、一般整形・スポーツ整形外科の患者様を中心にリハビリテーションを行っています。特にスポーツ外来では、日体協公認スポーツドクターである内田六郎院長の指示のもと、理学療法士と鍼灸・マッサージ師がスポーツ選手の競技復帰に向けたリハビリテーションを行っています。
        </p>
        <p className="mt-3 leading-relaxed">
          スポーツ選手の競技復帰については、病院の中だけでは総合的な判断が難しいため、可能な限りスタッフが現場に出向き、フィールドテスト等を実施したうえで競技復帰を検討しています。高校県体・国民体育大会等へのトレーナー派遣や、競技団体へのメディカルチェックも行い、傷害予防を中心に取り組んでいます。
        </p>

        <h3 className="mt-6 font-bold">リハビリテーション外来予約</h3>
        <p className="mt-2 text-sm leading-relaxed sm:text-base">
          小・中・高の学生が外来数の約4割を占め、特に学校終了後の夕方4時以降が混み合うため、予約制を導入しています。当日予約も可能ですが、状況によりお断りする場合がありますので、早めのご予約をおすすめします。
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full min-w-[420px] border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-secondary/50 text-primary">
                <th className="p-3 text-left">曜日</th>
                <th className="p-3 text-left">受付時間</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["月・火・金曜日", "AM9:00〜11:00　／　PM14:00〜17:00"],
                ["水曜日", "AM9:00〜11:00　／　PM14:00〜18:00"],
                ["木曜日", "AM9:00〜11:00"],
                ["土曜日", "AM9:00〜11:30"],
              ].map(([day, time]) => (
                <tr key={day} className="border-t">
                  <td className="p-3 font-semibold">{day}</td>
                  <td className="p-3">{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-primary">スポーツリハビリ予約</h2>
        <p className="mt-3 leading-relaxed">
          小中高の部活動・体育活動中の障害や、各種スポーツクラブ活動中の障害に対するリハビリトレーニングを行っています。
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          対象競技例：サッカー・野球・ラグビー・バレーボール・卓球・水泳・フットサル・テニス（軟式・硬式）・マラソン・陸上競技・柔道・剣道・格闘技・新体操・バレエ　など
        </p>
        <p className="mt-3">
          予約リハビリの時間は個別にご相談ください。夕方午後5時以降に治療される方は、特にご予約をおすすめします。
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-primary">スポーツ障害予防</h2>
        <p className="mt-3 leading-relaxed">
          未成年のスポーツ障害・成長障害は、公式戦や大きな大会の直前に来院される選手が多く、すでに重症化しているケースも少なくありません。痛みを我慢せず、症状の軽い早い時期に治療に取り組めば、短ければ数日から1週間程度の休養で完治し、復帰できる場合も多くあります。
        </p>
        <p className="mt-3 leading-relaxed">
          自分に障害がないか、起きる手前なのか、すでに治療や休養が必要なのかを簡単にチェックできるのが「メディカルチェックシート」です。大分県サッカー協会スポーツ医学委員会から推奨されているシートで、要望に応じて各クラブチーム単位での出張チェックも行っています。
        </p>
        <Link
          href="/downloads"
          className="mt-3 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          メディカルチェックシートのダウンロード <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
      </div>
    </>
  );
}
