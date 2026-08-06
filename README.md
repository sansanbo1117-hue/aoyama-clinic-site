# 青山整形外科クリニック 公式サイト（患者ポータル）

大分県別府市の「医療法人 青山整形外科クリニック」公式サイトです。単なる紹介サイトではなく、
来院前から診療後まで患者さまが使える「患者ポータル」として、Web予約・お知らせ管理・FAQ・
アクセス案内などを備えています。

## 技術スタック

- Next.js 16（App Router）／TypeScript
- Tailwind CSS v4
- shadcn/ui 相当のUIコンポーネント（Radix UI + class-variance-authority、CLIレジストリが
  ネットワーク制限で使えない環境で構築したため手動実装）
- Prisma（開発環境はSQLite）
- Vercelへのデプロイを想定

## 主な機能

| 機能 | 説明 |
| --- | --- |
| Web予約 (`/reserve`) | 初診・再診の予約、予約変更・キャンセルのリクエストを送信。DBに保存され管理画面で確認。 |
| お知らせ管理 | `/admin/news` からお知らせの作成・編集・公開/非公開・削除が可能。 |
| Web予約管理 | `/admin/reservations` で予約リクエスト一覧と対応状況（未対応/確定/キャンセル/対応済み）を管理。 |
| お問い合わせ | `/contact` からのお問い合わせを `/admin/contacts` で確認。 |
| FAQ (`/faq`) | 電話で多い質問をアコーディオンで掲載し、受付の電話対応削減を狙う。 |
| 初診の流れ | `/medical` にアイコン付きで受付→問診→診察→会計の流れを掲載。 |
| Googleマップ | `/access` に大きく地図・駐車場写真・入口写真を掲載。 |

## ページ構成

トップ／医院紹介／院長紹介（スタッフ・専門医情報含む）／診療案内／診療時間／アクセス／
院内紹介／お知らせ／よくある質問／採用情報／お問い合わせ／ダウンロード／LINKS／
プライバシーポリシー／サイトマップ(sitemap.xml)

## セットアップ

```bash
npm install
cp .env.example .env   # ADMIN_PASSWORD, SESSION_SECRET を必ず変更する
npx prisma migrate dev
npm run db:seed        # 初期のお知らせデータを投入（任意）
npm run dev
```

`.env` の主な項目：

- `DATABASE_URL` … 開発時はSQLiteファイルでOK。
- `ADMIN_PASSWORD` … 管理画面 (`/admin`) のログインパスワード。
- `SESSION_SECRET` … 管理セッションCookieの署名鍵。`openssl rand -hex 32` 等で生成。
- `NEXT_PUBLIC_SITE_URL` … 本番公開ドメインが決まったら設定（`sitemap.xml`・OGP・canonicalに使用）。

## 本番デプロイ時に必ず行うこと

1. **DBの差し替え**：Vercel等のサーバーレス環境はファイルシステムが永続化されないため、
   SQLiteのままでは予約・お知らせ・お問い合わせのデータが消えてしまいます。
   Vercel Postgres・Supabase・Neon等の常設DBを用意し、`DATABASE_URL` を差し替えたうえで
   `prisma/schema.prisma` の `datasource.provider` を `postgresql` に変更してください。
   （`npm run build` は `prisma migrate deploy` を実行するため、マイグレーションはそのまま
   本番DBにも適用されます。）
2. `ADMIN_PASSWORD` と `SESSION_SECRET` を必ず推測困難な値に変更してください。
3. `NEXT_PUBLIC_SITE_URL` に本番ドメインを設定してください。

## 未確定・要確認の項目

`CONTENT-TODO.md` を参照してください（採用情報の募集要項、FAQ中の一部回答、スタッフ人数など
クリニック側で確認・更新が必要な項目をまとめています）。

## 将来的な拡張（今回は未実装）

Web問診／LINE通知／待ち人数表示／AIチャットボット／スマホ診察券／リハビリ動画／
処方箋案内／オンライン診療／患者マイページ。DBスキーマ（`Reservation`・`NewsPost`・
`ContactMessage`）は今後のフィールド追加やモデル追加がしやすいよう、Prismaでシンプルに
構成しています。
