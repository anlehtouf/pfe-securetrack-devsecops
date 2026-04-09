# ============================================================
# SecureTrack Backend — Hardened Dockerfile
# ============================================================
# Fixes applied:
#   V6: node:20-alpine (minimal, supported base image)
#   V7: USER directive — runs as non-root
#   V8: HEALTHCHECK directive
# ============================================================

FROM node:20-alpine

WORKDIR /app

# Copy dependency files first for layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Create non-root user and take ownership
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

# Expose application port
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "src/app.js"]
