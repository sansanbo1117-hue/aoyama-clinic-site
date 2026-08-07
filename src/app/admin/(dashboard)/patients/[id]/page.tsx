import Link from "next/link";
import { notFound } from "next/navigation";

import { PatientForm } from "@/components/admin/patient-form";
import { formatSlotTime } from "@/lib/booking";
import { prisma } from "@/lib/prisma";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const patient = await prisma.patient.findUnique({ where: { id: (await params).id }, include: { appointments: { include: { slot: true }, orderBy: { confirmedAt: "desc" }, take: 20 } } });
  if (!patient) notFound();
  return <div className="mx-auto max-w-2xl"><Link href="/admin/patients" className="text-sm font-bold text-primary hover:underline">← 患者台帳へ戻る</Link><div className="mt-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-bold tracking-[0.16em] text-primary">PATIENT DETAIL</p><h1 className="mt-1 text-2xl font-bold">{patient.name}</h1><p className="mt-1 text-sm text-muted-foreground">患者ID：{patient.id}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${patient.chartLinkStatus === "linked" ? "bg-secondary text-secondary-foreground" : "bg-amber-50 text-amber-800"}`}>{patient.chartLinkStatus === "linked" ? "カルテ紐付済" : "カルテ未紐付"}</span></div><div className="mt-6"><PatientForm patient={patient} /></div><section className="mt-6 rounded-2xl border bg-card p-5 shadow-sm"><h2 className="font-bold">予約履歴</h2>{patient.appointments.length ? <div className="mt-3 divide-y">{patient.appointments.map((appointment) => <div key={appointment.id} className="flex justify-between gap-4 py-3 text-sm"><span>{appointment.slot.startsAt.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })} {formatSlotTime(appointment.slot.startsAt)}</span><span className="font-bold">{appointment.source === "web" ? "Web" : appointment.source === "phone" ? "電話" : "窓口"}</span></div>)}</div> : <p className="mt-3 text-sm text-muted-foreground">予約履歴はありません。</p>}</section></div>;
}
