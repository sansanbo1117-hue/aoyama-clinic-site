import Image from "next/image";
import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "院長紹介",
  description: "青山整形外科クリニック院長 内田六郎、スタッフの紹介。",
};

export default function DoctorPage() {
  return (
    <>
      <PageHero eyebrow="DOCTOR" title="院長・スタッフ紹介" />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <section className="mt-8 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          <Image
            src="/images/dr-uchida.jpg"
            alt="院長　内田六郎"
            width={384}
            height={288}
            className="mx-auto w-48 shrink-0 rounded-xl object-cover sm:mx-0"
          />
          <div>
            <p className="text-2xl font-bold">内田　六郎</p>
            <p className="mt-1 text-muted-foreground">整形外科医（院長）</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "日本整形外科学会専門医",
                "日本整形外科認定スポーツ医",
                "日体協公認スポーツドクター",
                "日本医師会認定健康スポーツ医",
              ].map((badge) => (
                <Badge key={badge} variant="secondary">
                  {badge}
                </Badge>
              ))}
            </div>

            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm sm:text-base">
              <li>九州サッカー協会　医学委員会　委員長</li>
              <li>別府市サッカー協会　医学委員会　委員長</li>
              <li>大分県陸上競技「チーム大分」メンバー</li>
            </ul>

            <div className="mt-5">
              <h2 className="font-bold text-primary">院長からのメッセージ</h2>
              <p className="mt-2 text-sm leading-relaxed sm:text-base">
                地域のみなさまが、痛みや違和感を我慢せず早めにご相談いただけるクリニックを目指しています。
                一般的な骨折・捻挫の治療はもちろん、スポーツをされる方の競技復帰や障害予防にも力を入れています。
                お気軽にご相談ください。
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="font-bold text-primary">活動実績</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  数多くのプロスポーツ競技の会場ドクターを経験。JFLヴェルスパ大分のメディカルフォロー、大分県陸上競技の国体選手のメディカルフォローを担当。
                </p>
              </div>
              <div>
                <h3 className="font-bold text-primary">スポーツ履歴</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  サッカー（別府シニアサッカー現役選手）、陸上、テニス、水泳、自転車（ロード）など多種目。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-primary">スタッフ</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm">
            <Image
              src="/images/staff-moriyama.jpg"
              alt="森山浩次"
              width={416}
              height={312}
              className="w-28 shrink-0 rounded-lg object-cover"
            />
            <div>
              <p className="text-lg font-bold">森山　浩次</p>
              <p className="text-sm text-muted-foreground">理学療法士</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                <li>大分県サッカー協会　スポーツ医学委員会　委員</li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                スポーツ履歴：野球、サッカー　他
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-xl border bg-card p-5 shadow-sm">
            <Image
              src="/images/staff-murakami.jpg"
              alt="村上雄大"
              width={320}
              height={240}
              className="w-28 shrink-0 rounded-lg object-cover"
            />
            <div>
              <p className="text-lg font-bold">村上　雄大</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                <li>大分県サッカー協会　スポーツ医学委員会　委員</li>
                <li>大分ヒートデビルズ　スクールコーチ</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-4 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          その他スタッフ構成：理学療法士　3〜4名／鍼灸マッサージ師　1名／看護師　2名／放射線技師　1名／事務　5名（体制は変動することがあります。最新の人員体制はお電話にてご確認ください）。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-primary">整形外科専門医について</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          （日本整形外科学会発行の患者様向けパンフレットより）
        </p>
        <p className="mt-4 leading-relaxed">
          整形外科専門医は、運動器の病気やケガを治療し、健康を守る専門家です。運動器とは骨、靭帯、筋肉、脊椎脊髄、手足の神経・血管などをひとまとめにした呼び方です。整形外科専門医は、常に最新の医学を取り入れ、質の高い医療を皆様に提供するように努めています。
        </p>
        <p className="mt-3 leading-relaxed">
          手、足や背骨などの身体に痛みがある場合や、ケガをした時には、早い機会に、整形外科専門医の正しい診察と治療を受けましょう。
        </p>
        <h3 className="mt-5 font-bold">主な診療対象</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm sm:text-base">
          <li>骨折や捻挫などの外傷（上肢、下肢や体幹部の骨折、捻挫など）</li>
          <li>
            関節の病気・リウマチ（股関節、膝関節、足関節、肩関節、肘関節、手関節などの加齢性の関節症、リウマチや外傷など）
          </li>
        </ul>
      </section>
      </div>
    </>
  );
}
