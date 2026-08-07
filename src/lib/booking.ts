import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import { encryptPatientCardNumber, getPatientCardLookupHash, normalizePatientCardNumber } from "@/lib/pii";
import { queueStaffNotification } from "@/lib/staff-notifications";
import { SCHEDULE } from "@/lib/clinic-info";

const JST = "Asia/Tokyo";
const SERVICE_CODE = "outpatient";
const HOLD_MINUTES = 5;
const ACTIVE_APPOINTMENT_STATUSES = ["confirmed", "checked_in"];

// Web予約の枠は「診療終了時刻」ではなく「新患の受付終了時刻」を上限にする（Step7・安全側）。
// 受付終了後に予約が取れてしまい、来院時に断られる事態を防ぐ。曜日別の時刻は
// clinic-info.ts の SCHEDULE のみが情報源（ここに時刻を直接書かない）。
export const WEEKLY_RULES: [number, string, string][] = SCHEDULE.flatMap((day) => {
  const rules: [number, string, string][] = [];
  if (day.am) rules.push([day.weekday, day.am.start, day.am.newPatientUntil]);
  if (day.pm) rules.push([day.weekday, day.pm.start, day.pm.newPatientUntil]);
  return rules;
});

function dateParts(date: Date) {
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: JST, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
  }).formatToParts(date).map((part) => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, weekday: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[values.weekday as "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat"] };
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function jstDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+09:00`);
}

function tokenHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function randomToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function getJapanDate(date = new Date()) {
  return dateParts(date).date;
}

export function formatSlotTime(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: JST, hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
}

export async function ensureDefaultBookingSetup() {
  const service = await prisma.serviceType.upsert({
    where: { code: SERVICE_CODE },
    update: {},
    create: {
      code: SERVICE_CODE,
      name: "一般外来",
      bookingMode: "instant",
      defaultDurationMinutes: 20,
      defaultCapacity: 1,
      bookingHorizonDays: 30,
      minLeadMinutes: 60,
      cancellationCutoffHours: 12,
    },
  });

  for (const [weekday, startTime, endTime] of WEEKLY_RULES) {
    await prisma.scheduleRule.upsert({
      where: { serviceTypeId_weekday_startTime_endTime: { serviceTypeId: service.id, weekday, startTime, endTime } },
      update: {},
      create: { serviceTypeId: service.id, weekday, startTime, endTime, slotMinutes: 20, capacity: 1 },
    });
  }

  const now = new Date();
  const rules = await prisma.scheduleRule.findMany({ where: { serviceTypeId: service.id, isActive: true } });
  const slots: { serviceTypeId: string; startsAt: Date; endsAt: Date; capacity: number }[] = [];
  for (let offset = 0; offset <= service.bookingHorizonDays; offset += 1) {
    const day = addDays(now, offset);
    const { date, weekday } = dateParts(day);
    for (const rule of rules.filter((item) => item.weekday === weekday)) {
      const start = jstDateTime(date, rule.startTime);
      const end = jstDateTime(date, rule.endTime);
      for (let cursor = start.getTime(); cursor + rule.slotMinutes * 60_000 <= end.getTime(); cursor += rule.slotMinutes * 60_000) {
        const startsAt = new Date(cursor);
        slots.push({ serviceTypeId: service.id, startsAt, endsAt: new Date(cursor + rule.slotMinutes * 60_000), capacity: rule.capacity });
      }
    }
  }
  if (slots.length) {
    await prisma.appointmentSlot.createMany({ data: slots, skipDuplicates: true });
  }
  return service;
}

export async function getBookingHorizonDays(): Promise<number> {
  try {
    const service = await prisma.serviceType.findUnique({ where: { code: SERVICE_CODE }, select: { bookingHorizonDays: true } });
    return service?.bookingHorizonDays ?? 30;
  } catch (error) {
    console.error("Failed to load booking horizon", error instanceof Error ? error.message : error);
    return 30;
  }
}

export async function getAvailability(date?: string) {
  // 重いスロット生成(ensureDefaultBookingSetup)はここでは呼ばない。
  // Cron・管理画面の「今後の枠を整える」からのみ実行する（Step4: 未認証の読み取りパスを保護）。
  const service = await prisma.serviceType.findUnique({ where: { code: SERVICE_CODE } });
  if (!service) return [];
  const requestedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getJapanDate();
  const from = jstDateTime(requestedDate, "00:00");
  const to = jstDateTime(requestedDate, "23:59");
  const now = new Date(Date.now() + service.minLeadMinutes * 60_000);
  const slots = await prisma.appointmentSlot.findMany({
    where: { serviceTypeId: service.id, startsAt: { gte: from, lte: to }, status: "open" },
    include: { appointments: { where: { status: { in: ACTIVE_APPOINTMENT_STATUSES } }, select: { id: true } }, holds: { where: { consumedAt: null, expiresAt: { gt: new Date() } }, select: { id: true } } },
    orderBy: { startsAt: "asc" },
  });
  return slots.filter((slot) => slot.startsAt >= now && slot.appointments.length + slot.holds.length < slot.capacity).map((slot) => ({
    id: slot.id, startsAt: slot.startsAt.toISOString(), endsAt: slot.endsAt.toISOString(), time: formatSlotTime(slot.startsAt), remaining: slot.capacity - slot.appointments.length - slot.holds.length,
  }));
}

export async function holdSlot(slotId: string, clientKey?: string) {
  const rawToken = randomToken();
  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000);
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "AppointmentSlot" WHERE id = ${slotId} FOR UPDATE`;
    const slot = await tx.appointmentSlot.findUnique({ where: { id: slotId } });
    if (!slot || slot.status !== "open") throw new Error("この時間枠は受付を終了しています。");
    const [appointments, holds] = await Promise.all([
      tx.appointment.count({ where: { slotId, status: { in: ACTIVE_APPOINTMENT_STATUSES } } }),
      tx.slotHold.count({ where: { slotId, consumedAt: null, expiresAt: { gt: new Date() } } }),
    ]);
    if (appointments + holds >= slot.capacity) throw new Error("この時間枠は埋まりました。別の時間を選んでください。");
    // 同一クライアントが複数枠を同時に確保できないよう、既存の未消費ホールドは失効させる
    // （全枠を確保し続けてWeb予約を機能停止させる攻撃を防ぐ）。
    if (clientKey) {
      await tx.slotHold.updateMany({
        where: { clientKey, consumedAt: null, expiresAt: { gt: new Date() } },
        data: { expiresAt: new Date() },
      });
    }
    await tx.slotHold.create({ data: { slotId, tokenHash: tokenHash(rawToken), clientKey, expiresAt } });
  });
  return { holdToken: rawToken, expiresAt: expiresAt.toISOString() };
}

export type ConfirmBookingInput = {
  holdToken: string; visitType: "initial" | "followup"; name: string; nameKana?: string; phone: string; email: string; birthDate?: string; patientCardNumber?: string; notes?: string;
};

export async function confirmBooking(input: ConfirmBookingInput) {
  const hash = tokenHash(input.holdToken);
  const accessToken = randomToken();
  const appointment = await prisma.$transaction(async (tx) => {
    const hold = await tx.slotHold.findUnique({ where: { tokenHash: hash } });
    if (!hold || hold.consumedAt || hold.expiresAt <= new Date()) throw new Error("予約画面の有効期限が切れました。時間を選び直してください。");
    await tx.$queryRaw`SELECT id FROM "AppointmentSlot" WHERE id = ${hold.slotId} FOR UPDATE`;
    const slot = await tx.appointmentSlot.findUnique({ where: { id: hold.slotId } });
    if (!slot || slot.status !== "open") throw new Error("この時間枠は受付を終了しています。");
    const count = await tx.appointment.count({ where: { slotId: slot.id, status: { in: ACTIVE_APPOINTMENT_STATUSES } } });
    if (count >= slot.capacity) throw new Error("この時間枠は埋まりました。別の時間を選んでください。");
    const card = input.patientCardNumber ? normalizePatientCardNumber(input.patientCardNumber) : "";
    const birthDate = input.birthDate || null;
    // 診察券番号は連番で推測できるため、番号の一致だけでは本人確認にならない。
    // 生年月日も一致した場合のみ既存レコードとみなし、氏名・生年月日は上書きしない
    // （改名や生年月日の訂正は受付での本人確認を経る）。不一致の場合は新規レコードを作り、
    // 受付タスクで人が突合する（Step5）。
    const candidate = card ? await tx.patient.findFirst({ where: { patientCardNumberLookupHash: getPatientCardLookupHash(card) } }) : null;
    let savedPatient;
    let identityMismatch = false;

    if (candidate) {
      const identityMatches = Boolean(candidate.birthDate) && Boolean(birthDate) && candidate.birthDate === birthDate;
      if (identityMatches) {
        savedPatient = await tx.patient.update({ where: { id: candidate.id }, data: { phone: input.phone, email: input.email } });
      } else {
        identityMismatch = true;
        savedPatient = await tx.patient.create({
          data: {
            name: input.name, nameKana: input.nameKana || null, phone: input.phone, email: input.email, birthDate,
            patientCardNumberEncrypted: encryptPatientCardNumber(card),
            patientCardNumberLookupHash: getPatientCardLookupHash(card),
            patientCardNumberLast4: card.slice(-4),
          },
        });
      }
    } else {
      // 診察券番号なし（または該当なし）：電話番号＋生年月日が完全一致する既存患者がいれば紐付ける。
      const phoneMatch = birthDate ? await tx.patient.findFirst({ where: { phone: input.phone, birthDate } }) : null;
      savedPatient = phoneMatch
        ? await tx.patient.update({ where: { id: phoneMatch.id }, data: { email: input.email } })
        : await tx.patient.create({
            data: {
              name: input.name, nameKana: input.nameKana || null, phone: input.phone, email: input.email, birthDate,
              ...(card ? { patientCardNumberEncrypted: encryptPatientCardNumber(card), patientCardNumberLookupHash: getPatientCardLookupHash(card), patientCardNumberLast4: card.slice(-4) } : {}),
            },
          });
    }

    const created = await tx.appointment.create({ data: { patientId: savedPatient.id, serviceTypeId: slot.serviceTypeId, slotId: slot.id, visitType: input.visitType, notes: input.notes || null }, include: { patient: true, slot: true, serviceType: true } });
    await tx.slotHold.update({ where: { id: hold.id }, data: { consumedAt: new Date() } });
    // 予約確認・変更・取消リンクの有効期限は「診察日の7日後」まで（来院より前に切れないようにする）。
    await tx.appointmentAccessToken.create({ data: { appointmentId: created.id, tokenHash: tokenHash(accessToken), expiresAt: new Date(slot.startsAt.getTime() + 7 * 24 * 60 * 60_000) } });
    await tx.appointmentEvent.create({ data: { appointmentId: created.id, eventType: "confirmed", actorType: "patient_web" } });
    if (identityMismatch) {
      await tx.receptionTask.create({
        data: {
          type: "identity_check",
          priority: "high",
          patientId: savedPatient.id,
          appointmentId: created.id,
          title: "診察券番号と生年月日が一致しません",
          detail: "入力された診察券番号は既存患者と一致しましたが、生年月日が異なるため新規レコードとして登録しました。本人確認のうえ、重複していないか確認してください。",
        },
      });
    }
    await tx.notificationJob.create({ data: { appointmentId: created.id, type: "confirmation", dedupeKey: `confirmation:${created.id}`, scheduledFor: new Date() } });
    if (savedPatient.chartLinkStatus !== "linked") await tx.receptionTask.create({ data: { type: "chart_link", patientId: savedPatient.id, appointmentId: created.id, title: "カルテ患者番号を紐付けてください", detail: "来院時にカルテ番号を確認してください。" } });
    return created;
  });
  return { appointment, manageToken: accessToken };
}

export async function getAppointmentByAccessToken(rawToken: string) {
  if (!rawToken) return null;
  const access = await prisma.appointmentAccessToken.findFirst({ where: { tokenHash: tokenHash(rawToken), revokedAt: null, expiresAt: { gt: new Date() } }, include: { appointment: { include: { patient: true, slot: { include: { serviceType: true } } } } } });
  return access?.appointment ?? null;
}

export async function cancelAppointmentByToken(rawToken: string, reason = "患者によるWeb取消") {
  const access = await prisma.appointmentAccessToken.findFirst({ where: { tokenHash: tokenHash(rawToken), revokedAt: null, expiresAt: { gt: new Date() } }, include: { appointment: { include: { serviceType: true, slot: true } } } });
  if (!access) throw new Error("予約確認リンクが無効です。");
  if (access.appointment.status !== "confirmed") throw new Error("この予約はすでに変更されています。");
  if (access.appointment.slot.startsAt.getTime() - Date.now() < access.appointment.serviceType.cancellationCutoffHours * 60 * 60_000) throw new Error("診察開始時刻が近いため、Webからの取消受付を終了しています。お電話でご相談ください。");
  const updated = await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<Array<{ id: string }>>`SELECT id FROM "Appointment" WHERE id = ${access.appointment.id} FOR UPDATE`;
    if (!locked.length) throw new Error("予約が見つかりません。");
    const result = await tx.appointment.update({ where: { id: access.appointment.id }, data: { status: "cancelled_by_patient", cancelledAt: new Date(), cancellationReason: reason } });
    await tx.appointmentEvent.create({ data: { appointmentId: result.id, eventType: "cancelled", actorType: "patient_web", metadata: JSON.stringify({ reason }) } });
    await tx.notificationJob.create({ data: { appointmentId: result.id, type: "cancellation", dedupeKey: `cancellation:${result.id}`, scheduledFor: new Date() } });
    return result;
  });
  await queueStaffNotification({ type: "appointment_change", dedupeKey: `appointment-change:cancel:${updated.id}:${updated.cancelledAt?.getTime() ?? Date.now()}`, subject: "予約取消", text: "患者から予約取消がありました。" });
  return updated;
}

export async function rescheduleAppointmentByToken(rawToken: string, newSlotId: string) {
  const access = await prisma.appointmentAccessToken.findFirst({ where: { tokenHash: tokenHash(rawToken), revokedAt: null, expiresAt: { gt: new Date() } }, include: { appointment: { include: { serviceType: true, slot: true } } } });
  if (!access) throw new Error("予約確認リンクが無効です。");
  if (access.appointment.status !== "confirmed") throw new Error("この予約はすでに変更されています。");
  if (access.appointment.slot.startsAt.getTime() - Date.now() < access.appointment.serviceType.cancellationCutoffHours * 60 * 60_000) throw new Error("診察開始時刻が近いため、Webからの変更受付を終了しています。お電話でご相談ください。");
  const updated = await prisma.$transaction(async (tx) => {
    const slotIds = [access.appointment.slotId, newSlotId].sort();
    for (const slotId of slotIds) await tx.$queryRaw`SELECT id FROM "AppointmentSlot" WHERE id = ${slotId} FOR UPDATE`;
    const newSlot = await tx.appointmentSlot.findUnique({ where: { id: newSlotId } });
    if (!newSlot || newSlot.serviceTypeId !== access.appointment.serviceTypeId || newSlot.status !== "open") throw new Error("選択した時間枠は受付できません。");
    const [appointments, holds] = await Promise.all([
      tx.appointment.count({ where: { slotId: newSlotId, status: { in: ACTIVE_APPOINTMENT_STATUSES }, NOT: { id: access.appointment.id } } }),
      tx.slotHold.count({ where: { slotId: newSlotId, consumedAt: null, expiresAt: { gt: new Date() } } }),
    ]);
    if (appointments + holds >= newSlot.capacity) throw new Error("選択した時間枠は埋まりました。別の時間を選んでください。");
    const result = await tx.appointment.update({ where: { id: access.appointment.id }, data: { slotId: newSlotId } });
    await tx.appointmentEvent.create({ data: { appointmentId: result.id, eventType: "rescheduled", actorType: "patient_web", metadata: JSON.stringify({ fromSlotId: access.appointment.slotId, toSlotId: newSlotId }) } });
    await tx.notificationJob.create({ data: { appointmentId: result.id, type: "rescheduled", dedupeKey: `rescheduled:${result.id}:${newSlotId}:${Date.now()}`, scheduledFor: new Date() } });
    return result;
  });
  await queueStaffNotification({ type: "appointment_change", dedupeKey: `appointment-change:reschedule:${updated.id}:${updated.slotId}:${Date.now()}`, subject: "予約変更", text: "患者から予約変更がありました。" });
  return updated;
}

export type StaffAppointmentInput = {
  slotId: string;
  patientId?: string;
  visitType: "initial" | "followup";
  name: string;
  nameKana?: string;
  phone: string;
  email?: string;
  birthDate?: string;
  patientCardNumber?: string;
  chartNumber?: string;
  source: "phone" | "front_desk" | "staff";
  notes?: string;
};

export async function createStaffAppointment(input: StaffAppointmentInput) {
  const card = input.patientCardNumber ? normalizePatientCardNumber(input.patientCardNumber) : "";
  const chart = input.chartNumber ? normalizePatientCardNumber(input.chartNumber) : "";
  const appointment = await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "AppointmentSlot" WHERE id = ${input.slotId} FOR UPDATE`;
    const slot = await tx.appointmentSlot.findUnique({ where: { id: input.slotId } });
    if (!slot || slot.status !== "open") throw new Error("この診療枠は受付できません。");
    const [appointments, holds] = await Promise.all([
      tx.appointment.count({ where: { slotId: input.slotId, status: { in: ACTIVE_APPOINTMENT_STATUSES } } }),
      tx.slotHold.count({ where: { slotId: input.slotId, consumedAt: null, expiresAt: { gt: new Date() } } }),
    ]);
    if (appointments + holds >= slot.capacity) throw new Error("この診療枠は埋まりました。別の時間を選んでください。");
    const patient = input.patientId ? await tx.patient.findUnique({ where: { id: input.patientId } }) : card ? await tx.patient.findFirst({ where: { patientCardNumberLookupHash: getPatientCardLookupHash(card) } }) : null;
    const patientData = { name: input.name, nameKana: input.nameKana || null, phone: input.phone, email: input.email || null, birthDate: input.birthDate || null, ...(card ? { patientCardNumberEncrypted: encryptPatientCardNumber(card), patientCardNumberLookupHash: getPatientCardLookupHash(card), patientCardNumberLast4: card.slice(-4) } : {}), ...(chart ? { chartNumberEncrypted: encryptPatientCardNumber(chart), chartNumberLookupHash: getPatientCardLookupHash(chart), chartNumberLast4: chart.slice(-4), chartSystem: "aoyama-clinic", chartLinkStatus: "linked", chartVerifiedAt: new Date() } : {}) };
    const savedPatient = patient ? await tx.patient.update({ where: { id: patient.id }, data: patientData }) : await tx.patient.create({ data: patientData });
    const created = await tx.appointment.create({ data: { patientId: savedPatient.id, serviceTypeId: slot.serviceTypeId, slotId: slot.id, visitType: input.visitType, source: input.source, notes: input.notes || null, receptionStatus: "booked" }, include: { patient: true, slot: true, serviceType: true } });
    await tx.appointmentEvent.create({ data: { appointmentId: created.id, eventType: "created", actorType: `staff_${input.source}` } });
    if (savedPatient.email) await tx.notificationJob.create({ data: { appointmentId: created.id, type: "confirmation", dedupeKey: `confirmation:${created.id}`, scheduledFor: new Date() } });
    if (savedPatient.chartLinkStatus !== "linked") await tx.receptionTask.create({ data: { type: "chart_link", patientId: savedPatient.id, appointmentId: created.id, title: "カルテ患者番号を紐付けてください", detail: "来院時にカルテ番号を確認してください。" } });
    return created;
  });
  return appointment;
}

export async function updateReceptionStatus(id: string, receptionStatus: string) {
  const allowed = ["booked", "arrived", "waiting", "in_consultation", "payment_waiting", "completed"];
  if (!allowed.includes(receptionStatus)) throw new Error("受付状態が不正です。");
  return prisma.appointment.update({ where: { id }, data: { receptionStatus, ...(receptionStatus === "arrived" ? { checkedInAt: new Date(), status: "checked_in" } : {}), ...(receptionStatus === "completed" ? { completedAt: new Date(), status: "completed" } : {}) } });
}

export async function blockSlot(slotId: string, blocked: boolean) {
  return prisma.appointmentSlot.update({ where: { id: slotId }, data: { status: blocked ? "blocked" : "open" } });
}
