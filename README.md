# Gotocosmic CMS

Gotocosmic CMS is a Payload 3 + Next.js content management system with multilingual content, editorial workflow, site chrome settings, API tokens, audit logs, webhook delivery logs, and a production media storage path.

## Features

- Pages, Posts, Media, Categories, Forms, Search, Redirects, SEO, Preview, and Seed content.
- Site Settings, Header, Footer, and three-level Navigation Menus.
- Role-based access roles: admin, editor, author, viewer.
- Editorial workflow for Pages and Posts.
- API tokens with one-time token display and hashed token storage.
- Webhooks with encrypted signing secrets, queued deliveries, retry worker, and delivery logs.
- Audit logs for content and settings changes.
- Optional S3-compatible media storage for production.

## Requirements

- Node.js matching `package.json` engines.
- pnpm matching `package.json` engines.
- PostgreSQL database.
- `PAYLOAD_SECRET`, `DATABASE_URL`, `NEXT_PUBLIC_SERVER_URL`, `PREVIEW_SECRET`, and `CRON_SECRET` configured.

## Environment

Copy `.env.example` and fill the deployment values.

```txt
DATABASE_URL=postgresql://127.0.0.1:5432/your-database-name
PAYLOAD_SECRET=YOUR_SECRET_HERE
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
CRON_SECRET=YOUR_CRON_SECRET_HERE
PREVIEW_SECRET=YOUR_SECRET_HERE
```

For production media storage, configure an S3-compatible bucket:

```txt
S3_BUCKET=
S3_REGION=auto
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_FORCE_PATH_STYLE=false
```

When `S3_BUCKET` is empty, local media storage is used for development.

For production email, configure SMTP:

```txt
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_ADDRESS=noreply@example.com
SMTP_FROM_NAME=Gotocosmic CMS
```

## Development

```bash
pnpm install
pnpm dev
```

Open `/admin` to access the CMS admin panel.

## Production Checks

```bash
pnpm generate:importmap
pnpm generate:types
pnpm exec tsc --noEmit
pnpm run lint
pnpm run test:int
pnpm run build
```

Run `payload generate:types` after schema changes when you want regenerated Payload types.

## Database Migrations

Schema changes must be promoted through Payload database migrations before production traffic uses them.

```bash
pnpm payload migrate:create
pnpm payload migrate
```

Run migrations before `pnpm run build` in environments that prerender public pages from database content. If a database has not been migrated, navigation menu reads may degrade to empty menus during prerendering until the new menu tables exist.

## Seed Content

The seed endpoint is reserved for controlled content initialization. It is available outside production by default. In production it requires an admin user and `ENABLE_SEED_ENDPOINT=true`.

## Webhook Delivery

Content hooks enqueue webhook deliveries instead of calling external endpoints synchronously. Trigger due queued or failed deliveries with:

```txt
POST /api/platform/webhooks/retry
Authorization: Bearer <CRON_SECRET>
```

Admins can also trigger retries from the Webhook Deliveries admin UI.
