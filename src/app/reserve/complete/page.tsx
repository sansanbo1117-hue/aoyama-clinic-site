import type { Metadata } from "next";
import Link from "next/link";

import { ResendConfirmationButton } from "@/components/resend-confirmation-button";
import { formatSlotTime, getAppointmentByAccessToken } from "@/lib/booking";
import { CLINIC } from "@/lib/clinic-info";

export const metadata: Metadata = { title: "予約完了", robots: { index: false, follow: false } };

export default async function ReservationCompletePage({ searchParams }: { searchParams: Promise<{ token?: string; mail?: string }> }) {
  const params = await searchParams;
  const token = params.token ?? "";
  const mailStatus = params.mail ?? "pending";
  const appointment = await getAppointmentByAccessToken(token);
  if (!appointment) return <div className="mx-auto max-w-xl px-4 py-16"><div className="rounded-3xl border bg-card p-8 text-center"><p className="text-sm font-bold text-primary">予約完了</p><h1 className="mt-3 text-2xl font-bold">予約情報を表示できません</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">予約確認リンクが無効になっています。お手元の予約番号を確認するか、お電話でお問い合わせください。</p><a href={CLINIC.telHref} className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">{CLINIC.tel}へ電話する</a></div></div>;
  return <div className="mx-auto max-w-xl px-4 py-16"><div className="rounded-3xl border border-primary/20 bg-card p-7 shadow-sm sm:p-9"><div className="flex size-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">✓</div><p className="mt-6 text-sm font-bold tracking-[0.16em] text-primary">RESERVATION COMPLETE</p><h1 className="mt-3 text-3xl font-bold">予約が確定しました</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">この画面を保存するか、予約番号をお控えください。</p><p className={`mt-4 rounded-xl p-3 text-sm font-bold ${mailStatus === "sent" ? "bg-secondary text-secondary-foreground" : "bg-amber-50 text-amber-900"}`}>{mailStatus === "sent" ? "確認メールを送信しました。" : mailStatus === "skipped" ? "予約は確定しましたが、確認メールを送信できませんでした。下の再送ボタンをお試しください。" : "確認メールの送信状況を確認しています。"}</p><div className="mt-7 rounded-2xl bg-secondary/40 p-5"><dl className="grid gap-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">予約番号</dt><dd className="font-bold">{appointment.appointmentCode}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">お名前</dt><dd className="font-bold">{appointment.patient.name} 様</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">日時</dt><dd className="font-bold">{appointment.slot.startsAt.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })} {formatSlotTime(appointment.slot.startsAt)}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">送信先</dt><dd className="font-bold">{appointment.patient.email ? appointment.patient.email.replace(/(.{2}).*(@.*)/, "$1***$2") : "未登録"}</dd></div></dl></div><Link href={`/appointments/manage?token=${encodeURIComponent(token)}`} className="mt-6 flex h-12 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">予約の確認・変更・取消</Link><ResendConfirmationButton token={token} /><p className="mt-6 text-xs leading-6 text-muted-foreground">診察開始12時間前までWebから変更・取消できます。急な症状や当日の変更はお電話ください。</p></div></div>;
}
