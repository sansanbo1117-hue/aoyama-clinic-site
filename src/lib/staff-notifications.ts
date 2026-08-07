import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

type StaffNotificationInput = {
  type: "contact" | "appointment_change" | "email_failed" | "task";
  dedupeKey: string;
  contactMessageId?: string;
  subject: string;
  text: string;
};

function enabledTypes(value: string) {
  return new Set(value.split(",").map((item) => item.trim()).filter(Boolean));
}

export async function processStaffNotificationJob(jobId: string) {
  const job = await prisma.staffNotificationJob.findUnique({ where: { id: jobId } });
  if (!job || job.status === "sent" || job.status === "skipped") return job;

  const setting = await prisma.staffNotificationSetting.findUnique({ where: { id: "default" } });
  const destinationEmail = setting?.destinationEmail || process.env.STAFF_NOTIFICATION_EMAIL;
  const isEnabled = setting?.enabled ?? true;
  const types = enabledTypes(setting?.notificationTypes || "contact,appointment_change,email_failed");

  if (!isEnabled || !types.has(job.type)) {
    return prisma.staffNotificationJob.update({
      where: { id: job.id },
      data: { status: "skipped", lastError: "通知設定で無効化されています。" },
    });
  }

  if (!destinationEmail) {
    return prisma.staffNotificationJob.update({
      where: { id: job.id },
      data: { status: "skipped", lastError: "受付通知先メールアドレス未設定" },
    });
  }

  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return prisma.staffNotificationJob.update({
      where: { id: job.id },
      data: { status: "skipped", lastError: "RESEND_API_KEY / EMAIL_FROM 未設定" },
    });
  }

  const details = await prisma.contactMessage.findUnique({ where: { id: job.contactMessageId ?? "" } });
  const subject = details && job.type === "contact" ? `【青山整形外科】新しいお問い合わせ：${details.name}様` : job.type === "email_failed" ? "【青山整形外科】メール送信失敗があります" : "【青山整形外科】受付タスクがあります";

  try {
    await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.EMAIL_FROM,
      to: destinationEmail,
      subject,
      text: job.type === "contact" && details
        ? `${details.name}様からお問い合わせが届きました。\n\n管理画面で内容を確認してください。\n${details.email ? `返信先：${details.email}\n` : ""}${details.phone ? `電話：${details.phone}\n` : ""}`
        : "管理画面を開いて、未対応タスクを確認してください。",
    }, { idempotencyKey: job.dedupeKey });
    return prisma.staffNotificationJob.update({
      where: { id: job.id },
      data: { status: "sent", sentAt: new Date(), attempts: { increment: 1 }, lastError: null },
    });
  } catch (error) {
    return prisma.staffNotificationJob.update({
      where: { id: job.id },
      data: { status: "failed", attempts: { increment: 1 }, lastError: error instanceof Error ? error.message.slice(0, 500) : "スタッフ通知送信失敗" },
    });
  }
}

export async function queueStaffNotification(input: StaffNotificationInput) {
  const job = await prisma.staffNotificationJob.upsert({
    where: { dedupeKey: input.dedupeKey },
    create: { type: input.type, dedupeKey: input.dedupeKey, contactMessageId: input.contactMessageId ?? null },
    update: {},
  });
  return processStaffNotificationJob(job.id);
}

export async function queueContactStaffNotification(contactMessageId: string) {
  return queueStaffNotification({
    type: "contact",
    contactMessageId,
    dedupeKey: `contact:${contactMessageId}`,
    subject: "新しいお問い合わせがあります",
    text: "管理画面で確認してください。",
  });
}
