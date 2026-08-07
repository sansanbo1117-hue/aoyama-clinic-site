import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { createStaffAppointment } from "@/lib/booking";
import { processNotificationJob } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = await request.json();
    const appointment = await createStaffAppointment({ ...input, source: input.source === "front_desk" ? "front_desk" : "phone" });
    const job = await prisma.notificationJob.findFirst({ where: { appointmentId: appointment.id, type: "confirmation" } });
    if (job) await processNotificationJob(job.id);
    return NextResponse.json({ ok: true, appointmentCode: appointment.appointmentCode });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "電話予約を登録できませんでした。" }, { status: 409 });
  }
}
