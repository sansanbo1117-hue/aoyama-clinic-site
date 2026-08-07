import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { FaqForm } from "@/components/admin/faq-form";

export default async function AdminEditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const faq = await prisma.faqEntry.findUnique({ where: { id } });
  if (!faq) notFound();
  return <div className="max-w-2xl"><h1 className="text-2xl font-bold text-primary">FAQを編集</h1><div className="mt-6 rounded-2xl border bg-card p-5 shadow-sm sm:p-7"><FaqForm faq={faq}/></div></div>;
}
