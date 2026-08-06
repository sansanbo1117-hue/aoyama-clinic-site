"use client";

import { useTransition } from "react";

import { updateContactStatus } from "@/lib/actions/contact";

const STATUS_LABELS: Record<string, string> = {
  new: "未対応",
  read: "確認済み",
  handled: "対応済み",
};

export function ContactStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      aria-label="対応状況"
      className="rounded-lg border bg-background px-3 py-2 text-sm font-semibold shadow-sm disabled:opacity-50"
      onChange={(e) => {
        const next = e.target.value as "new" | "read" | "handled";
        startTransition(() => {
          updateContactStatus(id, next);
        });
      }}
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
