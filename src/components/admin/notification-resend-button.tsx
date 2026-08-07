"use client";

import { useState } from "react";

export function NotificationResendButton({ id }: { id: string }) {
  const [message, setMessage] = useState("");
  async function resend() { setMessage("処理中…"); const response = await fetch("/api/admin/notifications/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: id }) }); const data = await response.json(); setMessage(response.ok ? (data.status === "sent" ? "送信済み" : data.message) : data.error); }
  return <button type="button" onClick={resend} className="rounded-md border px-3 py-2 text-xs font-bold text-primary hover:bg-secondary">{message || "再送"}</button>;
}
