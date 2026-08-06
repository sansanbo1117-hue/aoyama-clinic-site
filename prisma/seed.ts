import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.newsPost.count();
  if (count > 0) {
    console.log("NewsPost には既にデータがあるため、シードをスキップします。");
    return;
  }

  await prisma.newsPost.createMany({
    data: [
      {
        title: "新しい公式サイトを公開しました",
        body: "青山整形外科クリニックの公式サイトをリニューアルしました。Web予約やよくある質問など、来院前にご確認いただける情報を充実させています。",
        category: "general",
        publishedAt: new Date(),
      },
      {
        title: "R4年8月15日（月）と8月20日（土）は休診です",
        body: "誠に勝手ながら、上記日程は休診とさせていただきます。ご迷惑をおかけしますがよろしくお願いいたします。",
        category: "closure",
        publishedAt: new Date("2022-07-22"),
      },
      {
        title: "R4年5月2日（月）は休診です",
        body: "誠に勝手ながら、上記日程は休診とさせていただきます。ご迷惑をおかけしますがよろしくお願いいたします。",
        category: "closure",
        publishedAt: new Date("2022-04-25"),
      },
      {
        title: "8月14日（土）は休診です",
        body: "誠に勝手ながら、上記日程は休診とさせていただきます。ご迷惑をおかけしますがよろしくお願いいたします。",
        category: "closure",
        publishedAt: new Date("2021-07-30"),
      },
      {
        title: "7月24日（土）は休診です",
        body: "誠に勝手ながら、上記日程は休診とさせていただきます。ご迷惑をおかけしますがよろしくお願いいたします。",
        category: "closure",
        publishedAt: new Date("2021-07-01"),
      },
    ],
  });

  console.log("シードが完了しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
