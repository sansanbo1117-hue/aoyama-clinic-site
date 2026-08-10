"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { SCHEDULE } from "@/lib/clinic-info";

type Slot = { id: string; startsAt: string; time: string; remaining: number };

function todayInJapan() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function dateLabel(value: string) {
  const date = new Date(`${value}T00:00:00+09:00`);
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", weekday: "short" }).format(date);
}

function weekdayOf(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function isClosedDay(dateStr: string): boolean {
  const schedule = SCHEDULE.find((day) => day.weekday === weekdayOf(dateStr));
  return !schedule || (!schedule.am && !schedule.pm);
}

function secondsUntil(target: number): number {
  return Math.max(0, Math.round((target - Date.now()) / 1000));
}

function getBookingClientId(): string {
  const storageKey = "aoyama-booking-client-id";
  const saved = window.localStorage.getItem(storageKey);
  if (saved) return saved;
  const created = crypto.randomUUID();
  window.localStorage.setItem(storageKey, created);
  return created;
}

export function BookingForm({ horizonDays = 30 }: { horizonDays?: number }) {
  const router = useRouter();
  const dates = useMemo(() => Array.from({ length: horizonDays }, (_, index) => {
    const date = new Date(`${todayInJapan()}T00:00:00+09:00`);
    date.setUTCDate(date.getUTCDate() + index);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
  }), [horizonDays]);
  const [selectedDate, setSelectedDate] = useState(() => dates.find((d) => !isClosedDay(d)) ?? dates[0] ?? todayInJapan());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [holdToken, setHoldToken] = useState("");
  const [holdExpiresAt, setHoldExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [visitType, setVisitType] = useState<"initial" | "followup">("followup");
  const [patientCardNumber, setPatientCardNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotError, setSlotError] = useState("");
  const [formError, setFormError] = useState("");

  function chooseDate(date: string) {
    setSelectedDate(date);
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot(null);
    setHoldToken("");
    setHoldExpiresAt(null);
    setRemainingSeconds(null);
    setSlotError("");
    setFormError("");
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/availability?date=${selectedDate}`, { cache: "no-store" })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data as { slots: Slot[] }; })
      .then((data) => { if (!cancelled) setSlots(data.slots); })
      .catch((e) => { if (!cancelled) { setSlots([]); setSlotError(e instanceof Error ? e.message : "空き枠を取得できませんでした。"); } })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [selectedDate]);

  useEffect(() => {
    if (!holdExpiresAt) return;
    const timer = window.setInterval(() => {
      const remaining = Math.round((holdExpiresAt - Date.now()) / 1000);
      if (remaining <= 0) { setHoldToken(""); setHoldExpiresAt(null); setSelectedSlot(null); setRemainingSeconds(null); setSlotError("時間枠の確保時間が切れました。もう一度選択してください。"); }
      else setRemainingSeconds(remaining);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [holdExpiresAt]);

  async function selectSlot(slot: Slot) {
    setBusy(true); setSlotError(""); setFormError("");
    try {
      const response = await fetch("/api/booking/hold", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slotId: slot.id, clientId: getBookingClientId() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const expiresAt = new Date(data.expiresAt).getTime();
      setSelectedSlot(slot); setHoldToken(data.holdToken); setHoldExpiresAt(expiresAt);
      setRemainingSeconds(secondsUntil(expiresAt));
    } catch (e) { setSlotError(e instanceof Error ? e.message : "時間枠を確保できませんでした。"); }
    finally { setBusy(false); }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!holdToken) { setSlotError("先に診察時間を選択してください。"); return; }
    setBusy(true); setFormError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/booking/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, holdToken, visitType }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      router.push(`/reserve/complete?token=${encodeURIComponent(data.manageToken)}&mail=${encodeURIComponent(data.mailStatus ?? "pending")}`);
    } catch (e) { setFormError(e instanceof Error ? e.message : "予約を確定できませんでした。"); }
    finally { setBusy(false); }
  }

  return <form onSubmit={submit} className="space-y-8">
    <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"><p className="text-sm font-bold text-primary">01　受診内容</p><h2 className="mt-2 text-xl font-bold">初診・再診を選択</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{([['followup','再診'],['initial','初診']] as const).map(([value, label]) => <label key={value} className={`cursor-pointer rounded-2xl border-2 p-4 transition ${visitType === value ? "border-primary bg-secondary/40" : "border-border hover:border-primary/40"}`}><input type="radio" name="visitType" value={value} checked={visitType === value} onChange={() => setVisitType(value)} className="sr-only" /><span className="font-bold">{label}</span><span className="mt-1 block text-sm text-muted-foreground">{value === "initial" ? "初めて受診される方" : "通院中・受診歴のある方"}</span></label>)}</div></section>
    <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"><p className="text-sm font-bold text-primary">02　日時を選択</p><h2 className="mt-2 text-xl font-bold">空いている診察枠から選ぶ</h2><div className="mt-5 flex gap-2 overflow-x-auto pb-2">{dates.map((date) => { const closed = isClosedDay(date); return <button type="button" key={date} disabled={closed} onClick={() => chooseDate(date)} aria-pressed={selectedDate === date} className={`min-w-[82px] rounded-xl border px-3 py-3 text-sm font-bold ${closed ? "cursor-not-allowed border-border bg-muted text-muted-foreground" : selectedDate === date ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary"}`}>{dateLabel(date)}{closed && <span className="mt-0.5 block text-xs font-normal">休診</span>}</button>; })}</div><div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">{loadingSlots ? <p className="col-span-full text-sm text-muted-foreground">空き枠を確認しています…</p> : slots.length ? slots.map((slot) => <button type="button" key={slot.id} onClick={() => selectSlot(slot)} disabled={busy} aria-pressed={selectedSlot?.id === slot.id} className={`rounded-xl border px-3 py-3 text-sm font-bold ${selectedSlot?.id === slot.id ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary"}`}><span>{slot.time}</span><span className="mt-0.5 block text-[11px] font-normal">残り{slot.remaining}名</span></button>) : <p className="col-span-full rounded-xl bg-muted p-4 text-sm text-muted-foreground">この日の空き枠はありません。別の日を選択してください。</p>}</div>{slotError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">{slotError}</p>}{holdToken && selectedSlot && remainingSeconds !== null && <p className={`mt-4 rounded-xl p-3 text-sm font-bold ${remainingSeconds <= 60 ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-900"}`}>{selectedDate} {selectedSlot.time} を確保中です。残り{Math.floor(remainingSeconds / 60)}分{String(remainingSeconds % 60).padStart(2, "0")}秒以内に入力を完了してください。</p>}</section>
    <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-7"><p className="text-sm font-bold text-primary">03　患者情報</p><h2 className="mt-2 text-xl font-bold">予約確定に必要な情報</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">お名前<span className="ml-1 text-primary">*</span><input required name="name" className="mt-2 h-12 w-full rounded-lg border bg-background px-3" /></label><label className="text-sm font-semibold">ふりがな<input name="nameKana" className="mt-2 h-12 w-full rounded-lg border bg-background px-3" /></label><label className="text-sm font-semibold">電話番号<span className="ml-1 text-primary">*</span><input required name="phone" inputMode="tel" className="mt-2 h-12 w-full rounded-lg border bg-background px-3" /></label><label className="text-sm font-semibold">メールアドレス<span className="ml-1 text-primary">*</span><input required type="email" name="email" className="mt-2 h-12 w-full rounded-lg border bg-background px-3" /><span className="mt-1 block text-xs font-normal text-muted-foreground">予約確定・前日リマインドをお送りします</span></label><label className="text-sm font-semibold">生年月日{patientCardNumber && <span className="ml-1 text-primary">*</span>}<input name="birthDate" type="date" required={Boolean(patientCardNumber)} className="mt-2 h-12 w-full rounded-lg border bg-background px-3" /></label><label className="text-sm font-semibold">診察券番号（お持ちの方）<input name="patientCardNumber" value={patientCardNumber} onChange={(e) => setPatientCardNumber(e.target.value)} className="mt-2 h-12 w-full rounded-lg border bg-background px-3" /><span className="mt-1 block text-xs font-normal text-muted-foreground">入力する場合は生年月日もあわせてご入力ください（本人確認のため）</span></label></div><label className="mt-4 block text-sm font-semibold">伝えておきたいこと<textarea name="notes" rows={3} className="mt-2 w-full rounded-lg border bg-background p-3" /></label><label className="mt-5 flex gap-3 text-sm"><input required type="checkbox" name="consent" className="mt-1 size-4" />個人情報の取り扱いに同意します。</label></section>
    {formError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{formError}</p>}
    <button type="submit" disabled={busy || !holdToken} className="h-14 w-full rounded-xl bg-primary px-6 text-lg font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50">{busy ? "処理中…" : "この内容で予約を確定する"}</button>
    <p className="text-center text-xs leading-6 text-muted-foreground">発熱・強い痛み・外傷など、急を要する場合はWeb予約を使わずお電話ください。</p>
  </form>;
}
