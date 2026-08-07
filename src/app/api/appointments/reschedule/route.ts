import { NextResponse } from "next/server";

import { processNotificationJob } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { rescheduleAppointmentByToken } from "@/lib/booking";
import { allowPublicSubmission } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!(await allowPublicSubmission("reschedule"))) {
    return NextResponse.json({ error: "リクエストが集中しています。時間をおいてから、もう一度お試しください。" }, { status: 429 });
  }
  const body = await request.json() as { token?: string; slotId?: string };
  if (!body.token || !body.slotId) return NextResponse.json({ error: "変更先の時間枠を選択してください。" }, { status: 400 });
  try {
    const appointment = await rescheduleAppointmentByToken(body.token, body.slotId);
    const job = await prisma.notificationJob.findFirst({ where: { appointmentId: appointment.id, type: "rescheduled" }, orderBy: { createdAt: "desc" } });
    if (job) await processNotificationJob(job.id, body.token);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "予約を変更できませんでした。" }, { status: 409 });
  }
}
