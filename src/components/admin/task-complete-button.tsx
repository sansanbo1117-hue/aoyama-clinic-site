"use client";

import { useState } from "react";

export function TaskCompleteButton({ id }: { id: string }) {
  const [done, setDone] = useState(false);
  async function complete() { const response = await fetch("/api/admin/tasks/complete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); if (response.ok) setDone(true); }
  if (done) return <span className="text-xs font-bold text-primary">完了</span>;
  return <button type="button" onClick={complete} className="mt-2 text-xs font-bold text-primary underline underline-offset-2">対応済みにする</button>;
}
