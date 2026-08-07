# 改修実装計画書

対象：青山整形外科クリニック 公式サイト（`aoyama-clinic-site`）
作成日：2026-08-07
前提：レビュー（2026-08-07 実測）で検出した Step 1〜8 の是正。実装は未着手。

---

## 0. 全体方針

### 0.1 このサイトが満たすべき基準

参考3サイト（愛育病院／福岡山王病院／山王病院）を同一スクリプトで実測した結果、
病院サイトが共通して守っている水準は以下だった。本計画はこの水準を到達目標とする。

| 指標 | 愛育 | 福岡山王 | 山王 | **青山（現状）** | **目標** |
| --- | --- | --- | --- | --- | --- |
| テキストノード数 | 148 | 92 | 232 | 151 | — |
| WCAG AA コントラスト不足 | 1 (0.7%) | 9 (10%) | 26 (11%) | **87 (58%)** | **0件** |
| 13px 未満のテキスト | 41 | 5 | 23 | **93** | **0件** |
| 本文サイズ中央値 | 14px | 16px | 16px | **11.9px** | **16px 以上** |

補足：青山の 87 件のうち 2 件（`.hero-watermark` の "AOYAMA"、`.doctor-portrait` の "R. UCHIDA"）は
`aria-hidden` の装飾要素なので実害はない。残る **85 件が是正対象**。

### 0.2 現状のコード上の構造的問題

| 問題 | 実測値 |
| --- | --- |
| `globals.css` 内の 1rem 未満 `font-size` 指定 | **38 種類**（`.46rem` 〜 `.98rem`） |
| `globals.css` 内のハードコード色 | **55 色** |
| 公開ページのコンテナ幅 | **5 種類**（672 / 768 / 896 / 1152 / 1200px） |
| カラートークンの定義箇所 | **2 箇所**（`:root` と末尾の上書きブロック） |

つまり「デザイントークンが機能していない」状態。Step 3 と Step 8 はこの是正が本体。

### 0.3 進め方の原則

- **1 Step = 1 PR** とし、各 PR は単独でデプロイ可能にする。
- Step 1〜3 は表示のみの変更でロールバックが容易。**先に出す。**
- Step 4〜7 は予約・認証の挙動を変えるため、**プレビュー環境で受け入れ確認してから本番へ。**
- 各 Step に「受け入れ条件」を定義し、`scripts/audit-a11y.mjs`（Step 3 で新規作成）で機械検証する。
- 既存の良い設計（`SELECT FOR UPDATE` による排他制御、トークンのハッシュ保存、
  診察券番号の AES-256-GCM 暗号化、通知の冪等キー、監査ログ）は壊さない。

---

## 1. 着手前にクリニック側へ確認が必要な事項

**この 6 点は開発側では決められない。Step 2・5・7 の実装内容が確定しないため、先に回答を得る。**

| # | 確認事項 | なぜ必要か | 影響 Step |
| --- | --- | --- | --- |
| A | **Web予約で「初診」を受け付けてよいか** | `/hours` は「新患・お久しぶり・別部位は**すべて事前に電話予約が必要**」と明記しているが、実装は初診をWebで即時確定させている。どちらが正か。 | 5, 7 |
| B | **各曜日の正式な受付終了時刻**（新患／再診それぞれ） | `clinic-info.ts` の `RECEPTION_HOURS` が唯一の情報源になる。現状トップページには診療時間が「受付時間」として表示されている。 | 2, 7 |
| C | **Web予約枠は「新患受付終了」と「再診受付終了」のどちらに合わせるか** | 木曜は新患11:00／再診11:30と30分差がある。枠を分けるか、安全側（新患基準）に寄せるか。 | 7 |
| D | **診察券番号の照合に生年月日を必須とする運用でよいか** | 現状は診察券番号のみで既存患者レコードを上書きできる。生年月日を必須にすると、生年月日が未登録の既存患者は自動突合できず受付タスクに回る。 | 5 |
| E | **ブランドカラーをシアン系（現行 `#009bd2`）で維持するか、元の濃紺系（`#0b5a78`）に戻すか** | `#009bd2` は白文字とのコントラストが **3.17:1** で AA 不合格。シアンを維持する場合は `#00688c`（6.25:1）程度まで濃度を上げる必要がある。`#0b5a78` は 7.64:1 で AAA 合格。 | 3, 8 |
| F | **「予約リクエスト」という表記を「Web予約」に統一してよいか** | 実装は即時確定予約。「リクエスト」表記だと患者は「後日連絡が来る」と誤解する。 | 8 |

> 回答が揃わない場合の暫定方針：A は「初診はWeb予約不可（電話へ誘導）」、C は「新患基準（安全側）」、
> D は「生年月日必須・不一致は新規レコード＋受付タスク」、E は「`#0b5a78` に戻す」、F は「統一する」を
> 既定値として実装し、後から設定値で切り替えられる形にする。

---

## 2. Step 一覧と実施順

| Step | 内容 | 種別 | 所要目安 | 依存 |
| --- | --- | --- | --- | --- |
| 1 | タブレット幅でのナビゲーション消失を修正 | 表示バグ | 0.5h | — |
| 2 | 受付時間の表示修正と `clinic-info.ts` への一元化 | 情報整合 | 3h | 確認 B |
| 3 | タイポグラフィ／カラートークンの再設定 | 基盤 | 8h | 確認 E |
| 4 | 予約 API のレート制限＋スロット生成の切り離し | 保護 | 5h | — |
| 5 | 診察券番号の照合強化 | セキュリティ | 4h | 確認 A, D |
| 6 | セキュリティヘッダー／Cron／管理ログイン | セキュリティ | 4h | — |
| 7 | Web予約枠を受付時間に合わせる | 情報整合 | 6h | 確認 A,B,C・Step 2 |
| 8 | デザイントークンの統合と下層ページ展開 | 基盤 | 16h | Step 3 |
| | **合計** | | **約 46.5h** | |

実施順は上記のとおり。Step 3 が Step 8 の前提、Step 2 が Step 7 の前提になる。
Step 1・4・6 は他に依存しないので、確認事項の回答待ちの間に並行して進められる。

---

## Step 1: タブレット幅でのナビゲーション消失を修正

### 目的
768px〜900px の幅でヘッダーから到達できるリンクがロゴ 1 本だけになる状態を解消する。
iPad（768）、iPad Air（820）、iPad Pro 11"（834）が該当し、高齢の患者層の主要端末を含む。

### 原因
2 つのブレークポイントがすれ違っている。

| 箇所 | 指定 | 効果 |
| --- | --- | --- |
| `src/app/globals.css:792` | `@media (max-width:900px)` 内の `.desktop-nav, .header-reserve { display:none }` | **900px 以下**でデスクトップナビを隠す |
| `src/components/mobile-nav.tsx:18` | `className="relative md:hidden"` | **768px 以上**でハンバーガーを隠す |

→ 768–900px は両方とも非表示。

### 変更内容

1. **`src/components/mobile-nav.tsx:18`**
   `md:hidden` → `min-[901px]:hidden` に変更し、CSS 側の 900px と一致させる。

2. **`src/components/mobile-nav.tsx:34`**
   パネルの `top-[78px]` がヘッダー高さのハードコードになっている。
   `globals.css` に `--header-height`（デスクトップ 102px／900px以下 78px）を定義し、
   `top-[var(--header-height)]` に置き換える。

3. **`src/app/globals.css:774`**
   `.header-phone` を 1180px 以下で `display:none` にしているため、ノートPC〜スマホで電話番号が消える。
   参考3サイトはいずれも電話導線を常時表示している。
   1180px 以下では**アイコン＋番号のみのコンパクト表示**に切り替え、非表示にはしない。

4. ブレークポイント値を CSS カスタムプロパティか定数として 1 箇所に集約し、
   Tailwind の任意値と CSS メディアクエリで同じ値を参照する。

### 受け入れ条件
- 320 / 375 / 640 / 767 / **768 / 820 / 834 / 900** / 901 / 1024 / 1180 / 1280 / 1440px の全幅で、
  ヘッダーから「主要ナビ・電話・予約」の 3 導線すべてに到達できる。
- 全幅で `document.documentElement.scrollWidth === window.innerWidth`（横スクロールなし）。

### 検証
```bash
# dev server 起動後、各幅でヘッダーの到達可能リンクを列挙
node scripts/check-nav-breakpoints.mjs   # Step 1 で新規作成
```
判定スクリプトは以下を各幅で評価する：
```js
[...document.querySelectorAll('header a, header button')]
  .filter(el => getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0)
```

### リスク
低。表示のみの変更。`.header-phone` のコンパクト表示は Step 3 のタイポグラフィ変更と
競合しうるので、Step 3 で再確認する。

---

## Step 2: 受付時間の表示修正と一元化

### 目的
トップページの「受付時間のご案内」に**診療時間**が表示されている状態を解消し、
時間情報の情報源を `clinic-info.ts` 1 箇所に統一する。

### 現状の不整合

`src/app/page.tsx:131-149`（トップのパネル）：
```
RECEPTION HOURS ／ 受付時間のご案内
午前 9:00—12:00 ／ 午後 14:00—18:00
水曜午後 15:00—19:00 ／ 木・土曜は午前のみ
```
これは `WEEKLY_HOURS`（＝**診療時間**）の値であり、ベタ書きされている。

`src/lib/clinic-info.ts:32` の実際の受付時間：
| 区分 | 月火木金 | 水 | 土 |
| --- | --- | --- | --- |
| 新患 | 午前〜11:00／午後〜17:00 | 〜11:00／〜18:00 | 〜12:00 |
| 再診 | 午前〜11:30／午後〜17:30 | 〜11:30／〜18:30 | 〜12:00 |

トップを見て 11:30 に来院した新患が受付終了を告げられる。受付スタッフのクレーム対応に直結する。

さらに時間情報が **3 箇所**に分散している：
- `clinic-info.ts` の `WEEKLY_HOURS` / `RECEPTION_HOURS`
- `page.tsx` のベタ書き（トップのパネル、`access-facts` の「土曜も診療 9:00—13:00」）
- `booking.ts:12-19` の `WEEKLY_RULES`（Web予約枠）
- `clinic-schedule.ts:3-11` の `BOOKABLE_TIME_BY_DAY`（旧予約リクエスト用）

### 変更内容

1. **`src/lib/clinic-info.ts` を唯一の情報源にする**
   曜日ごとに「診療時間」「新患受付終了」「再診受付終了」を持つ単一の構造体へ再定義する。

   ```ts
   export type DaySchedule = {
     weekday: 0|1|2|3|4|5|6;
     label: string;
     am: { start: string; end: string; newPatientUntil: string; followupUntil: string } | null;
     pm: { start: string; end: string; newPatientUntil: string; followupUntil: string } | null;
   };
   export const SCHEDULE: DaySchedule[] = [ /* 確認事項 B の回答で確定 */ ];
   ```
   既存の `WEEKLY_HOURS` / `RECEPTION_HOURS` は `SCHEDULE` からの派生（導出関数）にして、
   `/hours` の表組みはそのまま動くようにする。

2. **`src/app/page.tsx:131-149` のパネルを書き換える**
   - 見出しを実態に合わせる。「受付時間」を名乗るなら受付時間を、診療時間を出すなら見出しを変える。
   - **推奨：診療時間と受付終了を併記する。** 患者が知りたいのは「何時までに行けばよいか」であり、
     受付終了時刻の方が重要度が高い。
   - 値は `SCHEDULE` から導出し、ベタ書きを撤廃する。

3. **`src/app/page.tsx:346-347` の `access-facts`**
   「土曜も診療 9:00—13:00」も `SCHEDULE` 由来に置き換える。

4. **`src/lib/clinic-schedule.ts` の `BOOKABLE_TIME_BY_DAY` を `SCHEDULE` から導出**
   （このファイル自体は Step 8 のデッドコード整理で削除候補。Step 2 では導出化にとどめる。）

5. `booking.ts` の `WEEKLY_RULES` は Step 7 で `SCHEDULE` 由来に統合する。

### 受け入れ条件
- 時間に関する数値リテラルが `clinic-info.ts` 以外のファイルに存在しない
  （`grep -rE "[0-9]{1,2}:[0-9]{2}" src/ --include="*.tsx"` で `clinic-info.ts` 以外にヒットしない）。
- トップの表示と `/hours` の表示が矛盾しない。
- 「受付時間」という語が使われている箇所は、すべて `RECEPTION_HOURS` 系の値を出している。

### リスク
中。`WEEKLY_HOURS` / `RECEPTION_HOURS` は `/hours` と `/faq` が参照している。
派生関数として同じ形を保てば既存ページの変更は不要。

---

## Step 3: タイポグラフィ／カラートークンの再設定

### 目的
コントラスト不足 85 件・13px 未満 93 件を 0 にする。**これ単体で参考3サイトと同水準に乗る。**

### 現状の問題

1. **宣言と実装が正反対**
   `globals.css:76` に「高齢の方にも読みやすい大きめの基準フォントサイズ」として `font-size: 17px`
   と書いてあるが、実際に置かれた文字の中央値は **11.9px**。
   1rem 未満の `font-size` 指定が **38 種類**あり、最小は `.46rem`（7.8px）。

2. **カラートークンが二重定義**
   `globals.css:8-41` で `--primary: #0b5a78` を定義した後、
   `globals.css:884-948` の「Screenshot-matched cyan blue palette」ブロックが `#009bd2` で上書きしている。
   上書き漏れにより、シアン背景の上にライムグリーン（`#b8d56a` / `#dce8ad`）が残存している。

3. **上書き後の色が AA を満たさない**

   | 色 | 用途 | 白文字とのコントラスト | 判定 |
   | --- | --- | --- | --- |
   | `#009bd2`（現 `--primary`） | ボタン、リンク | **3.17:1** | ✗ AA不合格 |
   | `#008fbe`（`.header-reserve` 等） | ヘッダー予約ボタン | **3.38:1** | ✗ AA不合格 |
   | `#0b5a78`（元の primary） | — | **7.64:1** | ✓ AAA |
   | `#00688c`（シアン維持案） | — | **6.25:1** | ✓ AAA |

   実測で最悪だった `FROM PAIN TO PERFORMANCE`（`#b8d56a` on `#008cc3`）は **2.30:1**。

### 変更内容

#### 3-1. タイプスケールの定義（`globals.css`）

`html { font-size: 17px }` は維持し、rem ベースの離散スケールを定義する。**中間値の使用を禁止する。**

| トークン | rem | px(17px基準) | 用途 |
| --- | --- | --- | --- |
| `--text-xs` | 0.75rem | 12.75px | **最小**。キャプション、英字ラベル、注記 |
| `--text-sm` | 0.875rem | 14.9px | 補助テキスト、テーブル内 |
| `--text-base` | 1rem | 17px | **本文の既定** |
| `--text-lg` | 1.125rem | 19.1px | リード文、カード見出し |
| `--text-xl` | 1.375rem | 23.4px | h3 |
| `--text-2xl` | 1.75rem | 29.8px | h2 |
| `--text-3xl` | 2.25rem | 38.3px | ページ h1 |
| `--text-display` | `clamp(2.25rem, 4vw, 3.5rem)` | 38–60px | トップの見出し |

**移行ルール（38 種類の既存値をこの 8 段階に写像する）：**

| 現状値の範囲 | 移行先 | 対象例 |
| --- | --- | --- |
| `.46` 〜 `.62rem` | `--text-xs` (0.75rem) | `.brand em`, `.desktop-nav small`, `.department-name small`, `.quick-label span`, `.footer-bottom`, `.patient-links span` |
| `.64` 〜 `.78rem` | `--text-sm` (0.875rem) | `.footer-nav a`, `.reception-note`, `.department-copy`, `.access-address`, `.arrow-link` |
| `.8` 〜 `.98rem` | `--text-base` (1rem) | `.hero-lead`, `.care-intro-copy > p`, `.rehab-copy > p`, `.doctor-copy > p`, `.news-list strong` |

> `.eyebrow`（英字ラベル）は `--text-xs` ＋ `letter-spacing: 0.16em` に統一。
> 現行の `0.2em` は 12px 未満だと可読性が落ちるため縮める。

#### 3-2. カラートークンの統合

1. **`globals.css:884-948` の上書きブロックを削除**し、`:root` の定義に一本化する。
2. `--primary` を確認事項 E の回答で確定した値にする（既定：`#0b5a78`）。
3. **55 個のハードコード色をトークンに集約する。** 用途別に整理：

   | トークン | 役割 | 現状の重複 |
   | --- | --- | --- |
   | `--primary` / `--primary-hover` | 主要アクション | `#0b5a78`(20), `#008fbe`(2), `#008cc3`(2) |
   | `--ink` / `--ink-muted` / `--ink-subtle` | 本文3階調 | `#153247`(8), `#5c6e78`(3), `#71808a`(4) ほか |
   | `--surface` / `--surface-alt` / `--surface-sunken` | 背景3階調 | `#f7f8f5`(3), `#eef1ed`(3), `#f1f6f5`(3) |
   | `--line` / `--line-strong` | 罫線2階調 | `#d7dfde`(11), `#d0d9d8`, `#ccd6d6`, `#bcc8c8`, `#bac6c6`, `#cfd9da` |
   | `--accent` | アクセント（ライム） | `#b8d56a`(6), `#dce8ad`(4) |
   | `--on-dark` / `--on-dark-muted` | 濃色背景上の文字 | `rgba(255,255,255,.5〜.85)` の多数 |

4. **濃色背景上の文字**（`.hero-lead`, `.rehab-copy p`, `.feature-facts span`, `.access-facts small` 等）は
   現状 `rgba(255,255,255,.55〜.78)` で軒並み AA 不合格。
   `--on-dark-muted` を **`rgba(255,255,255,.88)` 以上**に引き上げる。

5. Tailwind 側のハードコード（`page.tsx:85` の `bg-[#b8d56a] text-[#153247]`、
   `page.tsx:236,342` の `text-[#b8d56a]`、`mobile-nav.tsx:66` の `bg-[#b8d56a]`）を
   `@theme inline` 経由のユーティリティに置き換える。

#### 3-3. タップターゲット

375px 幅で **26 要素が 44px 未満**（フッターナビ 19px、電話リンク 20px）。
- インラインリンクを除くすべてのリンク・ボタンに `min-height: 44px` を保証する。
- `.footer-nav a` は `padding-block` を追加して 44px を確保。
- `.arrow-link` / `.light-arrow-link` / `.reception-actions a` も同様。

#### 3-4. 検証スクリプトの作成

`scripts/audit-a11y.mjs` を新規作成。以下を全公開ページに対して実行し、閾値超過で異常終了する。

- WCAG AA コントラスト比（通常テキスト 4.5:1、大テキスト 3:1）
- `font-size < 12.75px` のテキストノード
- 375px 幅でのタップターゲット 44×44px 未満
- 横スクロールの発生

CI（または `npm run audit`）に組み込み、以後の回帰を防ぐ。

### 受け入れ条件
- 全公開ページで **コントラスト不足 0 件**（`aria-hidden` の装飾を除く）。
- 全公開ページで **12.75px 未満のテキスト 0 件**。
- 本文サイズ中央値 **16px 以上**。
- 375px 幅でタップターゲット 44px 未満 **0 件**。
- `globals.css` の `font-size` 指定がすべて `--text-*` トークン経由。
- カラートークンの定義が `:root` の 1 ブロックのみ。

### リスク
**高。** トップページの見た目が変わる。特に：
- 極小の英字ラベルが 12.75px になることで、全体の「詰まった」印象が緩む
- `.department-row` / `.patient-links` / `.news-list` のグリッド高さが伸びる
- `.reception-panel` がヒーロー内に収まらなくなる可能性

→ **対策：** Step 3 は「読めるようにする」ことを最優先とし、レイアウトの再調整は
Step 8 のデザイン整備で行う。Step 3 の時点では余白・グリッドの微調整のみに留め、
「文字が大きくなった分だけ間延びした」状態を許容する。デザインの完成は Step 8 で行う。

---

## Step 4: 予約 API のレート制限とスロット生成の切り離し

### 目的
Web予約を第三者が停止させられる状態と、未認証 GET が毎回数百行を書き込む状態を解消する。

### 現状の問題

1. **`/api/booking/hold` にレート制限がない**
   `/api/availability` が `slotId` の一覧を認証なしで返すため、
   全枠に 5 分ホールドをかけ続ければ Web予約を無期限に機能停止できる。
   `/api/booking/confirm`、`/api/appointments/reschedule` も同様に無制限。

2. **`getAvailability()` が毎回 `ensureDefaultBookingSetup()` を呼ぶ**（`src/lib/booking.ts:100`）
   中身は `serviceType` の upsert 1 回 ＋ `scheduleRule` の upsert 10 回 ＋
   30 日分のスロット生成（約 400 行）の `createMany`。
   予約画面で日付を切り替えるたびに実行される。Supabase の接続数とコストを直接消費する。

3. **`src/lib/rate-limit.ts` がサーバーレスで機能しない**
   インメモリ `Map`。インスタンスごとに独立し、コールドスタートで消える。
   期限切れエントリの削除もないためメモリが単調増加する。
   現在これに依存しているのは `createContactMessage` と（未使用の）`createReservation`。

### 変更内容

#### 4-1. レート制限の実装を差し替える

`src/lib/rate-limit.ts` を外部ストア方式に書き換える。

- **方式：** Upstash Redis（Vercel Marketplace から接続、無料枠あり）を推奨。
  代替として Postgres に `RateLimitBucket` テーブルを作る案もあるが、
  予約 API の高頻度アクセスを DB に載せるのは避けたい。
- **インターフェースは維持する**（`allowPublicSubmission(scope)` の呼び出し側を変えない）。
- キーは `scope:IP`。`x-forwarded-for` の先頭を採用する現行ロジックは維持しつつ、
  Vercel では `x-vercel-forwarded-for` の方が信頼できるため優先順を見直す。
- 制限値を用途別に分ける：

  | scope | 制限 | 根拠 |
  | --- | --- | --- |
  | `availability` | 60 回 / 10 分 | 日付切替は正常操作でも多い |
  | `booking-hold` | 10 回 / 10 分 | 正常な患者は数回で足りる |
  | `booking-confirm` | 5 回 / 10 分 | |
  | `reschedule` | 5 回 / 10 分 | |
  | `contact` | 5 回 / 10 分 | 現行維持 |
  | `admin-login` | 5 回 / 15 分（Step 6） | |

#### 4-2. ホールドの多重取得を防ぐ

IP ベースの制限に加え、**同一 IP が同時に保持できる未消費ホールドを 1 件に制限**する。
`holdSlot()` 内で、既存の未消費ホールドがあれば失効させてから新規発行する。
`SlotHold` に `clientKey`（IP のハッシュ）カラムを追加する（マイグレーション 1 本）。

#### 4-3. スロット生成を読み取りパスから外す

- `getAvailability()` から `ensureDefaultBookingSetup()` の呼び出しを削除し、
  `serviceType` は `findUnique` で取得する（存在しなければ空配列を返す）。
- スロット生成は既存の 3 経路に集約する：
  1. `vercel.json` の日次 Cron（`/api/cron/appointment-reminders` が既に `ensureDefaultBookingSetup()` を呼んでいる）
  2. 管理画面の「今後の枠を整える」ボタン（`initializeSchedule`／既存）
  3. `prisma/seed.ts`（初回セットアップ用に追加）
- `ensureDefaultBookingSetup()` を「設定の upsert」と「スロット補充」に分離し、
  Cron からは後者だけを呼べるようにする。
- `/admin/schedule` も現状 `ensureDefaultBookingSetup()` を呼んでいる（`schedule/page.tsx:14`）が、
  管理画面なので許容。ただし `findUnique` + 未生成時のみ生成に変える。

> Vercel Hobby プランは Cron が 1 日 1 回・本数制限があるため、
> **既存の `appointment-reminders` Cron にスロット補充を相乗りさせる**現行構成を維持する。

### 受け入れ条件
- `/api/availability` を 100 回連続で叩いても `AppointmentSlot` の行数が増えない。
- `/api/booking/hold` を同一 IP から 11 回叩くと 429 が返る。
- 同一 IP が同時に 2 枠をホールドできない。
- レート制限がデプロイをまたいで（＝インスタンス再起動後も）維持される。

### リスク
中。Upstash の追加は環境変数（`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`）が増える。
未設定時はフェイルクローズ（＝制限をかける側に倒す）ではなく、
**ログを出しつつ通過させる**（予約機能が完全停止するのを避ける）方針とし、
起動時に環境変数の欠落を警告する。

---

## Step 5: 診察券番号の照合強化

### 目的
診察券番号だけで他人の患者レコードを書き換えられる状態を解消する。

### 現状の問題

`src/lib/booking.ts:148-150`：
```ts
const patient = card
  ? await tx.patient.findFirst({ where: { patientCardNumberLookupHash: getPatientCardLookupHash(card) } })
  : null;
const patientData = { name: input.name, phone: input.phone, email: input.email, birthDate: input.birthDate || null, ... };
const savedPatient = patient
  ? await tx.patient.update({ where: { id: patient.id }, data: patientData })
  : await tx.patient.create({ data: patientData });
```

診察券番号が一致しただけで、**氏名・生年月日の照合なしに**既存レコードの
氏名・電話・メール・生年月日を投稿者の入力で上書きする。
診察券番号は連番で推測可能なため、他人の番号を入力すればその患者の連絡先を書き換えられ、
以後のリマインドメールが攻撃者に届く。

同じ問題が `createStaffAppointment()`（`booking.ts:236-238`）にもあるが、
こちらは認証済みスタッフの操作なので優先度は下がる。

### 変更内容

1. **突合条件を「診察券番号 ＋ 生年月日の完全一致」にする**
   - `instantBookingSchema`（`validations.ts:60`）で、`patientCardNumber` が入力された場合は
     `birthDate` を必須にする（zod の `superRefine`）。
   - `birthDate` の形式検証を追加する（現状は `max(20)` のみで実質ノーチェック）。

2. **不一致時の挙動を明確に分ける**

   | ケース | 挙動 |
   | --- | --- |
   | 診察券番号あり・生年月日一致 | 既存レコードを更新（現行どおり） |
   | 診察券番号あり・生年月日不一致 | **既存レコードを更新しない。** 新規レコードを作り、`ReceptionTask`（type: `identity_check`）を起票して受付が突合する |
   | 診察券番号あり・該当なし | 新規レコード＋ `chart_link` タスク（現行どおり） |
   | 診察券番号なし | 新規レコード（現行どおり） |

3. **更新できるフィールドを絞る**
   既存レコードにマッチした場合でも、`name` と `birthDate` は上書きしない
   （改名は受付での本人確認を経るべき情報）。
   更新対象は `phone` / `email` のみとし、変更があれば `AppointmentEvent` に記録する。

4. **診察券番号なしでの重複を抑制する**
   現状、診察券番号を入れないと毎回新規 `Patient` が作られる。
   `phone` の完全一致 ＋ `birthDate` 一致を補助的な突合キーとして使い、
   一致した場合は既存レコードに予約を紐付ける（更新はせず）。
   一致しない場合のみ新規作成する。

5. **初診の扱い**（確認事項 A に依存）
   「初診は電話予約必須」が正なら、`visitType === "initial"` のとき
   Web予約フォームを電話導線に切り替える（`intakeMode` と同様の分岐）。

### 受け入れ条件
- 他人の診察券番号＋誤った生年月日で予約しても、既存 `Patient` の氏名・電話・メールが変わらない。
- 上記のケースで `ReceptionTask`（`identity_check`）が起票される。
- 既存レコードにマッチした場合、`name` / `birthDate` が上書きされない。
- 生年月日が未登録の既存患者（`birthDate === null`）に対しては自動突合せず、受付タスクに回る。

### リスク
中。既存の `Patient` レコードで `birthDate` が未設定のものは自動突合できなくなり、
受付タスクが増える。**移行前に `SELECT count(*) FROM "Patient" WHERE "birthDate" IS NULL` を確認し、
件数が多い場合はクリニックと運用を相談する。**

### マイグレーション
`ReceptionTask.type` に `identity_check` を追加（enum ではなく String なので DDL 不要）。
`SlotHold.clientKey` の追加は Step 4 と同一マイグレーションにまとめる。

---

## Step 6: セキュリティヘッダー／Cron／管理ログイン

### 目的
患者 PII を扱うサイトとして最低限のハードニングを行う。

### 6-1. セキュリティヘッダーの追加

`next.config.ts` に `headers()` が存在せず、CSP / X-Frame-Options / Referrer-Policy / HSTS が
すべて未設定。

追加するヘッダー：

| ヘッダー | 値 | 備考 |
| --- | --- | --- |
| `Content-Security-Policy` | `default-src 'self'; img-src 'self' data: https://*.googleapis.com https://*.gstatic.com; frame-src https://www.google.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'` | Google マップ埋め込み（`page.tsx:334`, `/access`）を許可。Next.js のインラインスクリプトのため `'unsafe-inline'` が必要。nonce 方式は Step 6 のスコープ外 |
| `X-Frame-Options` | `SAMEORIGIN` | |
| `X-Content-Type-Options` | `nosniff` | |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | `/appointments/manage?token=` の漏洩対策 |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | 本番のみ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | |

**注意：** CSP は Google マップ iframe と Next.js の RSC で壊れやすい。
`Content-Security-Policy-Report-Only` で 1 週間運用してから本適用する。

### 6-2. Cron エンドポイントのフェイルクローズ化

`src/app/api/cron/appointment-reminders/route.ts:16`：
```ts
const secret = process.env.CRON_SECRET;
if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) return 401;
```
`CRON_SECRET` が未設定なら**誰でも叩ける**。以下に変更する：
```ts
if (!secret) return NextResponse.json({ error: "Cron is not configured" }, { status: 503 });
if (request.headers.get("authorization") !== `Bearer ${secret}`) return 401;
```
`RESEND_WEBHOOK_SECRET` は既にこの形（`webhooks/resend/route.ts:8`）なので、それに揃える。

### 6-3. 管理ログインの保護

`src/lib/actions/auth.ts:14` の `login` にレート制限がない。
患者氏名・電話・診察券番号が見える画面が、単一の共有パスワード 1 枚で守られている。

1. **レート制限を追加**：`allowPublicSubmission("admin-login")`（5 回 / 15 分）を通す。
   失敗時は `AuditEvent` に `auth.login_failed` を記録する。
2. **`checkPassword()` の長さ比較を修正**（`src/lib/auth.ts:51-53`）
   `inputBuf.length !== expectedBuf.length` で早期 return しており、パスワード長が漏れる。
   両者を SHA-256 でハッシュしてから `timingSafeEqual` する。
3. **セッション Cookie に `__Host-` プレフィックスを付ける**（本番のみ）。
4. **ログイン成功／ログアウトも `AuditEvent` に記録する。**

> **将来課題（本計画のスコープ外）：** スタッフごとのアカウント発行と操作ログの紐付け。
> 現状は「誰が操作したか」が記録されない。医療情報を扱う以上、いずれ必要になる。
> `AuditEvent.actorType` は既に存在するので、`actorId` を追加する余地はある。

### 6-4. 管理トークンの有効期限見直し

`booking.ts:153` の `AppointmentAccessToken` は **180 日**有効。
URL クエリに乗る長期ベアラートークンとしては長い。
**診察日の 7 日後まで**に短縮し、`cancelAppointmentByToken` / 予約完了時に
不要になったトークンを `revokedAt` で失効させる。

### 受け入れ条件
- 本番ドメインで `curl -I` して上記ヘッダーがすべて返る。
- `CRON_SECRET` 未設定時に `/api/cron/appointment-reminders` が 503 を返す。
- 管理ログインを 6 回失敗すると 429 になる。
- ログイン試行が `AuditEvent` に残る。
- Google マップが CSP 適用後も表示される。

### リスク
中。CSP が最大のリスク。Report-Only 期間を必ず設ける。

---

## Step 7: Web予約枠を受付時間に合わせる

### 目的
受付終了後の枠が Web予約で取得できてしまう状態を解消する。

### 現状の問題

`src/lib/booking.ts:12-19` の `WEEKLY_RULES`：
```
月火金: 09:00-12:00, 14:00-18:00
水:     09:00-12:00, 15:00-19:00
木:     09:00-12:00
土:     09:00-13:00
```
20 分刻みで全枠を開放している。一方 `/hours` の受付終了は：
- 木曜：新患 11:00／再診 11:30
- 土曜：12:00

→ **木曜 11:40 の枠、土曜 12:20 の枠が Web で予約できる。** 患者は来院して受付終了を告げられる。

さらに `/hours` には「新患・お久しぶり・別部位は**すべて事前に電話予約が必要**」と明記されているのに、
Web予約は初診枠を素通しで確定する（確認事項 A）。

### 変更内容

1. **`WEEKLY_RULES` を `clinic-info.ts` の `SCHEDULE`（Step 2 で作成）から導出する**
   ハードコードを撤廃し、枠の終端を「診療終了時刻」ではなく「**受付終了時刻**」にする。

2. **新患枠と再診枠を分ける**（確認事項 C の回答による）
   - **案 A（推奨・安全側）：** 全枠を新患受付終了に合わせる。実装が単純。
     再診患者は 11:00〜11:30 の枠を Web で取れなくなるが、電話では取れる。
   - **案 B：** `ServiceType` を「初診」「再診」の 2 つに分け、
     それぞれ別の `ScheduleRule` を持たせる。既存スキーマで対応可能だが、
     `SERVICE_CODE = "outpatient"` 前提のコードが `booking.ts` 全体にあるため改修範囲が広い。

3. **既存スロットの移行**
   `WEEKLY_RULES` を変更すると、既に生成済みの `AppointmentSlot` に
   「受付終了後の枠」が残る。マイグレーションではなくデータ移行スクリプトで対応する：
   - 受付終了後に該当する未予約スロットを `status: "blocked"` にする（削除しない）。
   - **既に予約が入っているスロットは変更しない。** 一覧を出力し、
     クリニックが個別に患者へ連絡できるようにする。

   ```bash
   npx tsx scripts/migrate-slots-to-reception-hours.ts --dry-run
   ```
   必ず `--dry-run` で影響範囲を確認してから実行する。

4. **`minLeadMinutes` の見直し**
   現状 60 分。当日の直前予約を許容するか、クリニックの運用に合わせて調整する。

5. **予約可能日数の不一致を解消**
   `booking-form.tsx:19` は 21 日、`ServiceType.bookingHorizonDays` は 30 日。
   フォーム側を `bookingHorizonDays` から取得するように変更する。

6. **休診日を日付ボタンから除外する**
   `booking-form.tsx:19` は 21 日分を無条件に並べるため、日曜（休診）も押せる。
   `SCHEDULE` を参照して休診日はボタン自体を出さない、または `disabled` ＋「休診」表示にする。

7. **`/hours` の記述と実装を一致させる**
   「新患は電話予約必須」が維持されるなら、`/reserve` の初診選択時に電話導線へ切り替える。

### 受け入れ条件
- Web予約で選択できる枠の終端が、全曜日で受付終了時刻以内。
- 休診日が日付ボタンに現れない（または明示的に休診と分かる）。
- 移行スクリプトの `--dry-run` 出力に、既存予約への影響が明示される。
- `/hours` の記述と `/reserve` の挙動が矛盾しない。

### リスク
**高。** 既存予約への影響がある。以下を必ず守る：
- 本番実行前に DB のバックアップを取る。
- `--dry-run` で影響件数を確認し、クリニックの承認を得る。
- 既存予約は自動変更せず、一覧を出して人が判断する。

---

## Step 8: デザイントークンの統合と下層ページ展開

### 目的
トップページと下層 15 ページが「別サイト」に見える状態を解消し、
参考3サイトと同等の一貫性を持たせる。

### 現状の問題

下層 15 ページはすべて同じテンプレートで書かれている：
```tsx
<div className="mx-auto max-w-{2xl|3xl|4xl|6xl} px-4 py-12">
  <PageHeader title="..." description="..." />
  <section className="mt-8">
    <h2 className="text-xl font-bold text-primary">...</h2>
```

| 観点 | トップ | 下層 |
| --- | --- | --- |
| h1 | 明朝体 62.9px、フルブリード | ゴシック 24px、`PageHeader` |
| 角丸 | `rounded-none`（0px） | `rounded-xl` / `2xl` / `3xl`（14.4〜24px） |
| コンテナ幅 | 1200px | 672 / 768 / 896 / 1152px の 4 種混在 |
| セクション余白 | `clamp(76px, 9vw, 140px)` | `mt-8` / `mt-10` / `mt-12` |
| 背景 | セクションごとに切替 | 一律 `--background` |

`/reserve` には角丸 20.8px が 24 箇所ある。トップは全部 0px。

### 変更内容

#### 8-1. 共通プリミティブの作成

下層ページの構造は一貫しているため、**共通コンポーネントを作って差し替えるだけの機械的作業に落とせる。**

| コンポーネント | 役割 | 置き換え対象 |
| --- | --- | --- |
| `<PageHero>` | 下層ページの h1 領域。トップの `.hero-shell` と同じ語彙（eyebrow ＋ 明朝見出し ＋ パンくず） | `<PageHeader>` 全 15 ページ |
| `<Section>` | セクション区切り。`variant="default" \| "alt" \| "dark"` で背景を切替 | 各ページの `<section className="mt-N">` |
| `<SectionHeading>` | h2。トップの `.section-heading` と統一 | `<h2 className="text-xl font-bold text-primary">` |
| `<InfoTable>` | 定義表。`/about` `/hours` `/medical` で 3 種類の書き方がある | 各ページの `<table>` |
| `<PhotoCard>` | 写真＋キャプション | `/about` `/facility` の `<figure>` |
| `<CtaBand>` | 電話／予約への導線バンド | 各ページ末尾の `<Button>` 群 |

#### 8-2. レイアウトトークンの統一

```
--container-wide:   1200px   /* トップ、写真主体のページ */
--container-default: 960px   /* 通常の情報ページ */
--container-narrow:  720px   /* フォーム、長文 */
--section-gap: clamp(64px, 8vw, 120px)
--radius: 0px  または 一律の値   /* 確認事項 E とセットで決める */
```

角丸は**トップの `rounded-none` に揃える**ことを推奨する。
エディトリアルな直線基調がこのサイトの個性であり、下層だけ丸いのが不整合の主因。

#### 8-3. パンくずリストの追加

現状どのページにもパンくずがない。参考3サイトはいずれも設置している。
階層が浅いサイトでも「今どこにいるか」の手がかりとして有効。
`BreadcrumbList` の JSON-LD も併せて出力する（SEO 効果あり）。

#### 8-4. 情報設計の見直し

参考3サイトのナビゲーションは**訪問者の立場**で切られている：

| 山王病院 | 青山（現状） |
| --- | --- |
| ご来院の方へ／初診の方へ／再診の方へ／ご入院の方へ／医療関係者の方へ | 医院について／診療内容／医師・スタッフ／診療時間／アクセス |

青山は**病院側の資料の分類**になっており、「初めて行くけど何を持っていけばいい？」に
一発で答える入口がない。以下を提案する：

- グローバルナビに **「初めての方へ」** を追加する（`/first-visit`）。
  内容は既存の `FirstVisitFlow`（`/medical` 内）＋持ち物＋受付時間＋予約方法を集約。
- `QuickActions`（トップ）の 3 項目を「初めての方へ／診療時間／アクセス」に見直す。
- `NAV_LINKS`（`clinic-info.ts:45`）の 11 項目は多すぎる。
  主要 5〜6 項目に絞り、残りはフッターへ。

> この項目は情報設計の変更を伴うため、**クリニックの合意が必要**。
> 実装前にサイトマップ案を提示して承認を得る。

#### 8-5. 表記の統一（確認事項 F）

「予約リクエスト」→「Web予約」に統一する。対象は 8 箇所：
`page.tsx:87,293` / `quick-actions.tsx:7` / `mobile-nav.tsx:68` / `site-footer.tsx:30` /
`medical/page.tsx:38` / `faq/page.tsx:21` / `layout.tsx:17,27`

#### 8-6. デッドコードの整理

| 対象 | 状態 | 対応 |
| --- | --- | --- |
| `src/components/reservation-form.tsx`（225 行） | どのページからも import されていない | 削除 |
| `src/lib/actions/reservation.ts` の `createReservation` | 上記からのみ呼ばれる | 削除 |
| `src/lib/clinic-schedule.ts` | `createReservation` からのみ使用 | 削除（Step 2 で `SCHEDULE` に統合済み） |
| `Reservation` モデル／`/admin/reservations` | 旧「予約リクエスト」の受信箱。新しい即時予約と併存し、予約の概念が 2 つある | **クリニックに確認。** 過去データがあるなら参照専用として残す。無ければモデルごと削除 |

`updateReservationStatus`（`reservation.ts:134`）は `/admin/reservations` から使われているので、
モデルを残す場合は維持する。

#### 8-7. 個別の不具合修正

| 箇所 | 問題 | 対応 |
| --- | --- | --- |
| `appointments/manage/page.tsx:14,16` | `layout.tsx` の `<main>` の中でさらに `<main>` を出している（HTML 不正） | `<div>` に変更 |
| `reserve/complete/page.tsx` | 同上の可能性。要確認 | 同上 |
| `faq/page.tsx:89` | `<a href="/contact">` が `next/link` でない | `<Link>` に変更 |
| `booking-form.tsx:83` | 初診／再診のラジオが `sr-only` で、キーボードフォーカスが見えない | ラベルに `:focus-within` のリングを追加 |
| `booking-form.tsx` 全体 | 確認画面がない。エラーがフォーム末尾に 1 本まとまるだけで、どの項目が悪いか分からない | 確認ステップを追加し、`aria-describedby` でフィールド別エラーを出す |
| `booking-form.tsx:84` | ホールドの残り時間が「5分以内に」の文言のみ。入力中に突然切れる | カウントダウン表示＋残り 1 分で警告 |

### 受け入れ条件
- 全 16 ページでコンテナ幅が 3 種類（`wide` / `default` / `narrow`）のいずれかに収まる。
- 全 16 ページで h1 のスタイルが同一（`PageHero` 経由）。
- 角丸の値が 1 種類。
- `grep -rE "#[0-9a-fA-F]{3,6}" src/` の結果が `globals.css` の `:root` のみ。
- `scripts/audit-a11y.mjs` が全ページで pass。
- デッドコードが 0（`npx eslint` ＋ 未使用 export の検出）。

### リスク
中。ページ数が多いが、テンプレートが一貫しているため機械的に進められる。
情報設計の変更（8-4）はクリニックの承認が前提。

---

## 9. 共通の検証手順

各 Step 完了時に以下を実行する。

```bash
npm run lint          # eslint
npx tsc --noEmit      # 型チェック（現状クリーン。これを維持する）
npm run audit         # scripts/audit-a11y.mjs（Step 3 で新規作成）
npm run build         # prisma generate + migrate deploy + next build
```

### 手動確認が必要な項目

| 項目 | 幅 | 確認内容 |
| --- | --- | --- |
| ナビゲーション | 320/375/768/820/900/1024/1180/1440 | 主要ナビ・電話・予約の 3 導線に到達できる |
| 予約フロー | 375 / 1440 | 枠選択 → ホールド → 確定 → 完了 → 確認メール → 変更 → 取消 |
| 管理画面 | 375 / 1440 | ログイン → 今日の予約 → 電話予約 → 受付状態変更 |
| 印刷 | — | `/hours` `/access` が印刷して読める（高齢の患者は印刷して持参することがある） |

### スクリーンリーダー確認（Step 3・8 完了後）
NVDA または VoiceOver で、トップ → 予約 → 完了までを音声のみで操作できること。

---

## 10. デプロイ計画

| 段階 | 内容 |
| --- | --- |
| 1 | プレビュー環境（Vercel Deployment Protection 有効）で Step 1〜3 を確認 |
| 2 | Step 1〜3 を本番へ。**表示のみの変更なので単独でロールバック可能** |
| 3 | Step 4・6 をプレビューで確認（CSP は Report-Only で 1 週間） |
| 4 | Step 4・6 を本番へ。CSP を本適用 |
| 5 | **DB バックアップ取得**。Step 5・7 をプレビューで確認、移行スクリプトを `--dry-run` |
| 6 | クリニックの承認後、Step 5・7 を本番へ。移行スクリプトを実行 |
| 7 | Step 8 をプレビューで確認。情報設計の変更はクリニック承認後 |
| 8 | Step 8 を本番へ |

### 環境変数の追加

| 変数 | Step | 必須 | 備考 |
| --- | --- | --- | --- |
| `UPSTASH_REDIS_REST_URL` | 4 | 推奨 | 未設定時は警告ログを出して通過 |
| `UPSTASH_REDIS_REST_TOKEN` | 4 | 推奨 | 同上 |
| `CRON_SECRET` | 6 | **必須化** | 未設定なら Cron が 503 |

`.env.example` と `README.md` の該当箇所も更新する。

---

## 11. 本計画のスコープ外

以下はレビューで気づいたが、今回は扱わない。

- **スタッフ個別アカウント**：現状は共有パスワード 1 枚。操作者が記録されない。
  医療情報を扱う以上いずれ必要だが、規模が大きいため別計画とする。
- **予約完了メールの HTML 化**：現状プレーンテキストのみ。機能上の問題はない。
- **電子カルテ連携**：製品名と API 仕様が確定してから（`README.md` 記載どおり）。
- **`CONTENT-TODO.md` の未確定コンテンツ**：採用情報、FAQ の一部回答、スタッフ人数。
  クリニック側の入力待ち。
