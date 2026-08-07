import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "LINKS",
  description: "青山整形外科クリニックの関連リンク集。",
};

const links = [
  { href: "http://www.ofa.or.jp/", label: "大分県サッカー協会" },
  { href: "http://medical.ofa.or.jp/", label: "大分県サッカー協会　スポーツ医学委員会" },
  { href: "http://beppu.ofa.or.jp/pc_index.html", label: "別府市サッカー協会" },
  { href: "http://www.bjdjapan.org/index.html", label: "運動器の10年" },
  { href: "http://vasagey.com/", label: "バサジィ大分" },
  { href: "http://verspah.jp/", label: "ヴェルスパ大分" },
  { href: "http://kyushu-fa.jp/", label: "九州サッカー協会" },
  { href: "http://delight-oita.com/", label: "トルネードアカデミーディライト大分" },
];

export default function LinksPage() {
  return (
    <>
      <PageHero eyebrow="LINKS" title="LINKS" />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10">
      <ul className="mt-8 flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border bg-card p-4 font-semibold text-primary shadow-sm hover:underline"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-6 rounded-lg bg-secondary/40 p-4 text-sm text-muted-foreground">
        リンク先の内容は各運営団体の情報に基づきます。URLが変更されている場合がありますので、あらかじめご了承ください。
      </p>
      </div>
    </>
  );
}
