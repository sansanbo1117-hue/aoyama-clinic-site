import { PrismaClient } from "../src/generated/prisma";

if (process.env.DEMO_MODE !== "true") {
  throw new Error("デモ用DBでのみ実行できます。DEMO_MODE=true を設定してください。");
}

const prisma = new PrismaClient();

async function main() {
  const service = await prisma.serviceType.upsert({
    where: { code: "demo-orthopedics" },
    update: { name: "デモ診療予約", isActive: true, defaultCapacity: 3 },
    create: { code: "demo-orthopedics", name: "デモ診療予約", bookingMode: "instant", bookingHorizonDays: 30, defaultDurationMinutes: 20, defaultCapacity: 3 },
  });

  const start = new Date();
  start.setHours(10, 0, 0, 0);
  const slots = [];
  for (let index = 0; index < 6; index += 1) {
    const slotStart = new Date(start.getTime() + index * 30 * 60 * 1000);
    slots.push(await prisma.appointmentSlot.upsert({
      where: { serviceTypeId_startsAt: { serviceTypeId: service.id, startsAt: slotStart } },
      update: { status: "open", capacity: 3 },
      create: { serviceTypeId: service.id, startsAt: slotStart, endsAt: new Date(slotStart.getTime() + 20 * 60 * 1000), capacity: 3 },
    }));
  }

  const patients = [
    { name: "デモ 太郎", nameKana: "デモ タロウ", phone: "090-0000-0001", email: "demo-taro@example.invalid", birthDate: "1980-01-15" },
    { name: "デモ 花子", nameKana: "デモ ハナコ", phone: "090-0000-0002", email: "demo-hanako@example.invalid", birthDate: "1992-06-20" },
    { name: "山田 デモ", nameKana: "ヤマダ デモ", phone: "090-0000-0003", email: "demo-yamada@example.invalid", birthDate: "1975-11-08" },
  ];

  for (const [index, input] of patients.entries()) {
    const existingPatient = await prisma.patient.findFirst({ where: { phone: input.phone } });
    const patient = existingPatient
      ? await prisma.patient.update({ where: { id: existingPatient.id }, data: input })
      : await prisma.patient.create({ data: input });
    const slot = slots[index];
    if (!slot) continue;
    await prisma.appointment.upsert({
      where: { appointmentCode: `DEMO-${index + 1}` },
      update: { patientId: patient.id, slotId: slot.id, serviceTypeId: service.id, source: index === 1 ? "phone" : "web" },
      create: { appointmentCode: `DEMO-${index + 1}`, patientId: patient.id, slotId: slot.id, serviceTypeId: service.id, visitType: index === 0 ? "initial" : "followup", source: index === 1 ? "phone" : "web", notes: "デモ用の架空予約です。" },
    });
  }

  await prisma.newsPost.createMany({
    data: [
      { title: "デモ：午後の診療枠について", body: "これは病院向けデモの架空のお知らせです。", category: "general" },
      { title: "デモ：休診日のお知らせ", body: "これは病院向けデモの架空のお知らせです。", category: "closure" },
    ],
    skipDuplicates: true,
  });

  await prisma.contactMessage.createMany({
    data: [
      { name: "デモ 相談者", phone: "090-0000-0099", email: "contact@example.invalid", message: "これはデモ用のお問い合わせです。", priority: "normal" },
      { name: "デモ 患者", phone: "090-0000-0088", email: "patient@example.invalid", message: "予約変更について相談したいです。", priority: "high" },
    ],
  });

  console.log("デモ用モックデータを投入しました。");
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
