#!/usr/bin/env bash
# ============================================================
# SecureTrack — One-command local setup
# ============================================================

set -euo pipefail

echo "SecureTrack DevSecOps — Local Setup"
echo "===================================="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "ERROR: Docker is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js is required but not installed."; exit 1; }

echo "[1/5] Setting up environment files..."
if [ ! -f app/backend/.env ]; then
  cp app/backend/.env.example app/backend/.env
  echo "  Created app/backend/.env — edit this file with your secrets"
fi

echo "[2/5] Installing backend dependencies..."
(cd app/backend && npm install)

echo "[3/5] Installing frontend dependencies..."
(cd app/frontend && npm install)

echo "[4/5] Starting Docker services..."
(cd infrastructure && docker compose up -d db)
sleep 5

echo "[5/5] Running database migrations..."
(cd app/backend && npx prisma migrate deploy && npx prisma db seed)

echo ""
echo "Setup complete!"
echo ""
echo "Run the application:"
echo "  Backend:  cd app/backend && npm run dev"
echo "  Frontend: cd app/frontend && npm run dev"
echo ""
echo "Or start the full stack:"
echo "  cd infrastructure && docker compose up -d"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  Grafana:  http://localhost:3001 (if monitoring stack is up)"
