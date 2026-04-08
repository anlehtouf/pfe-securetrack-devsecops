#!/usr/bin/env bash
# ============================================================
# SecureTrack — Post-Deployment Health Check
# ============================================================

set -euo pipefail

URL="${1:-http://localhost:5000}"
MAX_RETRIES=12
RETRY_INTERVAL=5

echo "Health check: $URL/api/health"
echo ""

for i in $(seq 1 $MAX_RETRIES); do
  HTTP_STATUS=$(curl -s -o /tmp/health_response.json -w "%{http_code}" "$URL/api/health" || echo "000")

  if [ "$HTTP_STATUS" = "200" ]; then
    echo "Attempt $i: HTTP 200"
    echo "Response:"
    cat /tmp/health_response.json
    echo ""
    echo ""
    echo "Application is healthy"
    exit 0
  fi

  echo "Attempt $i/$MAX_RETRIES: HTTP $HTTP_STATUS — retrying in ${RETRY_INTERVAL}s..."
  sleep $RETRY_INTERVAL
done

echo ""
echo "Health check FAILED after $MAX_RETRIES attempts"
exit 1
