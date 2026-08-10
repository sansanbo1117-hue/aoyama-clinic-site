import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { BookingForm } from "@/components/booking-form";
import { CLINIC } from "@/lib/clinic-info";
import { getIntakeMode } from "@/lib/clinic-mode";
import { getBookingHorizonDays } from "@/lib/booking";

export const metadata: Metadata = {
  title: "Web予約",
  description: "空いている診察枠を選んで、その場で予約を確定できます。",
};

export const revalidate = 3600;

export default async function ReservePage() {
  const intakeMode = getIntakeMode();
  const horizonDays = intakeMode === "open" ? await getBookingHorizonDays() : 30;

  return (
    <>
      <PageHero
        eyebrow="RESERVATION"
        title="Web予約"
        description="空いている時間から選択し、予約をその場で確定できます。予約確定と前日のリマインドをメールでお知らせします。"
      />
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-4 text-sm shadow-sm">
          <div>
            <p className="font-bold text-primary">すでに予約済みの方</p>
            <p className="mt-1 text-muted-foreground">予約番号・電話番号・生年月日で、メールがなくても確認・変更・取消ができます。</p>
          </div>
          <Link href="/appointments/manage" className="shrink-0 rounded-lg border px-4 py-2 font-bold text-primary hover:bg-secondary">
            予約を確認する
          </Link>
        </div>
        {intakeMode === "open" ? (
          <BookingForm horizonDays={horizonDays} />
        ) : (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-950">
            <p className="font-bold">
              {intakeMode === "maintenance" ? "現在メンテナンス中です" : "Web受付を一時停止しています"}
            </p>
            <p className="mt-2 text-sm">
              受付状況を確認するため、お電話でお問い合わせください。
            </p>
            <a
              href={CLINIC.telHref}
              className="mt-4 inline-flex rounded-lg bg-primary px-4 py-3 font-bold text-primary-foreground"
            >
              {CLINIC.tel}へ電話する
            </a>
          </div>
        )}
      </div>
    </>
  );
}
