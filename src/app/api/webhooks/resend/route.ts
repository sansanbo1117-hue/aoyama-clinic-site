import { Resend } from "resend";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook is not configured", { status: 503 });
  const rawBody = await request.text();
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const event = resend.webhooks.verify({ payload: rawBody, headers: { id: request.headers.get("svix-id") ?? "", timestamp: request.headers.get("svix-timestamp") ?? "", signature: request.headers.get("svix-signature") ?? "" }, webhookSecret: secret }) as { type: string; data?: { email_id?: string; to?: string[]; reason?: string } };
    const providerEventId = request.headers.get("svix-id");
    if (!providerEventId) return new Response("Missing event id", { status: 400 });
    const job = event.data?.email_id ? await prisma.notificationJob.findFirst({ where: { providerMessageId: event.data.email_id } }) : null;
    await prisma.emailEvent.upsert({ where: { providerEventId }, update: {}, create: { providerEventId, appointmentId: job?.appointmentId ?? null, eventType: event.type, rawPayload: rawBody } });
    if (job && ["email.bounced", "email.failed", "email.suppressed"].includes(event.type)) {
      await prisma.notificationJob.update({ where: { id: job.id }, data: { status: "failed", lastError: event.data?.reason ?? event.type } });
      await prisma.receptionTask.create({ data: { type: "email_failed", priority: "high", appointmentId: job.appointmentId, title: "予約メールが配信されませんでした", detail: event.data?.reason ?? event.type } });
    }
    return Response.json({ ok: true });
  } catch {
    return new Response("Invalid webhook", { status: 400 });
  }
}
