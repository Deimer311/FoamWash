# ── Imagen base ───────────────────────────────────
FROM node:18-alpine

# ── Carpeta de trabajo ────────────────────────────
WORKDIR /app

# ── Dependencias ──────────────────────────────────
# Se copian primero para aprovechar el caché de Docker
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# ── Código fuente ─────────────────────────────────
COPY . .

# ── Build ─────────────────────────────────────────
RUN npm run build

# ── Puerto ────────────────────────────────────────
EXPOSE 5000

# ── Inicio ────────────────────────────────────────
CMD ["node", "dist/main"]