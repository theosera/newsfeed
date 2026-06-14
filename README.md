# Newsfeed

[![Node.js CI](https://github.com/theosera/newsfeed/actions/workflows/node.js.yml/badge.svg)](https://github.com/theosera/newsfeed/actions/workflows/node.js.yml)

Newsify ライクな個人向けニュースリーダーの MVP。複数の RSS / ニュースソースを 1 画面に集約し、未読管理・保存・検索・カテゴリ/ソース整理・ダークモードを提供します。

## 主な機能

- 複数 RSS ソースの自動集約（node-cron で 15 分間隔）＋ URL 正規化による重複除外
- ホームフィード：表示モード切替（Card / List / Newspaper）、フィルタ（すべて / 未読 / 保存済み）、ソート（新着 / 古い / 人気）、ページネーション
- 記事詳細：RSS 本文をサニタイズした HTML でリッチ表示（コードブロックのシンタックスハイライト、見出し・太字・リスト・引用）＋「元記事で読む」導線、閲覧で既読化、関連記事
- 既読管理・ブックマーク（保存）・全文検索（タイトル / 概要 / ソース名）
- カテゴリ別・ソース別ページ
- ダークモード（next-themes）
- 認証（NextAuth、Credentials + 任意で GitHub / Google OAuth）と管理画面（ソース / カテゴリ管理・手動取得・取得ログ）。`/admin/*` と `/api/admin/*` は管理者ロールで保護

## 技術スタック

| レイヤ | 採用 |
|--------|------|
| フレームワーク | Next.js 16（App Router）+ TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui + lucide-react |
| DB | PostgreSQL 16 + Prisma 7（driver adapter `@prisma/adapter-pg`）|
| 認証 | NextAuth v4 |
| RSS | rss-parser |
| 本文整形 | rehype（sanitize + highlight）|
| 定期取得 | node-cron（15 分間隔）|
| 開発環境 | Docker Compose（PostgreSQL + アプリ）|

## クイックスタート（Docker・推奨）

前提: Docker Desktop が起動していること。

```bash
cp .env.example .env          # AUTH_SECRET を設定（例: openssl rand -base64 32）
docker compose up -d          # PostgreSQL + アプリを起動（初回はイメージをビルド）
```

アプリ起動時にコンテナのエントリポイントが自動で `prisma db push` とシード投入（`RUN_SEED=true`）を実行します。完了後 → http://localhost:3000

```bash
docker compose logs -f app    # 起動ログ / 取得ログの確認
docker compose down           # 停止（DB データも消す場合は -v）
```

> シードは冪等（upsert）なので再起動しても安全です。初回以降にシードを止めたい場合は `docker-compose.yml` の `RUN_SEED` を `"false"` に。

## ローカル開発（アプリはホスト、DB のみ Docker）

```bash
cp .env.example .env
docker compose up -d postgres   # DB だけ起動
npm ci
npm run prisma:generate
npm run db:push
npm run prisma:seed
npm run dev                      # http://localhost:3000
```

## 環境変数（`.env`）

`.env.example` をコピーして作成します。`AUTH_SECRET` は必須、OAuth 関連は任意。

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

> Docker 起動時は `DATABASE_URL` / `NEXTAUTH_URL` を compose 側でコンテナ向けに上書きします（`.env` の `AUTH_SECRET` 等はそのまま利用）。

## デモアカウント（シード投入後）

| ロール | メール | パスワード |
|--------|--------|-----------|
| 管理者 | `admin@example.com` | `demo1234` |
| 一般 | `demo@example.com` | `demo1234` |

## 記事の取り込み

- 管理者でログイン → `/admin/sources` →「すべて取得」で手動取得
- もしくは 15 分間隔の cron が自動取得（`DISABLE_FEED_CRON="true"` で無効化）

## npm scripts

| スクリプト | 説明 |
|-----------|------|
| `npm run dev` | 開発サーバ |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Prisma Client 生成 |
| `npm run db:push` | スキーマを DB に反映 |
| `npm run prisma:seed` | シード投入 |
| `npm run prisma:migrate` | マイグレーション（任意）|

## 権利・著作権への配慮

- 本文は RSS の `description` / `content` のみ保存（本文スクレイピングはしない）
- サムネイルは RSS 由来 URL を参照するのみ（自サーバーに保存しない）
- 記事詳細に「元記事で読む」CTA を常設

## CI

`main` への push / PR で GitHub Actions（`.github/workflows/node.js.yml`）が `npm ci → prisma generate → lint → build` を実行します（全ページ `force-dynamic` のため、CI ではダミーの `DATABASE_URL` のみで DB 接続は不要）。
