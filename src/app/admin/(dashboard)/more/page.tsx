import Link from "next/link";

const items = [
  ["/admin/contacts", "お問い合わせ", "患者からの問い合わせと対応履歴"],
  ["/admin/news", "お知らせ管理", "休診・診療時間変更などの公開情報"],
  ["/admin/faq", "FAQ管理", "患者向けFAQの編集"],
  ["/admin/notifications", "通知履歴", "メールと受付通知の履歴"],
  ["/admin/settings/notifications", "通知設定", "受付担当者向け通知の設定"],
  ["/admin/schedule", "診療枠の詳細設定", "日付ごとの枠の停止・再開"],
  ["/admin/reservations", "旧予約依頼", "移行期間中の過去データ"],
] as const;

export default function AdminMorePage() {
  return <div className="mx-auto max-w-3xl"><p className="text-sm font-bold tracking-[0.16em] text-primary">MORE</p><h1 className="mt-1 text-2xl font-bold">その他の管理</h1><p className="mt-2 text-sm text-muted-foreground">日常の受付以外で使用する機能をまとめています。</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{items.map(([href, title, description]) => <Link key={href} href={href} className="rounded-2xl border bg-card p-5 shadow-sm transition-colors hover:border-primary hover:bg-secondary/20"><p className="font-bold">{title}</p><p className="mt-2 text-sm text-muted-foreground">{description}</p></Link>)}</div></div>;
}
