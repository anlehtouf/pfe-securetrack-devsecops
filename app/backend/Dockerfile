# ============================================================
# SecureTrack Backend — Production Dockerfile
# ============================================================
# INTENTIONAL VULNERABILITIES (Phase 1 — Vulnerable Version):
#   V6: Uses node:16 (EOL, many CVEs) instead of node:20-alpine
#   V7: No USER directive (runs as root)
#   V8: No HEALTHCHECK directive
# These will be detected by Trivy, Hadolint, and Conftest
# and fixed during the hardening phase.
# ============================================================

# V6: Vulnerable base image — should be node:20-alpine
FROM node:16

WORKDIR /app

# Copy dependency files first for layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies in vulnerable version)
RUN npm install

# Copy application source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose application port
EXPOSE 5000

# V7: No USER directive — runs as root (Hadolint DL3002, Conftest policy)
# V8: No HEALTHCHECK — (Hadolint DL3009, Conftest policy)

CMD ["node", "src/app.js"]
