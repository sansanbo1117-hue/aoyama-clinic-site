"use client";

import { useState, useTransition } from "react";

import { deleteCancelledReservation } from "@/lib/actions/reservation";

export function ReservationDeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function remove() {
    if (!window.confirm("この取消済み予約を完全に削除します。元に戻せません。削除しますか？")) return;
    setError("");
    startTransition(async () => {
      try {
        await deleteCancelledReservation(id);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "予約を削除できませんでした。");
      }
    });
  }

  return (
    <div className="mt-3 text-right">
      <button
        type="button"
        disabled={isPending}
        onClick={remove}
        className="min-h-11 rounded-lg border border-red-200 bg-background px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? "削除中…" : "この取消済み予約を完全に削除"}
      </button>
      {error ? <p className="mt-2 text-xs font-semibold text-red-700" role="alert">{error}</p> : null}
    </div>
  );
}
