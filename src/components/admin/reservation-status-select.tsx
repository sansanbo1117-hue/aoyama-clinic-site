"use client";

import { useTransition } from "react";

import { updateReservationStatus } from "@/lib/actions/reservation";

const STATUS_LABELS: Record<string, string> = {
  pending: "未対応",
  in_review: "確認中",
  awaiting_patient: "患者連絡待ち",
  confirmed: "確定",
  declined: "受付不可",
  cancelled: "キャンセル",
  done: "対応済み",
};

export function ReservationStatusSelect({
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
        const next = e.target.value as
          | "pending"
          | "in_review"
          | "awaiting_patient"
          | "confirmed"
          | "declined"
          | "cancelled"
          | "done";
        startTransition(() => {
          updateReservationStatus(id, next);
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
