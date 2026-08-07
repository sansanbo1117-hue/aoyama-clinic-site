import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { processNotificationJob } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { jobId?: string };
  if (!body.jobId) return NextResponse.json({ error: "通知が指定されていません。" }, { status: 400 });
  const source = await prisma.notificationJob.findUnique({ where: { id: body.jobId } });
  if (!source || !source.appointmentId) return NextResponse.json({ error: "通知が見つかりません。" }, { status: 404 });
  const job = await prisma.notificationJob.create({ data: { appointmentId: source.appointmentId, type: source.type, dedupeKey: `staff-resend:${source.id}:${Date.now()}`, scheduledFor: new Date() } });
  const processed = await processNotificationJob(job.id);
  return NextResponse.json({ status: processed?.status ?? "pending", message: processed?.lastError ?? "再送処理を開始しました。" });
}
