# SecureTrack — Live Demo Scenario Script

**Duration:** 15–20 minutes
**Audience:** University jury, technical supervisors
**Goal:** Demonstrate the full DevSecOps lifecycle: detect → block → fix → approve → deploy

---

## PART 1: Introduction (2 min)

**[Slide: Title + Architecture Diagram]**

> "This project implements a production-grade DevSecOps CI/CD pipeline with automated vulnerability scanning. The demo application — SecureTrack — is an incident reporting platform built with Node.js and React."

> "The pipeline has 17 stages organized in two security gates. No code reaches production without passing every check."

**Show:** GitHub repository overview page — point out:
- 95 files, well-organized structure
- Branch protection on `main`
- CI/CD pipeline badge in README

---

## PART 2: The Vulnerable Baseline — RED Pipeline (5 min)

**[Open GitHub Actions → Run #24218315287]**

> "I intentionally planted 15 security vulnerabilities across the codebase. Let me show you what happens when this vulnerable code hits the pipeline."

**Walk through each failing job:**

1. **Secret Scan (Gitleaks)** — Click into the job
   > "Gitleaks found 3 hardcoded secrets: an API key in logger.js and a JWT secret in two files. These are V1 and V2 from our vulnerability matrix."

2. **SAST (Semgrep)** — Click into the job
   > "Semgrep, using our custom rules, found 6 issues: hardcoded secrets, a missing rate limiter on the login endpoint, and a CORS wildcard configuration."

3. **Dependency Scan (Trivy)** — Click into the job
   > "Trivy found 2 HIGH vulnerabilities in lodash 4.17.20 — CVE-2020-28500 and CVE-2021-23337."

4. **Security Gate 1** — Show the gate summary
   > "Gate 1 aggregates all source-code checks. With 3 secrets, 6 SAST findings, and 2 HIGH dependency CVEs — the gate is RED. No Docker image is built."

> "This is the power of shift-left security — vulnerabilities are caught before they ever become a container."

---

## PART 3: The Fix — Show Code Changes (3 min)

**[Open PR #1 on GitHub → Files Changed tab]**

> "Here are the 15 fixes I applied on the `hardened` branch."

**Highlight 3-4 key diffs:**

1. **V1/V2 — Secrets removed** (logger.js, auth.js)
   > "Hardcoded secrets replaced with environment variables. The code now reads from process.env.JWT_SECRET."

2. **V3 — SQL injection fixed** (incidentService.js)
   > "Replaced `$queryRawUnsafe` with Prisma's built-in `contains` filter — parameterized, safe from injection."

3. **V6/V7/V8 — Dockerfile hardened** (Dockerfile)
   > "Base image upgraded from node:16 to node:20-alpine — went from 16 CRITICAL CVEs to zero. Added USER appuser and HEALTHCHECK."

4. **V5/V15 — Dependencies upgraded** (package.json)
   > "lodash pinned to safe version, Express upgraded to 4.21.2."

---

## PART 4: The Green Pipeline — ALL PASS (5 min)

**[Open GitHub Actions → Run #24220718489 (production run on main)]**

> "After merging the hardened branch, here's the production pipeline. 17 out of 17 jobs — all green."

**Walk through the security stages:**

1. **Gate 1: Source & Code** — PASSED
   > "Zero secrets, zero SAST findings, zero critical dependencies."

2. **Build Docker Image** — Show it succeeded
   > "node:20-alpine image, ~180MB vs ~900MB before."

3. **Policy Check (Conftest)** — PASSED
   > "Our custom Rego policies verify: non-root user, healthcheck present, no .env files, minimal base image. 7 tests, all pass."

4. **Image Scan (Trivy)** — PASSED
   > "Zero critical CVEs in the container image."

5. **SBOM (Syft)** — PASSED
   > "Software Bill of Materials generated in SPDX format — full supply chain transparency."

6. **Gate 2: Container** — PASSED
   > "All container security checks green."

7. **Sign & Push Image** — PASSED
   > "The image is signed with Cosign using keyless signing via GitHub's OIDC identity. No private key to manage — the signature is cryptographically tied to this specific pipeline run. The signed image is published to GitHub Container Registry."

---

## PART 5: Before/After Metrics (2 min)

**[Slide: Metrics Comparison Table]**

> "Let me summarize the security posture improvement:"

| Metric | Before | After |
|--------|--------|-------|
| Hardcoded secrets | 3 | 0 |
| SAST findings | 6 | 0 |
| Dependency CVEs | 2 HIGH | 0 |
| Container CVEs | 16 CRIT + 385 HIGH | 0 CRIT + ~5 HIGH |
| Policy violations | 2 | 0 |
| Image size | ~900 MB | ~180 MB |
| Pipeline verdict | BLOCKED | APPROVED |

> "That's a 100% reduction in critical findings — from 16 CRITICAL and 391 HIGH to zero critical and near-zero high."

---

## PART 6: Observability (2 min)

**[If Docker is running — show Grafana live. Otherwise, show dashboard JSON screenshots.]**

> "The pipeline pushes security metrics to Prometheus via Pushgateway after every run. Grafana displays two dashboards:"

1. **Security Metrics Dashboard** — 7 panels showing build status, secrets count, SAST findings, image CVEs, test coverage, pipeline duration, findings trend over time.

2. **API Performance Dashboard** — 8 panels showing request rate, p50/p95/p99 latency, error rate, requests by route.

> "Prometheus alerting rules fire automatically if: secrets are found, critical CVEs appear, test coverage drops below 60%, or the API error rate exceeds 5%."

---

## PART 7: Architecture & Compliance (1 min)

**[Slide: Architecture diagram]**

> "The pipeline maps to three industry frameworks:"
> - **OWASP SAMM** — Secure Build, Security Testing, Defect Management
> - **NIST SSDF** — PW.7 (review code), PW.8 (test), PW.9 (configure), RV.1 (identify vulnerabilities)
> - **ISO 27001** — A.14.2 (development security), A.12.6 (vulnerability management)

---

## PART 8: Q&A Preparation

**Anticipated jury questions and answers:**

**Q: Why not use a real production deployment (Kubernetes)?**
> "The pipeline is deployment-target agnostic. The security gates, image signing, and SBOM work identically whether deploying to K8s, ECS, or Docker Compose. Adding a K8s manifest is configuration, not architecture."

**Q: How would you handle false positives from scanners?**
> "Each tool supports allowlisting — Trivy has .trivyignore, Semgrep has `nosemgrep` annotations, Gitleaks has allowlist rules. The key is documenting WHY each suppression exists."

**Q: What about DAST (runtime scanning)?**
> "The OWASP ZAP workflow is wired and triggers automatically after staging deployment. It performs baseline scanning against the running application. In this demo, the focus was on shift-left (pre-deployment) checks."

**Q: How does Cosign keyless signing work?**
> "GitHub Actions provides an OIDC token that proves the pipeline's identity. Cosign exchanges this for a short-lived signing certificate from Sigstore's Fulcio CA. The signature is recorded in a transparency log (Rekor). No private key exists — the trust is in the pipeline identity."

**Q: What's the cost of running this pipeline?**
> "Zero. Everything uses free tiers: GitHub Actions (2,000 min/month for free repos), SonarCloud (free for open source), GHCR (free for public images), Sigstore (free public good)."

---

## Fallback Plan

If GitHub Actions is down or slow during the demo:
1. Show the pipeline run screenshots (saved in `evidence/`)
2. Show the `reports/BASELINE_SUMMARY.md` as local scanner proof
3. Show the git log demonstrating the red→green commit history
4. Run scanners locally: `docker run zricethezav/gitleaks:latest detect` (takes ~5 seconds)
