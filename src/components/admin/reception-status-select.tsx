"use client";

import { useState } from "react";

const options = [
  ["booked", "予約済"], ["arrived", "来院済"], ["waiting", "待合中"], ["in_consultation", "診察中"], ["payment_waiting", "会計待"], ["completed", "完了"],
] as const;

export function ReceptionStatusSelect({ id, value }: { id: string; value: string }) {
  const [status, setStatus] = useState(value);
  const [busy, setBusy] = useState(false);
  async function update(next: string) { setBusy(true); const response = await fetch("/api/admin/appointments/reception-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, receptionStatus: next }) }); if (response.ok) setStatus(next); setBusy(false); }
  return <select aria-label="受付状態" value={status} disabled={busy} onChange={(event) => update(event.target.value)} className="h-9 rounded-md border bg-background px-2 text-xs font-bold">{options.map(([option, label]) => <option key={option} value={option}>{label}</option>)}</select>;
}
