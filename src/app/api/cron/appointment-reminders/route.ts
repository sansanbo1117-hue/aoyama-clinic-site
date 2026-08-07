import { NextResponse } from "next/server";

import { ensureDefaultBookingSetup } from "@/lib/booking";
import { queueAndProcessPendingNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

function tomorrowRange() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date()).map((part) => [part.type, part.value]));
  const today = new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00+09:00`);
  today.setUTCDate(today.getUTCDate() + 1);
  const next = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(today);
  return { from: new Date(`${next}T00:00:00+09:00`), to: new Date(`${next}T23:59:59+09:00`) };
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureDefaultBookingSetup();
    const { from, to } = tomorrowRange();
    const appointments = await prisma.appointment.findMany({ where: { status: "confirmed", slot: { startsAt: { gte: from, lte: to } } }, select: { id: true } });
    for (const appointment of appointments) await prisma.notificationJob.upsert({ where: { dedupeKey: `reminder:${appointment.id}:${from.toISOString().slice(0, 10)}` }, update: {}, create: { appointmentId: appointment.id, type: "reminder", dedupeKey: `reminder:${appointment.id}:${from.toISOString().slice(0, 10)}`, scheduledFor: new Date() } });
    const processed = await queueAndProcessPendingNotifications();
    return NextResponse.json({ queued: appointments.length, processed: processed.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "リマインド処理に失敗しました。" }, { status: 500 });
  }
}
