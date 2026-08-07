"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateContactStatus } from "@/lib/actions/contact";

const STATUS_LABELS: Record<string, string> = {
  new: "未対応",
  read: "確認済み",
  waiting_patient: "患者返信待ち",
  handled: "対応済み",
  dismissed: "対象外",
};

export function ContactStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      aria-label="対応状況"
      className="rounded-lg border bg-background px-3 py-2 text-sm font-semibold shadow-sm disabled:opacity-50"
      onChange={(e) => {
        const next = e.target.value as "new" | "read" | "waiting_patient" | "handled" | "dismissed";
        startTransition(() => {
          void updateContactStatus(id, next).then(() => router.refresh());
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
