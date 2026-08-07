"use client";

import { useActionState } from "react";

import { createFaq, updateFaq } from "@/lib/actions/operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const initialState = { success: false, message: undefined, errors: undefined } as const;

export function FaqForm({ faq }: { faq?: { id: string; question: string; answer: string; category: string; sortOrder: number; isPublished: boolean } }) {
  const action = faq ? updateFaq.bind(null, faq.id) : createFaq;
  const [state, formAction, pending] = useActionState(action, initialState);
  return <form action={formAction} className="space-y-5">
    {state.message && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">{state.message}</p>}
    <div><Label htmlFor="question">質問</Label><Input id="question" name="question" required defaultValue={faq?.question} className="mt-2"/></div>
    <div><Label htmlFor="answer">回答</Label><Textarea id="answer" name="answer" required rows={8} defaultValue={faq?.answer} className="mt-2"/></div>
    <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="category">カテゴリ</Label><Input id="category" name="category" defaultValue={faq?.category ?? "general"} className="mt-2"/></div><div><Label htmlFor="sortOrder">表示順</Label><Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={faq?.sortOrder ?? 0} className="mt-2"/></div></div>
    <label className="flex items-center gap-3 text-sm font-semibold"><Checkbox name="isPublished" defaultChecked={faq?.isPublished ?? true}/>公開する</label>
    <Button type="submit" disabled={pending}>{pending ? "保存中…" : faq ? "FAQを更新" : "FAQを追加"}</Button>
  </form>;
}
