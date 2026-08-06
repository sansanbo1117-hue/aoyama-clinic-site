import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { NEWS_CATEGORIES } from "@/lib/validations";

export const revalidate = 60;

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await prisma.newsPost.findUnique({ where: { id } });

  if (!news || !news.isPublished) {
    notFound();
  }

  const cat = NEWS_CATEGORIES.find((c) => c.value === news.category);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden /> お知らせ一覧へ戻る
      </Link>

      <article className="mt-6 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <time
            dateTime={news.publishedAt.toISOString()}
            className="text-sm text-muted-foreground"
          >
            {news.publishedAt.toLocaleDateString("ja-JP")}
          </time>
          {cat && <Badge variant="secondary">{cat.label}</Badge>}
        </div>
        <h1 className="mt-3 text-2xl font-bold text-primary">{news.title}</h1>
        <div className="mt-5 leading-relaxed whitespace-pre-wrap">{news.body}</div>
      </article>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await prisma.newsPost.findUnique({ where: { id } });
  return { title: news?.title ?? "お知らせ" };
}
