"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

import { deleteFaq, toggleFaqPublish } from "@/lib/actions/operations";
import { Button } from "@/components/ui/button";

export function FaqRowActions({ faq }: { faq: { id: string; question: string; answer: string; category: string; sortOrder: number; isPublished: boolean } }) {
  const [pending, startTransition] = useTransition();
  return <div className="flex items-center gap-1"><Button variant="ghost" size="icon" disabled={pending} aria-label={faq.isPublished ? "非公開にする" : "公開する"} onClick={() => startTransition(() => toggleFaqPublish(faq.id, !faq.isPublished))}>{faq.isPublished ? <EyeOff aria-hidden/> : <Eye aria-hidden/>}</Button><Button asChild variant="ghost" size="icon" aria-label="編集"><Link href={`/admin/faq/${faq.id}/edit`}><Pencil aria-hidden/></Link></Button><Button variant="ghost" size="icon" disabled={pending} aria-label="削除" onClick={() => { if (confirm("このFAQを削除しますか？")) startTransition(() => deleteFaq(faq.id)); }}><Trash2 className="text-destructive" aria-hidden/></Button></div>;
}
