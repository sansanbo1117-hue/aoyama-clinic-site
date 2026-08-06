# 青山整形外科クリニック 公式サイト（患者ポータル）

大分県別府市の「医療法人 青山整形外科クリニック」公式サイトです。単なる紹介サイトではなく、
来院前から診療後まで患者さまが使える「患者ポータル」として、Web予約・お知らせ管理・FAQ・
アクセス案内などを備えています。

## 技術スタック

- Next.js 16（App Router）／TypeScript
- Tailwind CSS v4
- shadcn/ui 相当のUIコンポーネント（Radix UI + class-variance-authority、CLIレジストリが
  ネットワーク制限で使えない環境で構築したため手動実装）
- Prisma／Postgres（Vercelはサーバーレスでファイルシステムが永続化されないため、
  開発環境も含めてPostgresを使用します）
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

## セットアップ（ローカル開発）

Postgresの接続先（ローカルPostgres、または後述のVercel/Neonの接続文字列）を用意してください。

```bash
npm install
cp .env.example .env   # DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET を設定する
npx prisma migrate dev
npm run db:seed        # 初期のお知らせデータを投入（任意）
npm run dev
```

`.env` の主な項目：

- `DATABASE_URL` … Postgresの接続文字列。
- `ADMIN_PASSWORD` … 管理画面 (`/admin`) のログインパスワード。
- `SESSION_SECRET` … 管理セッションCookieの署名鍵。`openssl rand -hex 32` 等で生成。
- `NEXT_PUBLIC_SITE_URL` … 本番公開ドメインが決まったら設定（`sitemap.xml`・OGP・canonicalに使用）。

## Vercelで非公開プレビューを作る手順

本番公開前に、中身だけ確認したい場合の手順です。

1. [vercel.com](https://vercel.com) にログインし、「Add New」→「Project」から
   GitHubリポジトリ `sansanbo1117-hue/aoyama-clinic-site` をインポートする。
2. インポート画面（またはプロジェクト作成後の Storage タブ）で **Postgres** を追加する
   （Neon連携。無料枠でOK）。追加すると `DATABASE_URL` が自動的に環境変数へ設定される。
3. プロジェクトの **Settings → Environment Variables** に以下を追加する。
   - `ADMIN_PASSWORD` … 管理画面ログイン用の任意のパスワード
   - `SESSION_SECRET` … 任意のランダム文字列（例: `openssl rand -hex 32` の出力）
4. Deploy を実行する。ビルド時に `prisma migrate deploy` が自動実行され、テーブルが作成される。
5. デプロイ完了後に発行される `https://xxxxx.vercel.app` のURL（Preview/Production問わず）は
   検索エンジンには表示されませんが、URLを知っていれば誰でも閲覧できる状態です。
   本当に外部から見られたくない場合は、Vercelの「Deployment Protection」機能
   （Settings → Deployment Protection）でパスワード保護を有効にしてください（Hobbyプランでも設定可）。
6. 初回アクセス時は `/admin/news` にお知らせが1件も無い状態なので、必要であれば
   ローカルから `npm run db:seed`（`DATABASE_URL` を本番の接続文字列に向けて実行）で
   初期データを投入するか、管理画面から手動で追加してください。

## 本番公開時に必ず行うこと

1. `ADMIN_PASSWORD` と `SESSION_SECRET` を必ず推測困難な値に変更する。
2. `NEXT_PUBLIC_SITE_URL` に本番ドメインを設定する。
3. Vercelの「Deployment Protection」を外して一般公開に切り替える（プレビュー時に有効化していた場合）。
4. `robots.ts` は `Allow: /` 設定済みなので、そのままで公開状態になる。

## 未確定・要確認の項目

`CONTENT-TODO.md` を参照してください（採用情報の募集要項、FAQ中の一部回答、スタッフ人数など
クリニック側で確認・更新が必要な項目をまとめています）。

## 将来的な拡張（今回は未実装）

Web問診／LINE通知／待ち人数表示／AIチャットボット／スマホ診察券／リハビリ動画／
処方箋案内／オンライン診療／患者マイページ。DBスキーマ（`Reservation`・`NewsPost`・
`ContactMessage`）は今後のフィールド追加やモデル追加がしやすいよう、Prismaでシンプルに
構成しています。
