import Image from "next/image";
import Link from "next/link";
import {
  Bone,
  Activity,
  HeartPulse,
  ShieldCheck,
  Users,
  Car,
  ArrowRight,
} from "lucide-react";

import { QuickActions } from "@/components/quick-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { CLINIC, MAP_EMBED_URL } from "@/lib/clinic-info";
import { NEWS_CATEGORIES } from "@/lib/validations";

export const revalidate = 60;

async function getLatestNews() {
  try {
    return await prisma.newsPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
  } catch {
    return [];
  }
}

const departments = [
  {
    icon: Bone,
    title: "一般整形外科",
    desc: "骨折・捻挫などの外傷から、関節疾患・リウマチまで運動器全般を診療します。",
  },
  {
    icon: Activity,
    title: "スポーツ整形外科",
    desc: "日体協公認スポーツドクターの院長のもと、スポーツ外傷・障害の予防から競技復帰まで対応。",
  },
  {
    icon: HeartPulse,
    title: "リハビリテーション科",
    desc: "理学療法士・鍼灸マッサージ師による、競技復帰や日常生活動作の回復をサポート。",
  },
] as const;

const features = [
  {
    icon: ShieldCheck,
    title: "日本整形外科学会専門医",
    desc: "院長は日本整形外科学会専門医・日本整形外科認定スポーツ医の資格を持ち、専門的な診療を行います。",
  },
  {
    icon: Users,
    title: "スポーツ医学に強い体制",
    desc: "九州サッカー協会・別府市サッカー協会の医学委員会委員長を務め、多数の競技団体のメディカルサポート実績があります。",
  },
  {
    icon: Car,
    title: "駐車場19台完備",
    desc: "院内駐車場19台に加え、隣接の「愛の里」駐車場にも8台駐車可能。お車での通院も安心です。",
  },
] as const;

export default async function HomePage() {
  const news = await getLatestNews();

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 pb-16 pt-12 text-primary-foreground sm:pb-20 sm:pt-16">
        <div className="mx-auto max-w-6xl px-4">
          <Badge variant="secondary" className="mb-4">
            大分県別府市の整形外科
          </Badge>
          <h1 className="max-w-2xl text-3xl leading-snug font-bold sm:text-4xl">
            {CLINIC.name}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
            一般整形外科からスポーツ整形外科、リハビリテーションまで。
            日本整形外科学会専門医が診療にあたります。
            初診・お久しぶりの方はお電話またはWeb予約でご連絡ください。
          </p>
        </div>
      </section>

      <QuickActions />

      {/* 診療案内 */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-primary sm:text-3xl">診療案内</h2>
          <Link
            href="/medical"
            className="hidden shrink-0 items-center gap-1 font-semibold text-primary hover:underline sm:flex"
          >
            詳しく見る <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {departments.map((d) => (
            <Card key={d.title}>
              <CardContent className="flex flex-col items-start gap-3 pt-5">
                <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
                  <d.icon className="size-6" aria-hidden />
                </span>
                <h3 className="text-lg font-bold">{d.title}</h3>
                <p className="text-sm text-muted-foreground">{d.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Link
          href="/medical"
          className="mt-6 flex items-center gap-1 font-semibold text-primary hover:underline sm:hidden"
        >
          診療案内を詳しく見る <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>

      {/* 医院の特徴 */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-8 text-2xl font-bold text-primary sm:text-3xl">
            医院の特徴
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col items-start gap-3">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <f.icon className="size-6" aria-hidden />
                </span>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 院長紹介 */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold text-primary sm:text-3xl">院長紹介</h2>
        <div className="flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:p-8">
          <Image
            src="/images/dr-uchida.jpg"
            alt="院長　内田六郎"
            width={384}
            height={288}
            className="mx-auto w-40 shrink-0 rounded-xl object-cover sm:mx-0 sm:w-48"
          />
          <div>
            <p className="text-xl font-bold">院長　内田　六郎</p>
            <p className="mt-1 text-sm text-muted-foreground">
              整形外科医／日本整形外科学会専門医／日本整形外科認定スポーツ医
            </p>
            <p className="mt-4 text-sm leading-relaxed sm:text-base">
              九州サッカー協会・別府市サッカー協会の医学委員会委員長を務め、
              数多くのプロスポーツ大会で会場ドクターを担当してきました。
              「地域のみなさまが、痛みを我慢せず早めに相談できるクリニック」を目指しています。
            </p>
            <Link
              href="/doctor"
              className="mt-4 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
            >
              院長・スタッフ紹介を見る <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* お知らせ */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-primary sm:text-3xl">お知らせ</h2>
            <Link
              href="/news"
              className="flex shrink-0 items-center gap-1 font-semibold text-primary hover:underline"
            >
              一覧を見る <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          {news.length === 0 ? (
            <p className="rounded-xl border bg-card p-6 text-muted-foreground">
              現在、新しいお知らせはありません。
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {news.map((n) => {
                const cat = NEWS_CATEGORIES.find((c) => c.value === n.category);
                return (
                  <li key={n.id}>
                    <Link
                      href={`/news/${n.id}`}
                      className="flex flex-col gap-2 rounded-xl border bg-card p-4 hover:border-primary sm:flex-row sm:items-center sm:gap-4"
                    >
                      <time
                        dateTime={n.publishedAt.toISOString()}
                        className="shrink-0 text-sm text-muted-foreground"
                      >
                        {n.publishedAt.toLocaleDateString("ja-JP")}
                      </time>
                      {cat && <Badge variant="secondary">{cat.label}</Badge>}
                      <span className="font-semibold">{n.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* アクセス */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-2xl font-bold text-primary sm:text-3xl">アクセス</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border shadow-sm">
            <iframe
              title="青山整形外科クリニック 地図"
              src={MAP_EMBED_URL}
              className="h-80 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="flex flex-col justify-center gap-4">
            <p className="text-lg font-bold">{CLINIC.fullAddress}</p>
            <p className="text-muted-foreground">
              院内駐車場19台分に加え、海側隣接の「愛の里」駐車場にも8台駐車いただけます。
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/access">
                  アクセス詳細を見る <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a href={CLINIC.telHref}>{CLINIC.tel}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
