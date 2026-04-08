# ============================================================
# SecureTrack Frontend — Multi-stage Production Dockerfile
# ============================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Run as non-root
RUN addgroup -S app && adduser -S app -G app && \
    chown -R app:app /usr/share/nginx/html && \
    chown -R app:app /var/cache/nginx && \
    chown -R app:app /var/log/nginx && \
    touch /var/run/nginx.pid && chown app:app /var/run/nginx.pid

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
