# Production Workflow

This document defines the production work process for Gotocosmic CMS, a Next.js + Payload CMS application packaged with Docker and verified by GitHub Actions.

## Scope

The production workflow covers:

- Preparing code for production.
- Running local verification before push.
- Letting GitHub Actions compile Next.js and Payload CMS in the cloud.
- Building the Docker image in CI.
- Preparing production environment variables.
- Running database migrations before production traffic.
- Deploying and rolling back.

## Branch And Commit Flow

Use `main` as the production branch.

```bash
git status --short --branch
git add <changed-files>
git commit -m "type: short production-safe summary"
git push
```

A push to `main` triggers `.github/workflows/payload-build.yml`.

Do not push `.env`, `.next`, `node_modules`, generated sitemap files, local media uploads, or TypeScript build info. These are excluded by `.gitignore` and `.dockerignore`.

## Local Verification

Run these checks before pushing production-sensitive changes:

```bash
pnpm generate:importmap
pnpm generate:types
pnpm exec tsc --noEmit
pnpm run build
```

Use CI-like build flags when verifying cloud packaging behavior without requiring production content at build time:

```bash
PAYLOAD_DATABASE_PUSH=true \
SKIP_PAYLOAD_STATIC_PARAMS=true \
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gotocosmic_ci" \
PAYLOAD_SECRET="ci_payload_secret_for_local_build" \
CRON_SECRET="ci_cron_secret_for_local_build" \
PREVIEW_SECRET="ci_preview_secret_for_local_build" \
NEXT_PUBLIC_SERVER_URL="http://localhost:3000" \
pnpm run build
```

`SKIP_PAYLOAD_STATIC_PARAMS=true` is for CI and Docker build only. It prevents build-time static route enumeration from querying Payload content tables before a production database is attached. Runtime pages still query Payload normally.

## GitHub Actions Cloud Build

Workflow file:

```txt
.github/workflows/payload-build.yml
```

The workflow runs on pushes and pull requests targeting `main` or `master`.

Current job steps:

1. Checkout code.
2. Setup pnpm.
3. Setup Node.js `22.17.0` with pnpm cache.
4. Install dependencies with `pnpm install --frozen-lockfile`.
5. Generate Payload import map.
6. Generate Payload types.
7. Run TypeScript check.
8. Build Next.js and Payload CMS.
9. Build the Docker image with `docker/build-push-action`.

The workflow also starts a PostgreSQL 16 service for build-time Payload initialization.

CI build environment:

```txt
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gotocosmic_ci
PAYLOAD_SECRET=ci_payload_secret_for_github_actions
CRON_SECRET=ci_cron_secret_for_github_actions
PREVIEW_SECRET=ci_preview_secret_for_github_actions
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
PAYLOAD_DATABASE_PUSH=true
SKIP_PAYLOAD_STATIC_PARAMS=true
```

These CI secrets are throwaway build values. Production must use real secret values configured in the deployment platform, not these placeholders.

## Docker Build

Dockerfile:

```txt
Dockerfile
```

The Dockerfile uses a multi-stage build:

1. `base`: Node Alpine, pnpm via Corepack, `libc6-compat`.
2. `deps`: installs dependencies from `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, and `.npmrc`.
3. `builder`: generates Payload import map/types and runs `pnpm run build`.
4. `runner`: copies `public`, `.next/standalone`, and `.next/static`, then runs `node server.js` as the non-root `nextjs` user.

`next.config.ts` must keep:

```ts
output: 'standalone'
```

`pnpm-workspace.yaml` must be copied into the Docker deps stage. It contains `allowBuilds` for native dependencies such as `sharp`, `esbuild`, and `unrs-resolver`; without it, pnpm can fail Docker install with `ERR_PNPM_IGNORED_BUILDS`.

## Production Environment Variables

Set these in the production host or deployment platform:

```txt
DATABASE_URL=
PAYLOAD_SECRET=
NEXT_PUBLIC_SERVER_URL=
CRON_SECRET=
PREVIEW_SECRET=
```

For S3-compatible media storage:

```txt
S3_BUCKET=
S3_REGION=auto
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_FORCE_PATH_STYLE=false
```

For SMTP:

```txt
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_ADDRESS=noreply@example.com
SMTP_FROM_NAME=Gotocosmic CMS
```

Optional production seed gate:

```txt
ENABLE_SEED_ENDPOINT=false
```

Set `ENABLE_SEED_ENDPOINT=true` only for controlled production initialization with an authenticated admin user.

## Database Workflow

Production schema changes must use Payload migrations.

Create migrations after schema changes:

```bash
pnpm payload migrate:create
```

Apply migrations before production traffic uses the new code:

```bash
pnpm payload migrate
```

Recommended deployment order:

1. Build and verify the new image in CI.
2. Back up the production database.
3. Run `pnpm payload migrate` against the production database.
4. Deploy the new image.
5. Smoke test `/`, `/admin`, public pages, posts, search, sitemap routes, preview, and webhook retry endpoint.

Do not rely on `PAYLOAD_DATABASE_PUSH=true` in production. It is a CI/build convenience for disposable databases only.

## Deployment Checklist

Before deployment:

- GitHub Actions latest run is green.
- Docker image build step is green.
- Production environment variables are set.
- Database backup exists.
- Required Payload migrations have been reviewed.
- S3 and SMTP values are configured if production uses them.
- `NEXT_PUBLIC_SERVER_URL` matches the production domain and has no trailing slash.

After deployment:

- Open `/admin` and confirm login loads.
- Open the home page and representative public pages.
- Check header/footer settings render from Payload globals.
- Check media URLs resolve.
- Check `/pages-sitemap.xml` and `/posts-sitemap.xml`.
- Trigger or inspect webhook delivery retry if webhooks are enabled.
- Review application logs for Payload database, email, and storage errors.

## Rollback

If deployment fails after the image is released:

1. Roll back to the previous known-good image or commit.
2. If migrations were applied, decide whether data-compatible rollback is possible.
3. Use `pnpm payload migrate:down` only when the migration was designed and reviewed as reversible.
4. Restore the database backup if rollback cannot safely preserve data.
5. Re-run smoke tests after rollback.

## Current Verified Cloud Run

Latest verified cloud build at the time this workflow was written:

```txt
Commit: d77592c8d32a732bbefb2658ffa67276f32badf7
Workflow: Payload CMS Build
Run: https://github.com/vivosnail66-cloud/Company-website/actions/runs/32232225516
Result: success
```

Successful steps included both `Build Next.js and Payload CMS` and `Build Docker image`.
