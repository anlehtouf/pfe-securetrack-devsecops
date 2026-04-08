#!/usr/bin/env bash
# ============================================================
# SecureTrack — Aggregate Security Reports
# ============================================================

set -euo pipefail

REPORTS_DIR="reports"
OUTPUT_FILE="$REPORTS_DIR/security-summary.md"

mkdir -p "$REPORTS_DIR"

echo "# SecureTrack Security Report" > "$OUTPUT_FILE"
echo "Generated: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# --- Gitleaks ---
echo "## Secret Scan (Gitleaks)" >> "$OUTPUT_FILE"
if [ -f "$REPORTS_DIR/gitleaks-report.sarif" ]; then
  COUNT=$(jq '[.runs[].results[]] | length' "$REPORTS_DIR/gitleaks-report.sarif" 2>/dev/null || echo "0")
  echo "- Findings: $COUNT" >> "$OUTPUT_FILE"
else
  echo "- No report found" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# --- Semgrep ---
echo "## SAST (Semgrep)" >> "$OUTPUT_FILE"
if [ -f "$REPORTS_DIR/semgrep-report.json" ]; then
  HIGH=$(jq '[.results[] | select(.extra.severity == "ERROR")] | length' "$REPORTS_DIR/semgrep-report.json" 2>/dev/null || echo "0")
  WARN=$(jq '[.results[] | select(.extra.severity == "WARNING")] | length' "$REPORTS_DIR/semgrep-report.json" 2>/dev/null || echo "0")
  echo "- High/Critical: $HIGH" >> "$OUTPUT_FILE"
  echo "- Warnings: $WARN" >> "$OUTPUT_FILE"
else
  echo "- No report found" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# --- Trivy Dependencies ---
echo "## Dependency Scan (Trivy)" >> "$OUTPUT_FILE"
if [ -f "$REPORTS_DIR/trivy-deps-report.json" ]; then
  CRIT=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL")] | length' "$REPORTS_DIR/trivy-deps-report.json" 2>/dev/null || echo "0")
  HIGH=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "HIGH")] | length' "$REPORTS_DIR/trivy-deps-report.json" 2>/dev/null || echo "0")
  echo "- Critical: $CRIT" >> "$OUTPUT_FILE"
  echo "- High: $HIGH" >> "$OUTPUT_FILE"
else
  echo "- No report found" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

# --- Trivy Image ---
echo "## Image Scan (Trivy)" >> "$OUTPUT_FILE"
if [ -f "$REPORTS_DIR/trivy-image-report.json" ]; then
  CRIT=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "CRITICAL")] | length' "$REPORTS_DIR/trivy-image-report.json" 2>/dev/null || echo "0")
  HIGH=$(jq '[.Results[]?.Vulnerabilities[]? | select(.Severity == "HIGH")] | length' "$REPORTS_DIR/trivy-image-report.json" 2>/dev/null || echo "0")
  echo "- Critical: $CRIT" >> "$OUTPUT_FILE"
  echo "- High: $HIGH" >> "$OUTPUT_FILE"
else
  echo "- No report found" >> "$OUTPUT_FILE"
fi
echo "" >> "$OUTPUT_FILE"

echo "Report generated: $OUTPUT_FILE"
cat "$OUTPUT_FILE"
