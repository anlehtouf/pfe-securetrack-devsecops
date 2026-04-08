#!/usr/bin/env bash
# ============================================================
# SecureTrack — Reset to Vulnerable State
# Use this to demonstrate the DevSecOps pipeline catching
# vulnerabilities in the initial vulnerable state.
# ============================================================

set -euo pipefail

echo "Resetting SecureTrack to vulnerable state..."
echo ""
echo "This script restores the intentional vulnerabilities"
echo "used for DevSecOps pipeline demonstration."
echo ""
echo "Vulnerabilities that will be present:"
echo "  V1  — Hardcoded API key in logger.js"
echo "  V2  — Hardcoded JWT secret in auth middleware"
echo "  V3  — SQL injection via raw query in incidentService"
echo "  V4  — XSS via dangerouslySetInnerHTML in IncidentDetail"
echo "  V5  — Vulnerable lodash@4.17.20"
echo "  V6  — Vulnerable node:16 base image"
echo "  V7  — Container runs as root (no USER directive)"
echo "  V8  — No HEALTHCHECK in Dockerfile"
echo "  V9  — Debug mode enabled in error handler"
echo "  V10 — Missing helmet security headers"
echo "  V11 — No rate limiting on auth endpoints"
echo "  V12 — Weak password policy (min 4 chars)"
echo "  V13 — Logging sensitive data (password)"
echo "  V14 — CORS wildcard allows any origin"
echo "  V15 — Old Express version"
echo ""
echo "Run 'git checkout vulnerable-baseline' to restore these."
echo "Then push to trigger the pipeline and observe detection."
