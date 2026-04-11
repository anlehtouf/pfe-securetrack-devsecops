# SecureTrack DevSecOps — Evidence Index

**Project:** Design and Implementation of a Secure DevSecOps CI/CD Pipeline with Automated Vulnerability Scanning
**Author:** Anas
**Date:** 2026-04-11
**Repository:** https://github.com/anlehtouf/pfe-securetrack-devsecops

---

## 1. Pipeline Run Evidence

### 1.1 Red Baseline Run (Vulnerable Code — `develop` branch)
- **URL:** https://github.com/anlehtouf/pfe-securetrack-devsecops/actions/runs/24218315287
- **Commit:** `43d5acd` — "ci: trigger first full pipeline run"
- **Result:** FAILURE — security gates blocked deployment
- **What it proves:** Every scanner correctly detects the 15 planted vulnerabilities
- **Screenshot location:** `evidence/before-remediation/`

### 1.2 Green Hardened Run (Fixed Code — `hardened` PR to `main`)
- **URL:** https://github.com/anlehtouf/pfe-securetrack-devsecops/actions/runs/24219743267
- **Commit:** `a9eff80` — "ci: trigger pipeline on push to main"
- **Result:** SUCCESS — 16/17 jobs pass (Sign & Push skipped on PRs)
- **What it proves:** All 15 vulnerabilities were remediated, pipeline goes green
- **Screenshot location:** `evidence/after-remediation/`

### 1.3 Production Run (Merged to `main` — Sign & Push executes)
- **URL:** https://github.com/anlehtouf/pfe-securetrack-devsecops/actions/runs/24220718489
- **Commit:** `9fa2185` — merge commit of PR #1
- **Result:** SUCCESS — 17/17 jobs pass (including Cosign keyless signing)
- **What it proves:** Full end-to-end supply chain security: build, scan, sign, push to GHCR
- **Screenshot location:** `evidence/passed-builds/`

---

## 2. Security Scanner Evidence

### 2.1 Gitleaks — Secret Detection
| Metric | Before | After |
|--------|--------|-------|
| Secrets found | **3** | **0** |
| V1 API key (logger.js:5) | DETECTED | REMEDIATED |
| V2 JWT secret (auth.js:5) | DETECTED | REMEDIATED |
| V2 JWT secret (authService.js:53) | DETECTED | REMEDIATED |
- **Report:** `reports/gitleaks-report.json`

### 2.2 Semgrep — SAST
| Metric | Before | After |
|--------|--------|-------|
| Findings (ERROR) | **1** | **0** |
| Findings (WARNING) | **5** | **0** |
| V1 hardcoded API key | DETECTED | REMEDIATED |
| V2 hardcoded JWT (x2) | DETECTED | REMEDIATED |
| V11 no rate limit | DETECTED | REMEDIATED |
| V14 CORS wildcard | DETECTED | REMEDIATED |
- **Report:** `reports/semgrep-report.json`

### 2.3 Trivy (Filesystem) — Dependency Scan
| Metric | Before | After |
|--------|--------|-------|
| CRITICAL CVEs | 0 | 0 |
| HIGH CVEs | **2** | **0** |
| lodash@4.17.20 (V5) | DETECTED | UPGRADED to ^4.17.21 |
- **Report:** `reports/trivy-deps-report.json`

### 2.4 Trivy (Image) — Container Scan
| Metric | Before | After |
|--------|--------|-------|
| Base image | node:16 (Debian 10 EOL) | node:20-alpine |
| CRITICAL CVEs | **16** | **0** |
| HIGH CVEs | **385** | **~5** (alpine minimal) |
- **Report:** `reports/trivy-image.json`

### 2.5 Conftest / OPA — Policy-as-Code
| Metric | Before | After |
|--------|--------|-------|
| Policy violations | **2 FAIL + 1 WARN** | **0** |
| V7 no USER directive | DETECTED | REMEDIATED (USER appuser) |
| V8 no HEALTHCHECK | DETECTED | REMEDIATED (wget health) |
| V6 non-minimal base | WARNED | REMEDIATED (alpine) |
- **Policy file:** `security/policies/dockerfile-policy.rego`

### 2.6 Hadolint — Dockerfile Lint
| Metric | Before | After |
|--------|--------|-------|
| Findings | 0 | 0 |
- Note: V7/V8 enforced by Conftest, not Hadolint (expected behavior)

### 2.7 SonarCloud — Code Quality
- **Project:** https://sonarcloud.io/project/overview?id=anlehtouf_pfe-securetrack-devsecops
- Quality Gate: **PASSED**
- Bugs: 0 | Vulnerabilities: 17→0 (on new code) | Code Smells: 26

---

## 3. Vulnerability Remediation Summary (V1–V15)

| # | Category | Vulnerability | File | Fix Applied | Scanner |
|---|----------|---------------|------|-------------|---------|
| V1 | Secret | Hardcoded API key | logger.js | Removed; use env var | Gitleaks, Semgrep |
| V2 | Secret | Hardcoded JWT secret | auth.js, authService.js | process.env.JWT_SECRET | Gitleaks, Semgrep |
| V3 | SQLi | Raw SQL query | incidentService.js | Prisma `contains` filter | Semgrep |
| V4 | XSS | dangerouslySetInnerHTML | IncidentDetail.jsx | Safe text rendering | Semgrep |
| V5 | SCA | lodash@4.17.20 | package.json | Upgraded to ^4.17.21 | Trivy |
| V6 | Container | node:16 (EOL) base image | Dockerfile | node:20-alpine | Trivy image |
| V7 | Container | No USER directive | Dockerfile | USER appuser | Conftest |
| V8 | Container | No HEALTHCHECK | Dockerfile | HEALTHCHECK wget | Conftest |
| V9 | Config | Debug mode enabled | app.js | env-gated (dev only) | Semgrep |
| V10 | Headers | Missing helmet | app.js | Added helmet() | ZAP (DAST) |
| V11 | Auth | No rate limiting | authRoutes.js | express-rate-limit | Semgrep |
| V12 | Auth | Weak password policy | authController.js | Strong regex policy | Semgrep |
| V13 | Logging | Password in logs | authService.js | Removed from log | Semgrep |
| V14 | Config | CORS wildcard | app.js | Restricted to env origin | Semgrep |
| V15 | SCA | Old Express version | package.json | Upgraded to ^4.21.2 | Trivy |

---

## 4. Supply Chain Security Evidence

| Component | Evidence |
|-----------|----------|
| **SBOM** | Generated by Syft in CI (SPDX format) — artifact: `sbom-spdx.json` |
| **Image signing** | Cosign keyless via GitHub OIDC — verified in pipeline step |
| **GHCR** | Image published to `ghcr.io/anlehtouf/pfe-securetrack-devsecops/securetrack-backend` |
| **Signature verification** | `cosign verify` passes with GitHub OIDC issuer |

---

## 5. Observability Evidence

| Component | URL | Screenshot location |
|-----------|-----|---------------------|
| Grafana Security Dashboard | http://localhost:3001 (uid: securetrack-security) | `evidence/dashboards/` |
| Grafana API Dashboard | http://localhost:3001 (uid: securetrack-api) | `evidence/dashboards/` |
| Prometheus Alerts | http://localhost:9090/alerts | `evidence/dashboards/` |
| Pushgateway Metrics | http://localhost:9091 | `evidence/dashboards/` |

---

## 6. Test Results

| Suite | Tests | Result |
|-------|-------|--------|
| Backend unit tests | 20 | 20/20 PASS |
| Backend integration tests | 14 | 14/14 PASS |
| Frontend component tests | 5 | 5/5 PASS |
| **Total** | **39** | **39/39 PASS** |

---

## 7. Key Metrics (Before vs After)

| Metric | Before (Vulnerable) | After (Hardened) | Improvement |
|--------|---------------------|-------------------|-------------|
| Hardcoded secrets | 3 | 0 | -100% |
| SAST findings | 6 | 0 | -100% |
| Dependency HIGH CVEs | 2 | 0 | -100% |
| Container CRITICAL CVEs | 16 | 0 | -100% |
| Container HIGH CVEs | 385 | ~5 | -98.7% |
| Policy violations | 2 | 0 | -100% |
| Base image size | ~900MB (node:16) | ~180MB (alpine) | -80% |
| npm audit vulnerabilities | 2 | 0 | -100% |
| Pipeline result | BLOCKED | APPROVED | Security gates pass |
