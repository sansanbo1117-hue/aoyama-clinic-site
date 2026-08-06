import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { ReservationForm } from "@/components/reservation-form";

export const metadata: Metadata = {
  title: "Web予約",
  description: "青山整形外科クリニックのWeb予約（初診・再診・予約変更・キャンセル）。",
};

export default function ReservePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PageHeader
        title="Web予約"
        description="初診・再診のご予約、予約の変更・キャンセルを受け付けています。"
      />
      <div className="mt-8">
        <ReservationForm />
      </div>
    </div>
  );
}
