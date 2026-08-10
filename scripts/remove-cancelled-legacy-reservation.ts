import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const target = {
    id: "cmshdrcls0000ky04msqhhyfy",
    requestCode: "LEGACY-cmshdrcls0000ky04msqhhyfy",
    status: "cancelled",
  } as const;

  const deleted = await prisma.reservation.deleteMany({ where: target });
  const remaining = await prisma.reservation.count({
    where: { id: target.id, requestCode: target.requestCode },
  });

  if (remaining !== 0) throw new Error("指定予約を削除できませんでした。");
  console.log(`Cancelled legacy reservation cleanup: deleted=${deleted.count}, remaining=${remaining}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
