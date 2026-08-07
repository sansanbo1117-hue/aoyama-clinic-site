import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getJapanDate, formatSlotTime } from "@/lib/booking";
import { ReceptionStatusSelect } from "@/components/admin/reception-status-select";
import { TaskCompleteButton } from "@/components/admin/task-complete-button";

function dayRange(date: string) {
  return { from: new Date(`${date}T00:00:00+09:00`), to: new Date(`${date}T23:59:59+09:00`) };
}

function slotState(used: number, capacity: number, status: string) {
  if (status !== "open") return { label: "受付停止", className: "bg-gray-100 text-gray-700" };
  const remaining = Math.max(capacity - used, 0);
  if (remaining === 0) return { label: "満員", className: "bg-red-50 text-red-800" };
  if (remaining === 1) return { label: "残り1名", className: "bg-amber-50 text-amber-900" };
  return { label: `空き${remaining}名`, className: "bg-emerald-50 text-emerald-800" };
}

export default async function AdminDashboardPage() {
  const today = getJapanDate();
  const { from, to } = dayRange(today);
  const service = await prisma.serviceType.findFirst({ where: { code: "outpatient", isActive: true } });
  const [slots, tasks] = await Promise.all([
    service ? prisma.appointmentSlot.findMany({ where: { serviceTypeId: service.id, startsAt: { gte: from, lte: to } }, include: { appointments: { where: { status: { in: ["confirmed", "checked_in"] } }, include: { patient: true }, orderBy: { confirmedAt: "asc" } }, holds: { where: { consumedAt: null, expiresAt: { gt: new Date() } }, select: { id: true } } }, orderBy: { startsAt: "asc" } }) : Promise.resolve([]),
    prisma.receptionTask.findMany({ where: { status: "open" }, include: { patient: true }, orderBy: [{ priority: "desc" }, { createdAt: "asc" }], take: 5 }),
  ]);

  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-bold tracking-[0.16em] text-primary">受付ホーム</p><h1 className="mt-1 text-2xl font-bold">今日の受付</h1><p className="mt-1 text-sm text-muted-foreground">{today}　時間ごとの空きと来院状況を確認します。</p></div>
      <div className="flex w-full gap-2 sm:w-auto"><Link href="/admin/patients/new" className="flex min-h-12 flex-1 items-center justify-center rounded-lg border px-4 py-3 text-sm font-bold hover:bg-secondary sm:flex-none">患者を登録</Link><Link href="/admin/appointments/new" className="flex min-h-12 flex-1 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground sm:flex-none">＋電話予約</Link></div>
    </div>

    <section className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4"><div><h2 className="font-bold">今日の時間枠</h2><p className="mt-1 text-xs text-muted-foreground">空き人数を見て、電話予約や予約なしの受付を判断できます。</p></div><Link href="/admin/schedule" className="text-sm font-bold text-primary hover:underline">枠を詳しく管理</Link></div>
      {slots.length ? <div className="divide-y">{slots.map((slot) => { const used = slot.appointments.length + slot.holds.length; const state = slotState(used, slot.capacity, slot.status); return <div key={slot.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[88px_110px_minmax(0,1fr)_auto] lg:items-center"><div className="text-xl font-bold text-primary">{formatSlotTime(slot.startsAt)}</div><div><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${state.className}`}>{state.label}</span><p className="mt-1 text-xs text-muted-foreground">{used}/{slot.capacity}名</p></div><div className="min-w-0">{slot.appointments.length ? <div className="flex flex-wrap gap-2">{slot.appointments.map((appointment) => <div key={appointment.id} className="rounded-lg border bg-background px-3 py-2 text-sm"><span className="font-bold">{appointment.patient.name} 様</span><span className="ml-2 text-xs text-muted-foreground">{appointment.source === "web" ? "Web" : appointment.source === "phone" ? "電話" : "窓口"}</span><div className="mt-1"><ReceptionStatusSelect id={appointment.id} value={appointment.receptionStatus} /></div></div>)}</div> : <p className="text-sm text-muted-foreground">予約なし・受付可能</p>}</div><Link href="/admin/appointments/new" className="rounded-lg border px-3 py-2 text-center text-xs font-bold hover:bg-secondary">この枠へ電話予約</Link></div>; })}</div> : <p className="p-8 text-center text-sm text-muted-foreground">今日の予約枠はありません。診療枠管理から枠を作成してください。</p>}
    </section>

    {tasks.length > 0 && <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-4"><h2 className="font-bold text-amber-950">例外対応が必要です</h2><p className="mt-1 text-xs text-amber-900">通常の予約受付では処理できない項目だけを表示しています。</p><div className="mt-4 grid gap-3 md:grid-cols-2">{tasks.map((task) => <div key={task.id} className="rounded-xl border border-amber-200 bg-background p-3 text-sm"><p className="font-bold">{task.title}</p><p className="mt-1 text-xs text-muted-foreground">{task.patient?.name ?? "患者未特定"}</p><TaskCompleteButton id={task.id} /></div>)}</div></section>}
  </div>;
}
