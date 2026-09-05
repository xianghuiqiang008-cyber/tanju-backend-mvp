FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY prisma ./prisma
RUN pnpm exec prisma generate
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN pnpm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./package.json
RUN mkdir -p /app/logs && chown -R app:app /app
USER app
EXPOSE 3000
CMD ["node", "dist/main.js"]
