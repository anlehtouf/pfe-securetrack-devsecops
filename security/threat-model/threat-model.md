# SecureTrack — Threat Model (STRIDE)

## Overview

This document presents a lightweight STRIDE-based threat model for SecureTrack.
It identifies assets, actors, attack surfaces, and mitigation controls.

## System Context

**System**: SecureTrack — Incident reporting and tracking web application
**Deployment**: Docker Compose staging environment
**Users**: Authenticated reporters and admins

## Assets (What We're Protecting)

| Asset | Type | Sensitivity |
|-------|------|-------------|
| User credentials (passwords) | Data | High |
| JWT tokens | Data | High |
| Incident data | Data | Medium |
| User PII (email, name) | Data | Medium |
| Application code | Code | Medium |
| Container images | Artifact | Medium |
| CI/CD pipeline | System | High |
| GHCR registry credentials | Secret | High |

## Actors

| Actor | Description | Trust Level |
|-------|-------------|-------------|
| Anonymous user | Unauthenticated web visitor | Untrusted |
| Reporter | Authenticated user, can create/view incidents | Low trust |
| Admin | Authenticated admin, can manage all data | Medium trust |
| Developer | Code contributor | High trust |
| CI/CD system | GitHub Actions runners | High trust |
| Attacker | External malicious actor | Adversary |

## Trust Boundaries

```
Internet ────[TB1: Network boundary]──── Web Frontend
                                             │
                                       [TB2: API boundary]
                                             │
                                         Backend API
                                             │
                                       [TB3: Data boundary]
                                             │
                                         PostgreSQL

GitHub ──[TB4: CI boundary]── GitHub Actions ──[TB5: Registry]── GHCR
                                             │
                                       [TB6: Deploy boundary]
                                             │
                                      Staging Environment
```

## STRIDE Analysis

### S — Spoofing

| Threat | Attack Surface | Mitigation |
|--------|---------------|------------|
| Impersonate user via forged JWT | Backend API auth middleware | Strong JWT secret, short expiration, signature verification |
| Phishing for credentials | Login page | HTTPS, security headers, password manager support |
| Impersonate CI/CD identity | Cosign signing | Keyless signing via GitHub OIDC, Rekor transparency log |

### T — Tampering

| Threat | Attack Surface | Mitigation |
|--------|---------------|------------|
| SQL injection | Incident search endpoint (V3) | Prisma ORM parameterized queries, SAST detection |
| XSS via incident description | IncidentDetail component (V4) | React auto-escaping, SAST detection of dangerouslySetInnerHTML |
| Tampered container image | Image pull | Cosign signature verification |
| Tampered dependencies | npm install | Lockfile, SBOM, Trivy scan |
| Man-in-the-middle | API traffic | HTTPS (production), CORS restrictions |

### R — Repudiation

| Threat | Attack Surface | Mitigation |
|--------|---------------|------------|
| User denies creating incident | Incident creation | Audit log with user ID + timestamp |
| Developer denies pushing code | Git history | Signed commits (optional), PR audit trail |
| Tampered audit logs | Log storage | Immutable logs, centralized logging (future) |

### I — Information Disclosure

| Threat | Attack Surface | Mitigation |
|--------|---------------|------------|
| Secrets in source code (V1, V2) | Git repository | Gitleaks scan, pre-commit hooks |
| Passwords in logs (V13) | Winston logger | SAST detection, log review |
| Stack traces in error responses (V9) | Error handler | Disable debug in production |
| Verbose error messages | All endpoints | Generic error messages |
| Directory traversal | Static file serving | Input validation, nginx config |
| Sensitive data in SBOM | CI artifacts | SBOM review, private registry |

### D — Denial of Service

| Threat | Attack Surface | Mitigation |
|--------|---------------|------------|
| Brute force login (V11) | Login endpoint | Rate limiting (express-rate-limit) |
| Large JSON payloads | All POST endpoints | `express.json({ limit: '10kb' })` |
| Slowloris / connection exhaustion | Nginx frontend | Connection timeouts, nginx limits |
| ReDoS via regex | Input fields | ESLint security plugin detection |
| Resource exhaustion | Container | Docker resource limits |

### E — Elevation of Privilege

| Threat | Attack Surface | Mitigation |
|--------|---------------|------------|
| Reporter accesses admin endpoints | API routes | Role-based access control via JWT claims |
| Container escape | Docker runtime | Non-root user (V7 fix), minimal base image (V6 fix), no privileged mode |
| Weak password policy (V12) | Registration | Enforce strong passwords (min 8 chars, complexity) |
| JWT secret compromise | All authenticated endpoints | Strong secret, rotation capability |
| Prototype pollution via lodash (V5) | Dependency | Update lodash, dependency scanning |

## Risk Matrix

| Threat | Likelihood | Impact | Risk | Mitigation Status |
|--------|-----------|--------|------|------------------|
| Hardcoded secrets leaked | High | High | **Critical** | Gitleaks (detective) |
| SQL injection | Medium | High | **High** | Semgrep (detective) + Prisma (preventive) |
| XSS | Medium | Medium | **Medium** | Semgrep + React escaping |
| Vulnerable dependencies | High | Medium | **High** | Trivy (detective) + updates |
| Container vulnerabilities | High | Medium | **High** | Trivy image + Hadolint + Conftest |
| Brute force login | Medium | Medium | **Medium** | Rate limiting (after fix) |
| Weak passwords | High | Medium | **High** | Password policy (after fix) |
| Unsigned images deployed | Low | High | **Medium** | Cosign signing |

## Security Controls Mapping

Each threat above is mapped to a control in `docs/security-controls.md` and
enforced by a specific pipeline stage in `.github/workflows/ci-pipeline.yml`.

## Review Schedule

This threat model should be reviewed:
- When adding new features or endpoints
- After any security incident
- At least quarterly
- Before major architectural changes
