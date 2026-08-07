"use client";

import { useState } from "react";

export function ResendConfirmationButton({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function resend() {
    setState("sending");
    setMessage("");
    try {
      const response = await fetch("/api/appointments/confirmation/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setState("sent");
      setMessage(data.status === "skipped" ? "メール設定が未完了のため送信できませんでした。お電話で確認できます。" : "確認メールを再送しました。");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "メールを再送できませんでした。");
    }
  }

  return <div className="mt-4"><button type="button" onClick={resend} disabled={state === "sending"} className="rounded-lg border px-4 py-2 text-sm font-bold text-primary hover:bg-secondary disabled:opacity-50">{state === "sending" ? "送信中…" : "確認メールを再送"}</button>{message && <p className={`mt-2 text-xs ${state === "error" ? "text-red-700" : "text-muted-foreground"}`}>{message}</p>}</div>;
}
