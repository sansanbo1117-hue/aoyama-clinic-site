import Link from "next/link";
import { Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaqRowActions } from "@/components/admin/faq-row-actions";

export default async function AdminFaqPage() {
  const faqs = await prisma.faqEntry.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.16em] text-primary">CONTENT</p><h1 className="mt-1 text-2xl font-bold">FAQ管理</h1><p className="mt-1 text-sm text-muted-foreground">電話でよく聞かれる内容を、病院側で更新できます。</p></div><Button asChild><Link href="/admin/faq/new"><Plus aria-hidden/>FAQを追加</Link></Button></div>{faqs.length ? <div className="mt-6 space-y-3">{faqs.map((faq) => <div key={faq.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-sm"><Badge variant={faq.isPublished ? "success" : "outline"}>{faq.isPublished ? "公開中" : "非公開"}</Badge><span className="text-xs text-muted-foreground">#{faq.sortOrder}</span><span className="min-w-0 flex-1 font-bold">{faq.question}</span><FaqRowActions faq={faq}/></div>)}</div> : <div className="mt-6 rounded-2xl border bg-card p-6 text-sm text-muted-foreground">現在は初期FAQを表示しています。ここで編集したFAQが追加されると、公開ページが管理内容に切り替わります。</div>}</div>;
}
