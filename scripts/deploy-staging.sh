#!/usr/bin/env bash
# ============================================================
# SecureTrack — Staging Deployment Script
# ============================================================

set -euo pipefail

IMAGE_TAG=${1:-latest}
COMPOSE_DIR="infrastructure"

echo "Deploying SecureTrack to staging"
echo "================================="
echo "Image tag: $IMAGE_TAG"
echo ""

cd "$COMPOSE_DIR"

echo "[1/4] Pulling latest images..."
export BACKEND_IMAGE="ghcr.io/${GITHUB_REPOSITORY:-your-org/securetrack}/securetrack-backend:$IMAGE_TAG"
docker compose pull

echo "[2/4] Stopping current stack..."
docker compose down

echo "[3/4] Starting new stack..."
docker compose up -d

echo "[4/4] Waiting for services to be healthy..."
sleep 10

cd ..
./scripts/health-check.sh

echo ""
echo "Deployment complete"
