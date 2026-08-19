FROM node:22.17.0-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat
RUN corepack enable pnpm

FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/gotocosmic
ARG PAYLOAD_SECRET=ci_payload_secret_for_docker_build
ARG CRON_SECRET=ci_cron_secret_for_docker_build
ARG PREVIEW_SECRET=ci_preview_secret_for_docker_build
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ARG PAYLOAD_DATABASE_PUSH=false
ARG SKIP_PAYLOAD_STATIC_PARAMS=true

ENV DATABASE_URL=$DATABASE_URL
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV CRON_SECRET=$CRON_SECRET
ENV PREVIEW_SECRET=$PREVIEW_SECRET
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
ENV PAYLOAD_DATABASE_PUSH=$PAYLOAD_DATABASE_PUSH
ENV SKIP_PAYLOAD_STATIC_PARAMS=$SKIP_PAYLOAD_STATIC_PARAMS

RUN pnpm generate:importmap
RUN pnpm generate:types
RUN pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
