"use client";

import { useEffect, useMemo, useState } from "react";

type Slot = { id: string; time: string };

function datesInJapan() {
  const today = new Date();
  return Array.from({ length: 14 }, (_, index) => { const date = new Date(today); date.setUTCDate(date.getUTCDate() + index); return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date); });
}

export function RescheduleForm({ token }: { token: string }) {
  const dates = useMemo(() => datesInJapan(), []);
  const [date, setDate] = useState(dates[1] ?? dates[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { fetch(`/api/availability?date=${date}`, { cache: "no-store" }).then((response) => response.json()).then((data) => setSlots(data.slots ?? [])).catch(() => setError("空き枠を取得できませんでした。")); }, [date]);
  async function change(slotId: string) { setBusy(true); setError(""); try { const response = await fetch("/api/appointments/reschedule", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, slotId }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setDone(true); window.location.reload(); } catch (e) { setError(e instanceof Error ? e.message : "予約を変更できませんでした。"); } finally { setBusy(false); } }
  if (done) return <p className="mt-4 rounded-xl bg-secondary p-4 text-sm font-bold">予約を変更しました。</p>;
  return <div className="mt-6 border-t pt-6"><h2 className="font-bold">日時を変更する</h2><div className="mt-4 flex gap-2 overflow-x-auto pb-2">{dates.map((item) => <button type="button" key={item} onClick={() => setDate(item)} className={`min-w-[76px] rounded-lg border px-3 py-2 text-xs font-bold ${date === item ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}>{item.slice(5).replace("-", "/")}</button>)}</div><div className="mt-3 grid grid-cols-3 gap-2">{slots.map((slot) => <button type="button" key={slot.id} disabled={busy} onClick={() => change(slot.id)} className="rounded-lg border px-3 py-2 text-sm font-bold hover:border-primary">{slot.time}</button>)}</div>{!slots.length && <p className="mt-3 text-xs text-muted-foreground">この日の空き枠はありません。</p>}{error && <p className="mt-3 text-sm text-red-700">{error}</p>}</div>;
}
