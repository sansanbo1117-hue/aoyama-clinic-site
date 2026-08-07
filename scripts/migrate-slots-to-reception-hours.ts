/**
 * Step7: Web予約枠を受付時間（新患の受付終了時刻）に合わせて整理するための移行スクリプト。
 *
 * 使い方:
 *   npx tsx scripts/migrate-slots-to-reception-hours.ts --dry-run   # 影響件数を確認するだけ（何も変更しない）
 *   npx tsx scripts/migrate-slots-to-reception-hours.ts             # 実際に反映する
 *
 * 必ず --dry-run で影響件数を確認し、既存予約への影響が無いこと・DBのバックアップを
 * 取得済みであることを確認してから、--dry-run なしで実行してください。
 *
 * 行うこと:
 *   1. 受付終了時刻より後で、かつ「予約が入っていない」空き枠を blocked にする。
 *   2. 受付終了時刻より後で、かつ「予約が入っている」枠は一覧表示するだけで変更しない
 *      （クリニック側で患者へ個別連絡してください）。
 *   3. 旧ルール（新しい受付終了時刻より長い終了時刻のScheduleRule）を無効化し、
 *      Cronによる枠の再生成で古い枠が復活しないようにする。
 */
import { prisma } from "../src/lib/prisma";
import { WEEKLY_RULES } from "../src/lib/booking";

const DRY_RUN = process.argv.includes("--dry-run");
const JST = "Asia/Tokyo";
const SERVICE_CODE = "outpatient";

const WEEKDAY_MAP: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function jstWeekdayAndTime(date: Date): { weekday: number; time: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: JST,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );
  return { weekday: WEEKDAY_MAP[parts.weekday], time: `${parts.hour}:${parts.minute}` };
}

function isAllowedUnderNewRules(startsAt: Date): boolean {
  const { weekday, time } = jstWeekdayAndTime(startsAt);
  return WEEKLY_RULES.some(([ruleWeekday, start, end]) => ruleWeekday === weekday && time >= start && time < end);
}

async function main() {
  console.log(DRY_RUN ? "=== dry-run モード（変更は行いません） ===\n" : "=== 実行モード（DBを変更します） ===\n");

  const service = await prisma.serviceType.findUnique({ where: { code: SERVICE_CODE } });
  if (!service) {
    console.log("ServiceType が見つかりません。対象データはありません。");
    return;
  }

  const openSlots = await prisma.appointmentSlot.findMany({
    where: { serviceTypeId: service.id, status: "open" },
    include: {
      appointments: {
        where: { status: { in: ["confirmed", "checked_in"] } },
        include: { patient: { select: { name: true, phone: true } } },
      },
    },
    orderBy: { startsAt: "asc" },
  });

  const outOfHours = openSlots.filter((slot) => !isAllowedUnderNewRules(slot.startsAt));
  const withBooking = outOfHours.filter((slot) => slot.appointments.length > 0);
  const withoutBooking = outOfHours.filter((slot) => slot.appointments.length === 0);

  console.log(`受付終了時刻より後の枠: ${outOfHours.length}件（全${openSlots.length}件中）`);
  console.log(`  うち予約あり: ${withBooking.length}件（自動変更しません）`);
  console.log(`  うち予約なし: ${withoutBooking.length}件（blockedにします）\n`);

  if (withBooking.length) {
    console.log("=== 個別に連絡が必要な予約 ===");
    for (const slot of withBooking) {
      for (const appointment of slot.appointments) {
        console.log(
          `  ${slot.startsAt.toISOString()} / ${appointment.patient.name} 様 (${appointment.patient.phone}) / appointmentId=${appointment.id}`
        );
      }
    }
    console.log("");
  }

  if (withoutBooking.length) {
    if (DRY_RUN) {
      console.log(`(--dry-run のため変更しません。最初の20件のみ表示)`);
      for (const slot of withoutBooking.slice(0, 20)) console.log(`  ${slot.startsAt.toISOString()}`);
      if (withoutBooking.length > 20) console.log(`  ...ほか${withoutBooking.length - 20}件`);
    } else {
      const result = await prisma.appointmentSlot.updateMany({
        where: { id: { in: withoutBooking.map((slot) => slot.id) } },
        data: { status: "blocked" },
      });
      console.log(`${result.count}件を blocked に更新しました。`);
    }
    console.log("");
  }

  const activeRules = await prisma.scheduleRule.findMany({ where: { serviceTypeId: service.id, isActive: true } });
  const staleRules = activeRules.filter(
    (rule) => !WEEKLY_RULES.some(([weekday, start, end]) => weekday === rule.weekday && start === rule.startTime && end === rule.endTime)
  );

  if (staleRules.length) {
    console.log(`=== 旧ルール（新しい受付終了時刻より長い終了時刻） ${staleRules.length}件 ===`);
    for (const rule of staleRules) console.log(`  weekday=${rule.weekday} ${rule.startTime}-${rule.endTime}`);
    if (DRY_RUN) {
      console.log("(--dry-run のため無効化しません)");
    } else {
      await prisma.scheduleRule.updateMany({ where: { id: { in: staleRules.map((rule) => rule.id) } }, data: { isActive: false } });
      console.log("無効化しました。今後のCronでは新しいルールのみが使われます。");
    }
  } else {
    console.log("旧ルールはありません。");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
