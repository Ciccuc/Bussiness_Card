# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
ENV CHECKPOINT_DISABLE=1

FROM base AS build
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma/schema.prisma ./prisma/
RUN --mount=type=cache,target=/root/.npm npm ci
COPY nest-cli.json tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM base AS runtime
ENV NODE_ENV=production
ENV NODE_OPTIONS=--enable-source-maps
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --chmod=755 docker/entrypoint.sh ./docker/

USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -q -O /dev/null "http://127.0.0.1:${PORT:-3000}/health" || exit 1
ENTRYPOINT ["/app/docker/entrypoint.sh"]
