# Newsfeed MVP 作業ハンドオフ

## 1. プロジェクト概要

Newsify ライクなニュースフィード Web アプリの MVP。複数の RSS/ニュースソースを 1 画面に集約し、未読管理・保存・検索・カテゴリ/ソース整理・ダークモードを提供する個人向けニュースリーダー。

- リポジトリ: `/Users/theosera/dev/newsfeed`
- ステータス: 実装ほぼ完了。`npm run build` 成功済み。残タスクはローカル DB 起動 → seed → 動作確認、および Git へのアップロード。

## 2. 技術スタック

| レイヤ | 採用 |
|--------|------|
| フレームワーク | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui (base-ui) + lucide-react |
| DB | PostgreSQL 16 + Prisma 7（driver adapter `@prisma/adapter-pg`）|
| 認証 | NextAuth v4（Credentials + 任意で GitHub/Google OAuth）|
| RSS | rss-parser |
| 定期取得 | node-cron（`src/instrumentation.ts` から起動、15 分間隔）|
| テーマ | next-themes |
| 開発環境 | Docker Compose（PostgreSQL のみ）|

## 3. 重要な実装上の注意（Prisma 7）

Prisma 7 で破壊的変更があり、以下に対応済み:

- `schema.prisma` の `datasource` から `url` を削除（`provider` のみ）。
- 接続 URL は `prisma.config.ts` の `datasource.url`（`env("DATABASE_URL")`）で定義。
- `PrismaClient` は driver adapter 必須。`src/lib/db.ts` で `new PrismaPg({ connectionString })` を `adapter` として渡す。
- `datasourceUrl` / `accelerateUrl` は使用しない。

## 4. データモデル（Prisma）

要件 §8 の 8 テーブル + NextAuth テーブルを実装:

- `User`（role: USER/ADMIN, passwordHash）
- `Account` / `Session` / `VerificationToken`（NextAuth）
- `Category`（name/slug/description）
- `Source`（url/slug/enabled/lastFetchedAt, categoryId）
- `Article`（title/url(unique)/canonicalUrl(unique)/summary/content/thumbnailUrl/publishedAt/status）
- `ArticleRead`（userId+articleId unique）
- `Bookmark`（userId+articleId unique）
- `FeedFetchLog`（success/件数/errorMessage）
- `UserSetting`（theme/layout/compactMode/fontScale）

重複除外は `Article.url` / `canonicalUrl` のユニーク制約 + 取得時の事前 `findFirst` チェック。

## 5. 実装済み機能

### API（Route Handlers, `src/app/api/`）
- `GET /api/articles` 一覧（category/source/q/filter/sort/page）
- `GET /api/articles/[id]` 詳細 + 関連記事
- `POST /api/articles/[id]/read` / `unread` 既読切替（要認証）
- `POST/DELETE /api/bookmarks` 保存/解除（要認証）
- `GET /api/categories` / `GET /api/sources`
- `GET /api/search` 検索（title/summary/source名 ILIKE）
- `GET/PATCH /api/user-settings`
- 管理: `GET/POST /api/admin/sources`, `PATCH/DELETE /api/admin/sources/[id]`, `GET/POST /api/admin/categories`, `PATCH/DELETE /api/admin/categories/[id]`, `POST /api/admin/fetch`（手動取得）, `GET /api/admin/fetch-logs`
- `api/auth/[...nextauth]`

### 画面（`src/app/`）
- `/` ホーム（トップフィード）
- `/category/[slug]` カテゴリ別
- `/source/[slug]` ソース別
- `/articles/[id]` 記事詳細（閲覧で既読化、元記事リンク、関連記事）
- `/search` 検索
- `/saved` 保存済み（要ログイン）
- `/settings` 表示設定（要ログイン）
- `/login` ログイン
- `/admin/sources` ソース/カテゴリ管理 + 手動取得（admin のみ）
- `/admin/fetch-logs` 取得ログ（admin のみ）

### UI
- 3 カラムレイアウト（Sidebar / Feed / RightPanel）、モバイルは下部ナビ
- 表示モード切替: Card / List / Newspaper
- フィルタ（すべて/未読/保存済み）、ソート（新着/古い/人気）、ページネーション
- ダークモード（ヘッダーのトグル + next-themes）
- 未読/既読の視覚的区別、1 クリックで保存・既読・外部リンク

### RSS パイプライン（`src/lib/rss/`）
- `fetcher.ts`: rss-parser で取得、URL 正規化（utm 等のトラッキング除去・末尾スラッシュ整理）、重複除外、private IP/localhost を弾く簡易 SSRF 対策、`FeedFetchLog` 記録
- `cron.ts`: node-cron 15 分間隔（`DISABLE_FEED_CRON=true` で無効化）

### 権利・著作権配慮
- 本文は RSS の description/content のみ保存（スクレイピングなし）
- サムネは RSS 由来 URL 参照のみ（自サーバー保存なし）
- 詳細画面に「元記事で読む」CTA 常設

### 認証/認可
- `middleware.ts` で `/admin/*` と `/api/admin/*` を保護（admin ロールチェック）
- seed 済みアカウント:
  - 管理者: `admin@example.com` / `demo1234`
  - 一般: `demo@example.com` / `demo1234`

### seed データ（`prisma/seed.ts`）
- カテゴリ: Top / Tech / Business / World
- デモソース: GitHub Blog / MDN Blog / DEV Community
- 上記ユーザー 2 名 + UserSetting

## 6. npm scripts

```bash
npm run dev               # 開発サーバ
npm run build             # 本番ビルド（成功確認済み）
npm run lint              # ESLint
npm run prisma:generate   # Prisma Client 生成
npm run db:push           # スキーマを DB に反映
npm run prisma:seed       # seed 投入
npm run prisma:migrate    # マイグレーション（任意）
```

## 7. 環境変数（`.env`）

`.env.example` をコピーして作成。

```env
DATABASE_URL="postgresql://newsfeed:newsfeed@localhost:5432/newsfeed?schema=public"
AUTH_SECRET="（openssl rand -base64 32 で生成）"
NEXTAUTH_URL="http://localhost:3000"
GITHUB_ID=""
GITHUB_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
DISABLE_FEED_CRON="false"
```

## 8. ローカル起動手順

PostgreSQL は Docker で起動（ローカルインストール不要）。

```bash
cd /Users/theosera/dev/newsfeed
cp .env.example .env          # 未作成なら
docker compose up -d          # PostgreSQL 起動
npm install
npm run prisma:generate
npm run db:push
npm run prisma:seed
npm run dev                   # http://localhost:3000
```

記事取り込み: admin でログイン → `/admin/sources` →「すべて取得」。

## 9. 既知のハマりどころ / 環境メモ

- **Docker CLI が PATH に無い**: Docker Desktop は起動しているが `docker` コマンド未認識。実体は `/Applications/Docker.app/Contents/Resources/bin/docker`。
  - 対処（どちらか）:
    - `~/.zshrc` に `export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"` を追加
    - もしくは Docker Desktop → Settings → Advanced → CLI tools を **System** に変更し Apply & Restart（`/usr/local/bin` に symlink 作成）
- 5432 が使用中の場合: `docker-compose.yml` を `5433:5432` に変更し `.env` の `DATABASE_URL` も `5433` に合わせる。
- lint 警告（ビルドはエラーなし）:
  - `article-card.tsx` の `<img>` 使用（RSS 画像を最適化なしで参照する意図的な選択）

## 10. 残タスク（Claude Code への依頼）

1. `.gitignore` の確認（`.env`, `node_modules`, `.next` 等が除外されているか。`.env.example` はコミット対象）
2. **`.env` は絶対にコミットしない**（AUTH_SECRET 等）
3. 初回コミット作成
4. GitHub リポジトリ作成 + push（`gh repo create` 等）
5. README をプロジェクト用に更新（現在は create-next-app の初期内容のまま。本ドキュメントの「8. ローカル起動手順」を反映すると良い）
6. 余裕があれば: DB 起動 → seed → `npm run dev` で AC-001〜AC-014 の動作確認

## 11. MVP スコープ外（今回未実装 / 今後）

- ユーザー個別の RSS 登録（現状は管理者登録のみ）
- 一括既読化 / スクロール自動既読
- セピア/グレーなど追加テーマ
- PWA / オフライン
- AI 要約 / 推薦 / SNS / 通知
