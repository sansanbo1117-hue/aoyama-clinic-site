"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";

import { saveStaffNotificationSettings } from "@/lib/actions/operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const initialState = { success: false, message: undefined, errors: undefined } as const;

export function StaffNotificationSettingsForm({ setting }: { setting?: { destinationEmail: string | null; enabled: boolean; notificationTypes: string } }) {
  const [state, formAction, pending] = useActionState(saveStaffNotificationSettings, initialState);
  return <form action={formAction} className="space-y-5">
    {state.message && <p role="alert" className={state.success ? "rounded-xl bg-secondary p-3 text-sm font-semibold" : "rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive"}>{state.message}</p>}
    <div><Label htmlFor="destinationEmail">受付通知を受け取るメールアドレス</Label><Input id="destinationEmail" name="destinationEmail" type="email" defaultValue={setting?.destinationEmail ?? ""} placeholder="受付用メールアドレス" className="mt-2"/><p className="mt-2 text-xs text-muted-foreground">Resendの送信設定が完了している場合に、新着問い合わせなどを通知します。</p></div>
    <label className="flex items-start gap-3 text-sm font-semibold"><Checkbox name="enabled" defaultChecked={setting?.enabled ?? true} className="mt-0.5"/>スタッフ通知を有効にする</label>
    <div><Label htmlFor="notificationTypes">通知する種類</Label><Input id="notificationTypes" name="notificationTypes" defaultValue={setting?.notificationTypes ?? "contact,appointment_change,email_failed"} className="mt-2"/><p className="mt-2 text-xs text-muted-foreground">contact / appointment_change / email_failed / task をカンマ区切りで指定します。</p></div>
    <Button type="submit" disabled={pending}><Save aria-hidden />{pending ? "保存中…" : "設定を保存"}</Button>
  </form>;
}
