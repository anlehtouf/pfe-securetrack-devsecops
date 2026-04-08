# SecureTrack — DevSecOps CI/CD Pipeline

> A complete DevSecOps platform demonstrating automated vulnerability scanning,
> policy enforcement, supply-chain security, and observability — built around a
> deliberately vulnerable incident reporting application that is hardened
> through pipeline-enforced remediation.

[![CI Pipeline](https://img.shields.io/badge/CI-GitHub%20Actions-blue)](./.github/workflows/ci-pipeline.yml)
[![Security](https://img.shields.io/badge/security-DevSecOps-green)]()
[![Stack](https://img.shields.io/badge/stack-Node%20%7C%20React%20%7C%20Docker-lightgrey)]()
[![License](https://img.shields.io/badge/license-MIT-yellow)](./LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Security Controls](#security-controls)
- [Pipeline Stages](#pipeline-stages)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Demo Application](#demo-application)
- [Vulnerability Demo](#vulnerability-demo)
- [Security Findings — Before vs After](#security-findings--before-vs-after)
- [Documentation](#documentation)
- [Repository Structure](#repository-structure)
- [License](#license)

---

## Overview

SecureTrack is an end-of-studies (PFE) project that implements a complete
**Secure DevSecOps CI/CD Pipeline with Automated Vulnerability Scanning**.

The project demonstrates:
- Security integration at **every stage** of the software delivery lifecycle
- **22 pipeline stages** with **5 enforced security gates**
- **8 integrated security tools** covering secrets, SAST, SCA, containers, IaC, and DAST
- **Supply-chain security** via SBOM generation and image signing
- **Policy-as-code** for infrastructure governance
- **Measurable security improvement** with before/after metrics
- **Full observability** through Prometheus and Grafana dashboards

The pipeline catches **15 intentional vulnerabilities** and blocks deployment
until they are all remediated — demonstrating real-world DevSecOps enforcement.

---

## Architecture

```
Developer ──► GitHub ──► CI Pipeline (22 stages, 5 gates) ──► GHCR
                              │                                 │
                              │                                 │
                     ┌────────┴────────┐                 ┌──────┴─────┐
                     │ Security Tools   │                 │ Signed     │
                     │                  │                 │ Image +    │
                     │ • Gitleaks       │                 │ SBOM       │
                     │ • Semgrep        │                 └──────┬─────┘
                     │ • SonarCloud     │                        │
                     │ • Trivy          │                        ▼
                     │ • Hadolint       │                  Staging Env
                     │ • Conftest       │                  (Docker Compose)
                     │ • Syft           │                        │
                     │ • Cosign         │                        ▼
                     │ • OWASP ZAP      │                  DAST + Monitoring
                     └──────────────────┘                  (ZAP + Grafana)
```

See [docs/architecture.md](./docs/architecture.md) for the full architecture.

---

## Security Controls

| Control | Tool | Stage | Blocking |
|---------|------|-------|----------|
| Secret Detection | Gitleaks | Pre-build | Yes |
| SAST | Semgrep | Build | Yes |
| Code Quality | SonarCloud | Build | Yes |
| Dependency Scan | Trivy + npm audit | Build | Yes |
| Dockerfile Lint | Hadolint | Package | Yes |
| Image Scan | Trivy | Package | Yes |
| Policy-as-Code | Conftest/OPA | Package | Yes |
| SBOM | Syft | Package | No |
| Image Signing | Cosign (keyless) | Package | No |
| DAST | OWASP ZAP | Post-deploy | Advisory |

See [docs/security-controls.md](./docs/security-controls.md) for the full inventory.

---

## Pipeline Stages

1. Source checkout
2. Setup runtime (Node 20)
3. Install dependencies
4. Lint (ESLint + security plugin)
5. Unit tests
6. Coverage report
7. **Secret scan (Gitleaks) — BLOCKING**
8. **SAST (Semgrep) — BLOCKING**
9. **Code quality (SonarCloud) — BLOCKING**
10. **Dependency scan (Trivy + npm audit) — BLOCKING**
11. Build Docker image
12. **Dockerfile lint (Hadolint) — BLOCKING**
13. **Container image scan (Trivy) — BLOCKING**
14. SBOM generation (Syft)
15. Image signing (Cosign keyless via OIDC)
16. **Policy-as-code validation (Conftest) — BLOCKING**
17. Push image to GHCR
18. Deploy to staging
19. Post-deployment health check
20. DAST scan (OWASP ZAP baseline)
21. Upload reports as artifacts
22. Final decision summary posted to PR

See [`.github/workflows/ci-pipeline.yml`](./.github/workflows/ci-pipeline.yml)
for the complete implementation.

---

## Tech Stack

**Application**
- Backend: Node.js 20 + Express.js + Prisma ORM
- Frontend: React 18 + Vite + React Router
- Database: PostgreSQL 16

**DevSecOps**
- CI/CD: GitHub Actions
- Registry: GitHub Container Registry (GHCR)
- Secret scan: Gitleaks
- SAST: Semgrep
- Code quality: SonarCloud
- SCA: Trivy + npm audit
- Container: Docker + BuildKit
- Dockerfile lint: Hadolint
- Image scan: Trivy
- SBOM: Syft (Anchore)
- Signing: Cosign (Sigstore)
- Policy: Conftest / OPA
- DAST: OWASP ZAP
- Monitoring: Prometheus + Grafana

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Git

### Clone and setup
```bash
git clone https://github.com/<your-org>/securetrack-devsecops.git
cd securetrack-devsecops
chmod +x scripts/*.sh
./scripts/setup.sh
```

### Run locally
```bash
# Full stack (backend + frontend + database)
cd infrastructure
docker compose up -d

# With monitoring (Prometheus + Grafana)
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health: http://localhost:5000/api/health
- Metrics: http://localhost:5000/api/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin)

### Default credentials (after seed)
- Admin: `admin@securetrack.local` / `admin123`
- Reporter: `reporter@securetrack.local` / `reporter123`

---

## Demo Application

**SecureTrack** is an incident reporting and tracking platform with:
- JWT-based authentication (register/login)
- Incident CRUD (create, list, view, update status)
- Dashboard with statistics (by severity, by status)
- Role-based access (REPORTER, ADMIN)
- Health check and Prometheus metrics endpoints

See [docs/architecture.md](./docs/architecture.md) for technical details.

---

## Vulnerability Demo

The application starts with **15 intentional vulnerabilities** (marked `V1`-`V15`
in source comments). Each is detected by a specific tool in the pipeline:

| # | Vulnerability | Detected By | Severity |
|---|--------------|-------------|----------|
| V1 | Hardcoded API key | Gitleaks | HIGH |
| V2 | Hardcoded JWT secret | Gitleaks + Semgrep | HIGH |
| V3 | SQL injection (raw query) | Semgrep | CRITICAL |
| V4 | XSS via dangerouslySetInnerHTML | Semgrep | HIGH |
| V5 | Vulnerable lodash@4.17.20 | Trivy + npm audit | HIGH |
| V6 | Vulnerable node:16 base image | Trivy image | HIGH/CRIT |
| V7 | Container runs as root | Hadolint + Conftest | MEDIUM |
| V8 | No HEALTHCHECK in Dockerfile | Hadolint + Conftest | LOW |
| V9 | Debug mode in error handler | Semgrep | MEDIUM |
| V10 | Missing helmet security headers | OWASP ZAP | MEDIUM |
| V11 | No rate limiting on auth | Semgrep (custom) + ZAP | LOW |
| V12 | Weak password policy | Semgrep (custom) | MEDIUM |
| V13 | Password logged to console | Semgrep (custom) | MEDIUM |
| V14 | CORS wildcard origin | Semgrep (custom) + ZAP | MEDIUM |
| V15 | Old Express version | Trivy | HIGH |

---

## Security Findings — Before vs After

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Secrets in code | 2 | 0 | 100% |
| SAST high/critical | 6 | 0 | 100% |
| Vulnerable deps (critical) | 2 | 0 | 100% |
| Image critical CVEs | 15+ | 0 | 100% |
| Dockerfile lint errors | 3 | 0 | 100% |
| Policy violations | 2 | 0 | 100% |
| DAST high findings | 2 | 0 | 100% |
| **Total high/critical** | **30+** | **0** | **100%** |

---

## Documentation

- [Project Blueprint](./PROJECT_BLUEPRINT.md) — Complete project specification (33 sections)
- [Architecture](./docs/architecture.md) — Technical architecture
- [Security Controls](./docs/security-controls.md) — Control inventory
- [Compliance Mapping](./docs/compliance-mapping.md) — OWASP SAMM, NIST SSDF, ISO 27001
- [Threat Model](./security/threat-model/threat-model.md) — STRIDE analysis
- [Runbook](./docs/runbook.md) — Operations guide

---

## Repository Structure

```
securetrack-devsecops/
├── .github/workflows/         GitHub Actions CI/CD pipelines
├── app/
│   ├── backend/               Node.js + Express API
│   └── frontend/              React + Vite SPA
├── security/
│   ├── gitleaks/              Secret scanning rules
│   ├── semgrep/               SAST custom rules
│   ├── trivy/                 Trivy configuration
│   ├── policies/              OPA/Rego policies
│   ├── zap/                   ZAP scan config
│   └── threat-model/          STRIDE threat model
├── infrastructure/
│   ├── docker-compose.yml     Staging stack
│   ├── docker-compose.monitoring.yml  Monitoring stack
│   ├── prometheus/            Prometheus config
│   └── grafana/               Grafana dashboards
├── scripts/                   Setup, deploy, health, reporting scripts
├── docs/                      Architecture, controls, compliance, runbook
├── evidence/                  Screenshots and scan reports
├── reports/                   Generated scan outputs (gitignored)
└── README.md
```

---

## License

MIT — See [LICENSE](./LICENSE) for details.

---

## Acknowledgments

Built as an end-of-studies (PFE) project demonstrating production-grade DevSecOps
practices. Uses exclusively free and open-source tools to ensure full reproducibility.
