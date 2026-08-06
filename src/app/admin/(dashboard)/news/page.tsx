import Link from "next/link";
import { Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { NEWS_CATEGORIES } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NewsRowActions } from "@/components/admin/news-row-actions";

export default async function AdminNewsPage() {
  const news = await prisma.newsPost.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">お知らせ管理</h1>
        <Button asChild size="sm">
          <Link href="/admin/news/new">
            <Plus className="size-4" aria-hidden /> 新規作成
          </Link>
        </Button>
      </div>

      {news.length === 0 ? (
        <p className="mt-6 rounded-xl border bg-card p-6 text-muted-foreground">
          お知らせはまだありません。
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {news.map((n) => {
            const cat = NEWS_CATEGORIES.find((c) => c.value === n.category);
            return (
              <div
                key={n.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"
              >
                <span className="text-sm text-muted-foreground">
                  {n.publishedAt.toLocaleDateString("ja-JP")}
                </span>
                {cat && <Badge variant="secondary">{cat.label}</Badge>}
                <Badge variant={n.isPublished ? "success" : "outline"}>
                  {n.isPublished ? "公開中" : "非公開"}
                </Badge>
                <span className="font-semibold">{n.title}</span>
                <div className="ml-auto">
                  <NewsRowActions id={n.id} isPublished={n.isPublished} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
