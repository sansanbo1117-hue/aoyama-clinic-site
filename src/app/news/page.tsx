import Link from "next/link";
import type { Metadata } from "next";

import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { NEWS_CATEGORIES } from "@/lib/validations";

export const metadata: Metadata = {
  title: "お知らせ",
  description: "青山整形外科クリニックからのお知らせ一覧。",
};

export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function NewsListPage() {
  let news: Awaited<ReturnType<typeof prisma.newsPost.findMany>> = [];
  try {
    news = await prisma.newsPost.findMany({
      where: { isPublished: true, OR: [{ publishUntil: null }, { publishUntil: { gt: new Date() } }] },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    news = [];
  }

  return (
    <>
      <PageHero eyebrow="NEWS" title="お知らせ" />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10">
      {news.length === 0 ? (
        <p className="mt-8 rounded-xl border bg-card p-6 text-muted-foreground">
          現在、お知らせはありません。
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {news.map((n) => {
            const cat = NEWS_CATEGORIES.find((c) => c.value === n.category);
            return (
              <li key={n.id}>
                <Link
                  href={`/news/${n.id}`}
                  className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm hover:border-primary sm:flex-row sm:items-center sm:gap-4"
                >
                  <time
                    dateTime={n.publishedAt.toISOString()}
                    className="shrink-0 text-sm text-muted-foreground"
                  >
                    {n.publishedAt.toLocaleDateString("ja-JP")}
                  </time>
                  {cat && <Badge variant="secondary">{cat.label}</Badge>}
                  <span className="font-semibold">{n.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </>
  );
}
