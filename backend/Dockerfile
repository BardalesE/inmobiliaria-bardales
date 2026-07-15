# ── EE-Stars Backend (Express + Prisma + MySQL) ──
FROM node:20-alpine AS base
WORKDIR /app

# ── deps ──
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── build (genera el cliente de Prisma) ──
FROM base AS build
COPY package.json package-lock.json* ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .

# ── runtime ──
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY . .

EXPOSE 4000
# Aplica migraciones pendientes y arranca el server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
