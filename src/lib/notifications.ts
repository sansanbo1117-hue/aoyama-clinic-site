import { Resend } from "resend";

import { prisma } from "@/lib/prisma";
import { formatSlotTime } from "@/lib/booking";
import { queueStaffNotification } from "@/lib/staff-notifications";

async function markNotificationSkipped(jobId: string, appointmentId: string | null, reason: string) {
  const updated = await prisma.notificationJob.update({ where: { id: jobId }, data: { status: "skipped", lastError: reason } });
  if (appointmentId) {
    await prisma.receptionTask.create({ data: { type: "email_failed", priority: "high", appointmentId, title: "予約メールを送信できませんでした", detail: reason } });
    await queueStaffNotification({ type: "email_failed", dedupeKey: `email-failed:${jobId}`, subject: "予約メール送信失敗", text: "予約メールの送信失敗を確認してください。" });
  }
  return updated;
}

function manageUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/appointments/manage?token=${encodeURIComponent(token)}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(date);
}

export async function processNotificationJob(jobId: string, rawAccessToken?: string) {
  const job = await prisma.notificationJob.findUnique({ where: { id: jobId }, include: { appointment: { include: { patient: true, slot: true, serviceType: true, accessTokens: true } } } });
  if (!job || job.status === "sent" || job.status === "skipped") return job;
  if (!job.appointment?.patient.email) return markNotificationSkipped(job.id, job.appointmentId, "患者メールアドレス未登録");
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return markNotificationSkipped(job.id, job.appointmentId, "RESEND_API_KEY / EMAIL_FROM 未設定");

  const access = job.appointment.accessTokens[0];
  const manageLink = rawAccessToken && access ? manageUrl(rawAccessToken) : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reserve`;
  const subject = job.type === "reminder" ? "【青山整形外科】明日の予約のお知らせ" : job.type === "cancellation" ? "【青山整形外科】予約取消のお知らせ" : job.type === "rescheduled" ? "【青山整形外科】予約変更のお知らせ" : "【青山整形外科】予約が確定しました";
  const body = job.type === "reminder"
    ? `${formatDate(job.appointment.slot.startsAt)} ${formatSlotTime(job.appointment.slot.startsAt)}の予約があります。`
    : job.type === "cancellation"
      ? `${formatDate(job.appointment.slot.startsAt)} ${formatSlotTime(job.appointment.slot.startsAt)}の予約を取り消しました。`
      : job.type === "rescheduled"
        ? `${formatDate(job.appointment.slot.startsAt)} ${formatSlotTime(job.appointment.slot.startsAt)}に予約を変更しました。`
      : `${formatDate(job.appointment.slot.startsAt)} ${formatSlotTime(job.appointment.slot.startsAt)}の予約を承りました。予約番号は ${job.appointment.appointmentCode} です。`;
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: job.appointment.patient.email,
      subject,
      text: `${job.appointment.patient.name} 様\n\n${body}\n\n予約番号：${job.appointment.appointmentCode}\n${job.type === "confirmation" || job.type === "rescheduled" ? `予約の確認・変更・取消：${manageLink}` : "ご不明点は当院までお電話ください。"}\n`,
    }, { idempotencyKey: job.dedupeKey });
    return prisma.notificationJob.update({ where: { id: job.id }, data: { status: "sent", sentAt: new Date(), providerMessageId: result.data?.id ?? null, attempts: { increment: 1 } } });
  } catch (error) {
    return prisma.notificationJob.update({ where: { id: job.id }, data: { status: "failed", lastError: error instanceof Error ? error.message.slice(0, 500) : "送信失敗", attempts: { increment: 1 } } });
  }
}

export async function queueAndProcessPendingNotifications() {
  const jobs = await prisma.notificationJob.findMany({ where: { status: "pending", scheduledFor: { lte: new Date() } }, orderBy: { scheduledFor: "asc" }, take: 20, select: { id: true } });
  return Promise.all(jobs.map((job) => processNotificationJob(job.id)));
}
