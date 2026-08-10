"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AppointmentLookupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ appointmentCode: "", phone: "", birthDate: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/appointments/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json() as { token?: string; error?: string };
      if (!response.ok || !data.token) throw new Error(data.error ?? "予約を確認できませんでした。");
      router.push(`/appointments/manage?token=${encodeURIComponent(data.token)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "予約を確認できませんでした。");
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
    <label className="block text-sm font-semibold">予約番号<input required value={form.appointmentCode} onChange={(event) => setForm({ ...form, appointmentCode: event.target.value })} placeholder="例：cm123..." className="mt-1 h-12 w-full rounded-lg border bg-background px-3" /></label>
    <label className="block text-sm font-semibold">予約時の電話番号<input required inputMode="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="例：090-0000-0000" className="mt-1 h-12 w-full rounded-lg border bg-background px-3" /></label>
    <label className="block text-sm font-semibold">生年月日<input required type="date" value={form.birthDate} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} className="mt-1 h-12 w-full rounded-lg border bg-background px-3" /></label>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <button type="submit" disabled={busy} className="h-12 w-full rounded-lg bg-primary px-4 font-bold text-primary-foreground disabled:opacity-50">{busy ? "確認中…" : "予約を確認する"}</button>
    <p className="text-xs leading-5 text-muted-foreground">入力内容は予約の照合にのみ使用します。実患者情報をデモ環境へ入力しないでください。</p>
  </form>;
}
