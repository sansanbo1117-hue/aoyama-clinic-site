import type { Metadata } from "next";
import Link from "next/link";

import { cancelAppointment } from "@/lib/actions/appointment";
import { getAppointmentByAccessToken, formatSlotTime } from "@/lib/booking";
import { CLINIC } from "@/lib/clinic-info";
import { RescheduleForm } from "@/components/reschedule-form";
import { AppointmentLookupForm } from "@/components/appointment-lookup-form";

export const metadata: Metadata = { title: "予約の確認・取消", robots: { index: false, follow: false } };

export default async function AppointmentManagePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  if (!token) return <div className="mx-auto max-w-xl px-4 py-16"><div className="rounded-3xl border bg-card p-7 shadow-sm sm:p-9"><p className="text-sm font-bold tracking-[0.15em] text-primary">RESERVATION SELF SERVICE</p><h1 className="mt-3 text-2xl font-bold">予約の確認・変更・取消</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">予約番号・予約時の電話番号・生年月日を入力すると、メールがなくても予約を確認できます。</p><AppointmentLookupForm /></div></div>;
  const appointment = await getAppointmentByAccessToken(token);
  if (!appointment) return <div className="mx-auto max-w-xl px-4 py-16"><div className="rounded-3xl border bg-card p-7 text-center"><p className="text-sm font-bold text-primary">予約確認・変更・取消</p><h1 className="mt-3 text-2xl font-bold">予約情報を確認できません</h1><p className="mt-3 text-sm leading-7 text-muted-foreground">リンクの有効期限が切れたか、予約が取り消されています。もう一度照合するか、お電話でお問い合わせください。</p><Link href="/appointments/manage" className="mt-6 inline-flex rounded-lg border px-5 py-3 font-bold text-primary">予約を照合する</Link><a href={CLINIC.telHref} className="mt-3 inline-flex rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground">{CLINIC.tel}へ電話する</a></div></div>;
  const isActive = appointment.status === "confirmed";
  return <div className="mx-auto max-w-xl px-4 py-16"><div className="rounded-3xl border bg-card p-7 shadow-sm sm:p-9"><p className="text-sm font-bold tracking-[0.15em] text-primary">RESERVATION</p><h1 className="mt-3 text-2xl font-bold">予約の確認・取消</h1><div className="mt-7 rounded-2xl bg-secondary/40 p-5"><p className="text-sm text-muted-foreground">予約番号</p><p className="mt-1 text-lg font-bold">{appointment.appointmentCode}</p><dl className="mt-5 grid gap-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">お名前</dt><dd className="font-semibold">{appointment.patient.name} 様</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">日時</dt><dd className="font-semibold">{appointment.slot.startsAt.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })} {formatSlotTime(appointment.slot.startsAt)}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">区分</dt><dd className="font-semibold">{appointment.visitType === "initial" ? "初診" : "再診"}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">状態</dt><dd className="font-semibold text-primary">{isActive ? "予約確定" : "取消済み"}</dd></div></dl></div>{isActive ? <><p className="mt-6 text-sm leading-7 text-muted-foreground">診察開始12時間前まで、日時変更・取消ができます。変更すると、元の時間枠は自動的に開放されます。</p><RescheduleForm token={token} /><form action={cancelAppointment} className="mt-6"><input type="hidden" name="token" value={token} /><button type="submit" className="h-12 w-full rounded-lg border-2 border-red-200 bg-background font-bold text-red-700 hover:bg-red-50">この予約を取り消す</button></form></> : <p className="mt-6 text-sm text-muted-foreground">この予約はすでに取り消されています。</p>}<Link href="/reserve" className="mt-6 block text-center text-sm font-bold text-primary hover:underline">新しい予約を取る</Link></div></div>;
}
