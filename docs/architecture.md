# SecureTrack — Architecture Documentation

## Overview

SecureTrack is a DevSecOps demonstration platform consisting of:
1. A web application (frontend + backend + database) — **the thing being secured**
2. A CI/CD pipeline with integrated security controls — **the securing system**
3. Monitoring and observability stack — **the visibility layer**

## High-Level Architecture

```
Developer Workstation
      |
      | git push
      v
GitHub Repository
      |
      | triggers
      v
GitHub Actions CI Pipeline (22 stages, 5 security gates)
      |
      | on success
      v
GitHub Container Registry (signed images + SBOM)
      |
      | pull + deploy
      v
Staging Environment (Docker Compose)
      |
      | scrape metrics
      v
Prometheus + Grafana
```

## Application Architecture

### Backend (Node.js + Express)
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 16 with Prisma ORM
- **Auth**: JWT-based authentication with bcrypt password hashing
- **Port**: 5000
- **Endpoints**: `/api/auth/*`, `/api/incidents/*`, `/api/health`, `/api/metrics`

### Frontend (React + Vite)
- **Framework**: React 18 with React Router
- **Build tool**: Vite 5
- **State**: localStorage for JWT token (demo simplification)
- **Port**: 3000
- **Pages**: Login, Register, Dashboard, IncidentList, IncidentDetail, IncidentForm

### Database Schema
See `app/backend/prisma/schema.prisma`. Two models:
- `User` — id, email, password (hashed), name, role, timestamps
- `Incident` — id, title, description, severity, status, reportedBy (FK), timestamps

## CI/CD Pipeline Architecture

See `.github/workflows/ci-pipeline.yml`. The pipeline has 22 stages grouped into phases:

1. **Setup** — checkout, install dependencies
2. **Validation** — lint, unit tests, coverage
3. **Source security** — Gitleaks secret scan
4. **Code security** — Semgrep SAST, SonarCloud quality gate
5. **Dependency security** — Trivy filesystem scan, npm audit
6. **Security Gate 1** — blocks on any source/code failure
7. **Container build** — Docker image build
8. **Container security** — Hadolint, Trivy image scan, Conftest policies
9. **Supply chain** — Syft SBOM generation
10. **Security Gate 2** — blocks on any container failure
11. **Publish** — Cosign sign, push to GHCR
12. **Deploy** — deploy to staging, health check
13. **Post-deploy** — OWASP ZAP DAST scan
14. **Reporting** — upload artifacts, post PR summary

## Security Controls Map

| Layer | Controls |
|-------|----------|
| Pre-commit | Pre-commit hooks, Gitleaks, Hadolint |
| Source | Branch protection, PR reviews, Gitleaks in CI |
| Build | ESLint security, Semgrep SAST, SonarCloud |
| Dependencies | Trivy fs scan, npm audit, SBOM |
| Container | Hadolint, Trivy image scan, Conftest |
| Supply chain | SBOM (Syft), image signing (Cosign) |
| Deployment | Security gate enforcement, health checks |
| Runtime | OWASP ZAP DAST, Prometheus monitoring |

## Infrastructure

### Staging Stack (docker-compose.yml)
- `db` — PostgreSQL 16-alpine
- `backend` — SecureTrack API (port 5000)
- `frontend` — React app served by nginx (port 3000)

### Monitoring Stack (docker-compose.monitoring.yml)
- `prometheus` — metrics collection (port 9090)
- `pushgateway` — CI metrics push target (port 9091)
- `grafana` — dashboards (port 3001)

## Network Topology

All services communicate on a shared Docker bridge network `securetrack`.
The frontend proxies `/api/*` requests to the backend. The database is only
accessible within the network. Prometheus scrapes backend metrics via the
internal network.
