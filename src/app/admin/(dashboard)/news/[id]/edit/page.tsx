import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { NewsForm } from "@/components/admin/news-form";

export default async function AdminEditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = await prisma.newsPost.findUnique({ where: { id } });

  if (!news) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-primary">お知らせを編集</h1>
      <div className="mt-6">
        <NewsForm news={news} />
      </div>
    </div>
  );
}
