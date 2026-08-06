import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "院長・スタッフだより",
  description: "院長の談話室・スタッフ日記など、クリニックからの日々の話題。",
};

const directorPosts = [
  {
    date: "2018-03-28",
    body: "ヴェルスパ大分のキックオフパーティーにて、福島新太選手と木島悠選手と一緒に。",
  },
  {
    date: "2018-02-27",
    body: "キックオフパーティーにて、須藤監督とチーフトレーナーの高瀬さんと。",
  },
  {
    date: "2018-02-27",
    body: "キックオフパーティーにて、梶谷選手と新加入の中野選手、最上川選手と談笑。",
  },
  {
    date: "2018-02-27",
    body: "キックオフパーティーにて、#24 FW木島悠選手と。",
  },
  {
    date: "2018-02-27",
    body: "JFLヴェルスパ大分キックオフパーティーに参加。新たに須藤監督を迎え、過去最高34名の選手で今期もJFLを戦います。当院はヴェルスパ大分を応援しています。",
  },
];

const staffPosts = [
  {
    date: "2021-04-24",
    author: "事務長",
    body: "新型コロナウイルス感染防止対策として、待合室の密状態を避けるため、初めての方・お久しぶりの受診の方・他症状での診察希望の方の診察が予約制になりました。ご迷惑をおかけしますが、ご理解のほどお願い申し上げます。",
  },
  {
    date: "2017-09-12",
    author: "事務長",
    body: "当院で治療されていた患者様のご家族より、高田少年野球スポーツ少年団が県学童軟式野球で優勝したとのご報告をいただきました。治療に真面目に取り組まれたご本人とご家族の頑張りの賜物です。おめでとうございます。",
  },
  {
    date: "2017-08-25",
    author: "事務長",
    body: "小学生のサッカーチームのメディカルチェックを実施しました。暑い中、引率の保護者の方、選手の皆さんお疲れ様でした。",
  },
];

export default function ColumnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PageHeader title="院長・スタッフだより" />

      <section className="mt-8">
        <h2 className="text-xl font-bold text-primary">院長の談話室</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {directorPosts.map((post, i) => (
            <li key={i} className="rounded-xl border bg-card p-4 shadow-sm">
              <time className="text-sm text-muted-foreground">{post.date}</time>
              <p className="mt-1">{post.body}</p>
              <p className="mt-1 text-sm text-muted-foreground">院長</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-primary">スタッフ日記</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {staffPosts.map((post, i) => (
            <li key={i} className="rounded-xl border bg-card p-4 shadow-sm">
              <time className="text-sm text-muted-foreground">{post.date}</time>
              <p className="mt-1">{post.body}</p>
              <p className="mt-1 text-sm text-muted-foreground">{post.author}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
