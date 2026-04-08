# SecureTrack — Operations Runbook

## Quick Reference

| Task | Command |
|------|---------|
| Start local stack | `cd infrastructure && docker compose up -d` |
| Stop local stack | `cd infrastructure && docker compose down` |
| View logs | `docker compose logs -f <service>` |
| Run backend tests | `cd app/backend && npm test` |
| Run frontend tests | `cd app/frontend && npm test` |
| Run security scan locally | `./scripts/generate-report.sh` |
| Deploy to staging | `./scripts/deploy-staging.sh <tag>` |
| Health check | `./scripts/health-check.sh` |

## Deployment Procedure

### Prerequisites
- Docker & Docker Compose installed
- Access to GitHub Container Registry
- `.env` file configured with secrets

### Standard Deployment
1. Merge PR to `main`
2. GitHub Actions triggers `cd-deploy.yml`
3. Image is pulled from GHCR
4. Docker Compose recreates containers
5. Health check verifies deployment
6. DAST scan runs against staging

### Manual Deployment
```bash
./scripts/deploy-staging.sh sha-a1b2c3d
```

## Rollback Procedure

If a deployment fails or causes issues:

1. **Identify the last known good image tag** (from previous successful deployment)
   ```bash
   docker images | grep securetrack-backend
   ```

2. **Pull and redeploy the previous image**
   ```bash
   export BACKEND_IMAGE=ghcr.io/<org>/securetrack-backend:sha-<previous>
   cd infrastructure
   docker compose up -d
   ```

3. **Verify rollback with health check**
   ```bash
   ./scripts/health-check.sh
   ```

4. **Investigate the failed deployment** via GitHub Actions logs and the ZAP report.

## Incident Response

| Incident | Action |
|----------|--------|
| Pipeline fails on secret detection | Remove secret from git history, rotate secret, force push |
| Pipeline fails on SAST | Review Semgrep output, fix vulnerability, re-run |
| Pipeline fails on image scan | Update base image or vulnerable dependency, rebuild |
| Staging application down | Check `docker compose logs backend db`, restart stack |
| High DAST findings | Review ZAP report, patch runtime issue, redeploy |

## Monitoring

### Access Grafana
- URL: http://localhost:3001
- Default credentials: `admin / admin` (change in production)
- Dashboard: "SecureTrack — DevSecOps Security Metrics"

### Key Metrics to Watch
- `ci_build_status` — Current build health
- `ci_gitleaks_findings` — Should always be 0
- `ci_semgrep_high` — Should always be 0
- `ci_trivy_critical` — Should always be 0
- `ci_test_coverage` — Should be >= 70%
- `http_request_duration_seconds` — Backend response times
- `http_requests_total` — Request volume by endpoint

## Troubleshooting

### Backend won't start
1. Check database is running: `docker compose ps`
2. Check DATABASE_URL in `.env`
3. Run migrations: `cd app/backend && npx prisma migrate deploy`
4. Check logs: `docker compose logs backend`

### Frontend build fails
1. Clear node_modules: `cd app/frontend && rm -rf node_modules && npm install`
2. Check Node version: `node --version` (should be >= 20)

### Pipeline fails but local tests pass
1. Check GitHub Actions logs
2. Verify all environment variables and secrets are set
3. Check if it's a tool version mismatch (pinned in workflow)

## Contact

- Repository: github.com/anas/securetrack-devsecops
- Issues: github.com/anas/securetrack-devsecops/issues
