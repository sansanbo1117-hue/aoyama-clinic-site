import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { getJapanDate, formatSlotTime } from "@/lib/booking";
import { ReceptionStatusSelect } from "@/components/admin/reception-status-select";
import { TaskCompleteButton } from "@/components/admin/task-complete-button";

function dayRange(date: string) {
  return { from: new Date(`${date}T00:00:00+09:00`), to: new Date(`${date}T23:59:59+09:00`) };
}

export default async function AdminDashboardPage() {
  const today = getJapanDate();
  const { from, to } = dayRange(today);
  const [pendingReservations, openReservations, newContacts, confirmedAppointments, todaysAppointments, tasks] = await Promise.all([
    prisma.reservation.count({ where: { status: "pending" } }),
    prisma.reservation.count({ where: { status: { in: ["in_review", "awaiting_patient"] } } }),
    prisma.contactMessage.count({ where: { status: { in: ["new", "read", "waiting_patient"] } } }),
    prisma.appointment.count({ where: { status: "confirmed" } }),
    prisma.appointment.findMany({ where: { slot: { startsAt: { gte: from, lte: to } }, status: { notIn: ["cancelled_by_patient", "cancelled_by_clinic"] } }, include: { patient: true, slot: true }, orderBy: { slot: { startsAt: "asc" } } }),
    prisma.receptionTask.findMany({ where: { status: "open" }, include: { patient: true }, orderBy: [{ priority: "desc" }, { createdAt: "asc" }], take: 5 }),
  ]);

  const cards = [
    {
      href: "/admin/reservations",
      label: "未対応の予約依頼",
      value: pendingReservations,
    },
    { href: "/admin/reservations", label: "対応中の予約", value: openReservations },
    { href: "/admin/contacts", label: "未対応のお問い合わせ", value: newContacts },
    { href: "/admin/schedule", label: "確定済みWeb予約", value: confirmedAppointments },
  ];

  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold tracking-[0.16em] text-primary">受付ホーム</p><h1 className="mt-1 text-2xl font-bold">今日の受付ボード</h1><p className="mt-1 text-sm text-muted-foreground">{today}　予約と受付状況をここで確認します。</p></div><div className="flex w-full gap-2 sm:w-auto"><Link href="/admin/patients/new" className="flex min-h-12 flex-1 items-center justify-center rounded-lg border px-4 py-3 text-sm font-bold hover:bg-secondary sm:flex-none">患者を登録</Link><Link href="/admin/appointments/new" className="flex min-h-12 flex-1 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground sm:flex-none">＋電話予約</Link></div></div><div className="mt-6 grid gap-3 sm:grid-cols-4">{cards.map((c) => <Link key={c.label} href={c.href}><Card className="min-h-28 transition-colors hover:border-primary"><CardContent className="pt-4"><p className="text-xs text-muted-foreground">{c.label}</p><p className="mt-1 text-2xl font-bold text-primary">{c.value}</p></CardContent></Card></Link>)}</div><div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]"><section className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="flex items-center justify-between border-b px-4 py-4"><div><h2 className="font-bold">本日の予約</h2><p className="mt-1 text-xs text-muted-foreground">時間順・Web／電話／窓口を一つに表示</p></div><Link href="/admin/reservations" className="text-sm font-bold text-primary hover:underline">一覧を見る</Link></div>{todaysAppointments.length ? <div className="divide-y">{todaysAppointments.map((appointment) => <div key={appointment.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[76px_minmax(0,1fr)_auto] sm:items-center"><div className="text-xl font-bold text-primary">{formatSlotTime(appointment.slot.startsAt)}</div><div><p className="font-bold">{appointment.patient.name} 様 <span className="ml-2 rounded-full bg-secondary px-2 py-1 text-[11px] text-secondary-foreground">{appointment.source === "web" ? "Web" : appointment.source === "phone" ? "電話" : "窓口"}</span></p><p className="mt-1 text-xs text-muted-foreground">{appointment.visitType === "initial" ? "初診" : "再診"}　予約番号 {appointment.appointmentCode}</p></div><ReceptionStatusSelect id={appointment.id} value={appointment.receptionStatus} /></div>)}</div> : <p className="p-8 text-center text-sm text-muted-foreground">本日の予約はありません。</p>}</section><aside className="rounded-2xl border bg-card p-4 shadow-sm"><h2 className="font-bold">要対応</h2><p className="mt-1 text-xs text-muted-foreground">放置すると受付が止まる項目</p><div className="mt-4 space-y-3">{tasks.length ? tasks.map((task) => <div key={task.id} className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950"><p className="font-bold">{task.title}</p><p className="mt-1 text-xs">{task.patient?.name ?? "患者未特定"}</p><TaskCompleteButton id={task.id} /></div>) : <p className="rounded-xl bg-secondary/40 p-3 text-sm text-muted-foreground">対応事項はありません。</p>}</div></aside></div></div>;
}
