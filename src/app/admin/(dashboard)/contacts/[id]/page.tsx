import Link from "next/link";
import { ArrowLeft, Mail, Phone, UserRound } from "lucide-react";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ContactDetailForm } from "@/components/admin/contact-detail-form";
import { ResendContactNotificationButton } from "@/components/admin/resend-contact-notification-button";

function datetimeLocal(date: Date | null) {
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo", dateStyle: "short", timeStyle: "short" }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}T${value.hour}:${value.minute}`;
}

const statusLabels: Record<string, string> = { new: "未対応", read: "確認済み", waiting_patient: "患者返信待ち", handled: "対応済み", dismissed: "対象外" };

export default async function AdminContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contact = await prisma.contactMessage.findUnique({ where: { id }, include: { events: { orderBy: { createdAt: "desc" } } } });
  if (!contact) notFound();

  const notificationJobs = await prisma.staffNotificationJob.findMany({ where: { contactMessageId: id }, orderBy: { createdAt: "desc" } });

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin/contacts" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"><ArrowLeft aria-hidden />受信箱へ戻る</Link>
      <div className="flex flex-wrap gap-2"><ResendContactNotificationButton id={id} /></div>
    </div>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5">
          <div><p className="text-xs font-bold tracking-[0.16em] text-primary">INQUIRY</p><h1 className="mt-1 text-2xl font-bold">{contact.name}様のお問い合わせ</h1><p className="mt-2 text-sm text-muted-foreground">受信：{contact.createdAt.toLocaleString("ja-JP")}</p></div>
          <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground">{statusLabels[contact.status] ?? contact.status}</span>
        </div>
        <div className="mt-6 rounded-xl bg-muted p-4 text-sm leading-7 whitespace-pre-wrap">{contact.message}</div>
        <div className="mt-6"><ContactDetailForm id={contact.id} status={contact.status} priority={contact.priority} dueAt={datetimeLocal(contact.dueAt)} responseChannel={contact.responseChannel ?? ""} responseSummary={contact.responseSummary ?? ""} internalNote={contact.internalNote ?? ""} /></div>
      </section>
      <aside className="space-y-4">
        <section className="rounded-2xl border bg-card p-5 shadow-sm"><h2 className="font-bold">連絡先</h2><div className="mt-4 space-y-3 text-sm">{contact.phone ? <a href={`tel:${contact.phone}`} className="flex items-center gap-3 font-bold text-primary hover:underline"><Phone aria-hidden />{contact.phone}</a> : <p className="text-muted-foreground">電話番号なし</p>}{contact.email ? <a href={`mailto:${contact.email}`} className="flex items-center gap-3 break-all font-bold text-primary hover:underline"><Mail aria-hidden />{contact.email}</a> : <p className="text-muted-foreground">メールアドレスなし</p>}<Link href="/admin/patients" className="flex items-center gap-3 font-bold text-primary hover:underline"><UserRound aria-hidden />患者マスターで確認</Link></div></section>
        <section className="rounded-2xl border bg-card p-5 shadow-sm"><h2 className="font-bold">対応履歴</h2><div className="mt-4 space-y-4">{contact.events.length ? contact.events.map((event) => <div key={event.id} className="border-l-2 border-secondary pl-3"><p className="text-sm font-bold">{event.eventType === "created" ? "受信" : event.eventType === "completed" ? "対応済み" : event.eventType === "note" ? "メモ" : event.eventType}</p><p className="mt-1 text-xs text-muted-foreground">{event.createdAt.toLocaleString("ja-JP")}</p>{event.detail && <p className="mt-1 text-sm whitespace-pre-wrap">{event.detail}</p>}</div>) : <p className="text-sm text-muted-foreground">履歴はありません。</p>}</div></section>
        <section className="rounded-2xl border bg-card p-5 shadow-sm"><h2 className="font-bold">通知履歴</h2><div className="mt-4 space-y-2">{notificationJobs.length ? notificationJobs.map((job) => <div key={job.id} className="flex items-center justify-between gap-3 text-xs"><span>{job.createdAt.toLocaleString("ja-JP")}</span><span className="rounded-full bg-muted px-2 py-1 font-bold">{job.status}</span></div>) : <p className="text-sm text-muted-foreground">通知ジョブはありません。</p>}</div></section>
      </aside>
    </div>
  </div>;
}
