import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * 下層ページ共通の見出し領域。トップページの編集的なスタイル（eyebrow + 明朝見出し）を
 * 下層にも適用し、トップと下層が別サイトに見える状態を解消する（Step8）。
 * パンくずリストも兼ねる。全ページ `.site-container`（1200px）幅で統一する。
 */
export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-hero">
      <div className="site-container">
        <nav aria-label="パンくずリスト" className="page-hero-breadcrumb">
          <Link href="/">トップ</Link>
          <ChevronRight aria-hidden />
          <span aria-current="page">{title}</span>
        </nav>
        <p className="eyebrow text-primary">{eyebrow}</p>
        <h1 className="page-hero-title">{title}</h1>
        {description && <p className="page-hero-description">{description}</p>}
      </div>
    </div>
  );
}
