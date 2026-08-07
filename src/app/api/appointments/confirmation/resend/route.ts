import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { getAppointmentByAccessToken } from "@/lib/booking";
import { processNotificationJob } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const body = await request.json() as { token?: string };
  const token = body.token ?? "";
  const appointment = await getAppointmentByAccessToken(token);
  if (!appointment) return NextResponse.json({ error: "予約確認リンクが無効です。" }, { status: 404 });
  const recent = await prisma.notificationJob.findFirst({ where: { appointmentId: appointment.id, dedupeKey: { startsWith: `confirmation-resend:${appointment.id}:` }, createdAt: { gt: new Date(Date.now() - 60_000) } } });
  if (recent) return NextResponse.json({ error: "再送は1分に1回までです。少しお待ちください。" }, { status: 429 });
  const access = await prisma.appointmentAccessToken.findFirst({ where: { tokenHash: hashToken(token), revokedAt: null, expiresAt: { gt: new Date() } } });
  if (!access) return NextResponse.json({ error: "予約確認リンクが無効です。" }, { status: 404 });
  const job = await prisma.notificationJob.create({ data: { appointmentId: appointment.id, type: "confirmation", dedupeKey: `confirmation-resend:${appointment.id}:${crypto.randomUUID()}`, scheduledFor: new Date() } });
  const processed = await processNotificationJob(job.id, token);
  return NextResponse.json({ ok: true, status: processed?.status ?? "pending" });
}
