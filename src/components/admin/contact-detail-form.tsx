"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { updateContactDetails } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState = { success: false, message: undefined, errors: undefined } as const;

const statuses = [
  ["new", "未対応"],
  ["read", "確認済み"],
  ["waiting_patient", "患者返信待ち"],
  ["handled", "対応済み"],
  ["dismissed", "対象外"],
] as const;

export function ContactDetailForm({
  id,
  status,
  priority,
  dueAt,
  responseChannel,
  responseSummary,
  internalNote,
}: {
  id: string;
  status: string;
  priority: string;
  dueAt: string;
  responseChannel: string;
  responseSummary: string;
  internalNote: string;
}) {
  const [state, formAction, pending] = useActionState(updateContactDetails.bind(null, id), initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.message && (
        <p className={state.success ? "rounded-xl bg-secondary p-3 text-sm font-semibold text-secondary-foreground" : "rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive"} role="alert">
          {state.message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-bold">
          状態
          <select name="status" defaultValue={status} className="mt-2 h-12 w-full rounded-lg border bg-background px-3 text-base">
            {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold">
          優先度
          <select name="priority" defaultValue={priority} className="mt-2 h-12 w-full rounded-lg border bg-background px-3 text-base">
            <option value="high">高</option><option value="normal">通常</option><option value="low">低</option>
          </select>
        </label>
        <label className="text-sm font-bold">
          次回対応期限
          <Input name="dueAt" type="datetime-local" defaultValue={dueAt} className="mt-2" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold">
          対応方法
          <select name="responseChannel" defaultValue={responseChannel} className="mt-2 h-12 w-full rounded-lg border bg-background px-3 text-base">
            <option value="">未選択</option><option value="phone">電話</option><option value="email">メール</option><option value="visit">来院時</option><option value="none">対応不要</option>
          </select>
        </label>
        <div className="flex items-end text-xs leading-6 text-muted-foreground">対応方法と要約を残すと、担当者が変わっても状況が分かります。</div>
      </div>
      <div>
        <Label htmlFor="responseSummary">患者への対応内容</Label>
        <Textarea id="responseSummary" name="responseSummary" rows={4} defaultValue={responseSummary} className="mt-2" placeholder="例：8/8 受付から電話。予約について案内済み。" />
      </div>
      <div>
        <Label htmlFor="internalNote">院内メモ</Label>
        <Textarea id="internalNote" name="internalNote" rows={4} defaultValue={internalNote} className="mt-2" placeholder="患者には表示されないメモ" />
      </div>
      <Button type="submit" disabled={pending}><Save aria-hidden />{pending ? "保存中…" : "対応内容を保存"}</Button>
    </form>
  );
}
