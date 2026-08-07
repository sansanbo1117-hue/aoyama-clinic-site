import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Bone,
  Car,
  Check,
  Clock3,
  HeartPulse,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { QuickActions } from "@/components/quick-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CLINIC, HOME_RECEPTION_SUMMARY, MAP_EMBED_URL } from "@/lib/clinic-info";
import { prisma } from "@/lib/prisma";
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
    number: "01",
    icon: Bone,
    title: "一般整形外科",
    english: "ORTHOPAEDICS",
    desc: "首・肩・腰・膝の痛み、骨折、捻挫、しびれなど、運動器の症状を幅広く診療します。",
    tags: ["関節の痛み", "外傷", "骨粗しょう症"],
  },
  {
    number: "02",
    icon: Activity,
    title: "スポーツ整形外科",
    english: "SPORTS MEDICINE",
    desc: "スポーツ障害の診断から治療、再発予防、段階的な競技復帰まで一貫して支えます。",
    tags: ["スポーツ外傷", "競技復帰", "再発予防"],
  },
  {
    number: "03",
    icon: HeartPulse,
    title: "リハビリテーション",
    english: "REHABILITATION",
    desc: "理学療法士などの専門スタッフが、日常動作とパフォーマンスの回復を支援します。",
    tags: ["運動療法", "物理療法", "機能回復"],
  },
] as const;

export default async function HomePage() {
  const news = await getLatestNews();

  return (
    <>
      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow text-white/70">
            AOYAMA ORTHOPAEDIC CLINIC · BEPPU
          </p>
          <h1>
            痛みの先に、
            <br />
            <span>もう一度動ける日常を。</span>
          </h1>
          <p className="hero-lead">
            地域の整形外科として、スポーツ医学の専門性を活かし、
            診断からリハビリ、再発予防まで伴走します。
          </p>
          <div className="hero-links">
            <Button asChild size="lg" className="rounded-none bg-accent text-accent-foreground shadow-none hover:bg-accent/90">
              <Link href="/reserve">
                Web予約 <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Link href="/medical" className="hero-text-link">
              診療内容を見る <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="青山整形外科クリニックの院内と外観">
          <div className="hero-photo-main">
            <Image
              src="/images/rehab-room.jpg"
              alt="リハビリテーション室での診療風景"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
              className="object-cover"
            />
          </div>
          <div className="hero-photo-sub">
            <Image
              src="/images/outpatient-building.jpg"
              alt="青山整形外科クリニック外観"
              fill
              priority
              sizes="(max-width: 900px) 48vw, 22vw"
              className="object-cover"
            />
          </div>
          <div className="hero-photo-detail">
            <Image
              src="/images/entrance.jpg"
              alt="緑に囲まれた医院入口"
              fill
              sizes="(max-width: 900px) 48vw, 18vw"
              className="object-cover"
            />
          </div>
          <div className="hero-watermark" aria-hidden>
            AOYAMA
          </div>
        </div>

        <div className="reception-panel">
          <div className="reception-heading">
            <span className="reception-icon"><Clock3 aria-hidden /></span>
            <div>
              <p className="eyebrow">RECEPTION HOURS</p>
              <h2>受付時間のご案内</h2>
            </div>
          </div>
          <dl className="reception-grid">
            <div>
              <dt>午前受付</dt>
              <dd>〜{HOME_RECEPTION_SUMMARY.am.receptionUntil}</dd>
            </div>
            <div>
              <dt>午後受付</dt>
              <dd>〜{HOME_RECEPTION_SUMMARY.pm.receptionUntil}</dd>
            </div>
          </dl>
          <p className="reception-note">
            診療時間 {HOME_RECEPTION_SUMMARY.am.hours}・{HOME_RECEPTION_SUMMARY.pm.hours}（月・火・金）
            ／ 水曜午後は{HOME_RECEPTION_SUMMARY.wedPm} ／ 木・土曜は午前のみ
          </p>
          <div className="reception-actions">
            <a href={CLINIC.telHref}>
              <Phone className="size-4" aria-hidden /> {CLINIC.tel}
            </a>
            <Link href="/hours">
              詳細 <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <a className="hero-scroll" href="#care">
          <span>SCROLL</span><ArrowDown className="size-4" aria-hidden />
        </a>
      </section>

      <QuickActions />

      <section id="care" className="care-intro section-pad">
        <div className="site-container care-intro-grid">
          <div>
            <p className="eyebrow text-primary">OUR CARE</p>
            <h2 className="display-heading">
              いまの痛みだけでなく、
              <br />
              <span>その先の生活</span>を診る。
            </h2>
          </div>
          <div className="care-intro-copy">
            <p>
              病名をつけて終わりではありません。患者さまが「何に困っているか」を丁寧に伺い、
              検査・治療・リハビリをつなぎ、できることを取り戻す道筋を一緒につくります。
            </p>
            <ul>
              <li><Check aria-hidden /> 日本整形外科学会専門医による診療</li>
              <li><Check aria-hidden /> スポーツ現場で培った復帰支援</li>
              <li><Check aria-hidden /> 院内で検査からリハビリまで連携</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="departments-section section-pad">
        <div className="site-container">
          <div className="section-title-row">
            <div>
              <p className="eyebrow text-primary">MEDICAL SERVICES</p>
              <h2 className="section-heading">診療内容</h2>
            </div>
            <Link href="/medical" className="arrow-link">
              すべての診療内容 <ArrowRight aria-hidden />
            </Link>
          </div>

          <div className="department-list">
            {departments.map((department) => (
              <Link href="/medical" className="department-row" key={department.number}>
                <span className="department-number">{department.number}</span>
                <span className="department-icon"><department.icon aria-hidden /></span>
                <span className="department-name">
                  <small>{department.english}</small>
                  <strong>{department.title}</strong>
                </span>
                <span className="department-copy">{department.desc}</span>
                <span className="department-tags">
                  {department.tags.map((tag) => <em key={tag}>{tag}</em>)}
                </span>
                <span className="department-arrow"><ArrowRight aria-hidden /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rehab-feature section-pad">
        <div className="site-container rehab-grid">
          <div className="rehab-image-wrap">
            <Image
              src="/images/rehab-room.jpg"
              alt="広いリハビリテーション室"
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
              className="object-cover"
            />
            <p aria-hidden><span>SPORTS</span><span>MEDICINE</span></p>
          </div>
          <div className="rehab-copy">
            <p className="eyebrow text-accent">FROM PAIN TO PERFORMANCE</p>
            <h2>治すだけでなく、<br />戻るところまで。</h2>
            <p>
              日常生活への復帰も、競技への復帰も、目標は一人ひとり違います。
              医師とリハビリスタッフが状態を共有し、無理のない回復計画を組み立てます。
            </p>
            <div className="feature-facts">
              <div><ShieldCheck aria-hidden /><span>専門医による<br /><strong>的確な診断</strong></span></div>
              <div><Activity aria-hidden /><span>段階に合わせた<br /><strong>復帰プラン</strong></span></div>
            </div>
            <Link href="/medical" className="light-arrow-link">
              スポーツ整形外科について <ArrowRight aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="doctor-section section-pad">
        <div className="site-container doctor-grid">
          <div className="doctor-copy">
            <p className="eyebrow text-primary">DOCTOR</p>
            <h2 className="section-heading">地域の暮らしと、<br />スポーツを支える。</h2>
            <blockquote>
              「痛みを我慢する前に、気軽に相談できる場所でありたい」
            </blockquote>
            <p>
              整形外科専門医・認定スポーツ医として、地域診療とスポーツ現場の両方に携わってきました。
              症状や生活背景を丁寧に伺い、納得できる治療をともに選びます。
            </p>
            <p className="doctor-name"><small>院長</small> 内田 六郎</p>
            <Link href="/doctor" className="arrow-link">
              院長・スタッフ紹介 <ArrowRight aria-hidden />
            </Link>
          </div>
          <div className="doctor-portrait">
            <Image
              src="/images/dr-uchida.jpg"
              alt="院長 内田六郎"
              fill
              sizes="(max-width: 900px) 90vw, 40vw"
              className="object-cover object-top"
            />
            <span aria-hidden>R. UCHIDA</span>
          </div>
        </div>
      </section>

      <section className="patient-info section-pad">
        <div className="site-container">
          <div className="section-title-row">
            <div>
              <p className="eyebrow text-primary">FOR PATIENTS</p>
              <h2 className="section-heading">受診される方へ</h2>
            </div>
            <p className="section-description">迷わず受診できるよう、必要な情報をまとめています。</p>
          </div>
          <div className="patient-links">
            <Link href="/reserve"><span>01</span><strong>Web予約</strong><small>初診・再診・変更</small><ArrowRight aria-hidden /></Link>
            <Link href="/hours"><span>02</span><strong>診療・受付時間</strong><small>曜日別の時間</small><ArrowRight aria-hidden /></Link>
            <Link href="/access"><span>03</span><strong>アクセス</strong><small>地図・駐車場</small><ArrowRight aria-hidden /></Link>
            <Link href="/faq"><span>04</span><strong>よくある質問</strong><small>受診前の確認</small><ArrowRight aria-hidden /></Link>
          </div>
        </div>
      </section>

      <section className="news-section section-pad">
        <div className="site-container news-grid">
          <div>
            <p className="eyebrow text-primary">NEWS</p>
            <h2 className="section-heading">お知らせ</h2>
            <Link href="/news" className="arrow-link">
              一覧を見る <ArrowRight aria-hidden />
            </Link>
          </div>
          <div className="news-list">
            {news.length === 0 ? (
              <p className="news-empty">現在、新しいお知らせはありません。</p>
            ) : (
              news.map((item) => {
                const category = NEWS_CATEGORIES.find((entry) => entry.value === item.category);
                return (
                  <Link href={`/news/${item.id}`} key={item.id}>
                    <time dateTime={item.publishedAt.toISOString()}>
                      {item.publishedAt.toLocaleDateString("ja-JP").replaceAll("/", ".")}
                    </time>
                    {category && <Badge variant="secondary">{category.label}</Badge>}
                    <strong>{item.title}</strong>
                    <ArrowRight aria-hidden />
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="access-section">
        <div className="access-map">
          <iframe
            title="青山整形外科クリニック 地図"
            src={MAP_EMBED_URL}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="access-copy">
          <p className="eyebrow text-accent">ACCESS</p>
          <h2>通いやすさも、<br />治療の一部です。</h2>
          <p className="access-address"><MapPin aria-hidden /> {CLINIC.fullAddress}</p>
          <div className="access-facts">
            <p><Car aria-hidden /><span><strong>駐車場 27台</strong><small>院内19台＋隣接8台</small></span></p>
            <p><Clock3 aria-hidden /><span><strong>土曜も診療</strong><small>{HOME_RECEPTION_SUMMARY.satAm}</small></span></p>
          </div>
          <Button asChild variant="outline" className="rounded-none border-white bg-transparent text-white hover:bg-white hover:text-primary">
            <Link href="/access">アクセス詳細 <ArrowRight aria-hidden /></Link>
          </Button>
        </div>
      </section>
    </>
  );
}
