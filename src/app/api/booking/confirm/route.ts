import { NextResponse } from "next/server";

import { confirmBooking } from "@/lib/booking";
import { instantBookingSchema } from "@/lib/validations";
import { processNotificationJob } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { allowPublicSubmission } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!(await allowPublicSubmission("booking-confirm"))) {
    return NextResponse.json({ error: "リクエストが集中しています。時間をおいてから、もう一度お試しください。" }, { status: 429 });
  }
  const parsed = instantBookingSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" }, { status: 400 });
  try {
    const { appointment, manageToken } = await confirmBooking(parsed.data);
    const job = await prisma.notificationJob.findFirst({ where: { appointmentId: appointment.id, type: "confirmation" } });
    const notification = job ? await processNotificationJob(job.id, manageToken) : null;
    return NextResponse.json({ appointmentCode: appointment.appointmentCode, manageToken, mailStatus: notification?.status ?? "pending", startsAt: appointment.slot.startsAt.toISOString() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "予約を確定できませんでした。" }, { status: 409 });
  }
}
