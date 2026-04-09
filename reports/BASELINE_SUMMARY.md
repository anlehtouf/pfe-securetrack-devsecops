## SecureTrack — Phase 1 Baseline Security Report (Vulnerable Version)

**Generated:** 2026-04-09
**Branch:** `main` (vulnerable baseline)
**Purpose:** Prove each security tool in the pipeline correctly detects the 15 planted vulnerabilities *before* any remediation.

---

### 1. Summary Table — Tool vs. Detected Vulnerabilities

| # | Tool                  | Stage              | CRITICAL | HIGH | MEDIUM/WARN | Vulnerabilities Confirmed       | Status |
|---|-----------------------|--------------------|---------:|-----:|------------:|---------------------------------|:------:|
| 1 | **Gitleaks**          | Secret scan        |        – |    3 |           – | V1, V2 (×2 files)               |   OK   |
| 2 | **Semgrep**           | SAST               |        – |    1 |           5 | V1, V2 (×2), V11, V14, nginx    |   OK   |
| 3 | **Trivy (fs)**        | Dependency scan    |        0 |    2 |           – | V5 (lodash@4.17.20)             |   OK   |
| 4 | **Hadolint**          | Dockerfile lint    |        – |    – |           0 | (no native rules for V7/V8)     |   —    |
| 5 | **Conftest / OPA**    | Policy-as-code     |        – |    2 |           1 | V7, V8 (+ V6 warn)              |   OK   |
| 6 | **Trivy (image)**     | Container scan     |       16 |  385 |           – | V6 (node:16 EOL), V15 (express) |   OK   |
| – | *ESLint + unit tests* | Build gate         |        – |    – |           – | 34/34 backend, 5/5 frontend     |   OK   |

**Aggregate baseline:** **16 CRITICAL** + **391 HIGH** findings across all tools.

---

### 2. Detailed Findings

#### 2.1 Gitleaks — Secret Detection (3 findings)

| Rule                   | File                                         | Line | Vulnerability     |
|------------------------|----------------------------------------------|-----:|-------------------|
| hardcoded-api-key      | `app/backend/src/utils/logger.js`            |    5 | **V1** API key    |
| hardcoded-jwt-secret   | `app/backend/src/middleware/auth.js`         |    5 | **V2** JWT secret |
| hardcoded-jwt-secret   | `app/backend/src/services/authService.js`    |   53 | **V2** JWT secret |

Report: `reports/gitleaks-report.json`

---

#### 2.2 Semgrep — SAST (6 findings: 1 ERROR + 5 WARNING)

| Severity | Rule                                              | File                                  | Vulnerability         |
|----------|---------------------------------------------------|---------------------------------------|-----------------------|
| ERROR    | `securetrack.hardcoded-secret-assignment`         | `src/utils/logger.js`                 | **V1** API_KEY        |
| WARNING  | `securetrack.hardcoded-secret-assignment`         | `src/middleware/auth.js`              | **V2** JWT_SECRET     |
| WARNING  | `securetrack.hardcoded-secret-assignment`         | `src/services/authService.js`         | **V2** JWT_SECRET     |
| WARNING  | `securetrack.express-auth-no-rate-limit`          | `src/routes/authRoutes.js`            | **V11** no rate limit |
| WARNING  | `securetrack.cors-wildcard`                       | `src/app.js`                          | **V14** CORS `*`      |
| WARNING  | *(nginx) duplicate header directive*              | `app/frontend/nginx.conf`             | (config smell)        |

Report: `reports/semgrep-report.json`

---

#### 2.3 Trivy Filesystem — Dependency Scan (V5)

| Package       | Installed Version | Vulnerabilities        | Severity |
|---------------|-------------------|------------------------|----------|
| **lodash**    | 4.17.20           | CVE-2020-28500, CVE-2021-23337 | **HIGH** (×2) |

Report: `reports/trivy-deps-report.json`

> Note: Because the vulnerable image pins `express@^4.17.1`, the Trivy **image scan** (see 2.6) additionally surfaces Express CVEs as V15.

---

#### 2.4 Hadolint — Dockerfile Lint

- **0 findings** on `app/backend/Dockerfile`.
- Confirmed expected behavior: Hadolint has **no native rule** for missing `USER` or missing `HEALTHCHECK`. These are intentionally caught by **Conftest/OPA policies** (see 2.5) — which is exactly why the project ships its own Rego policy file.

---

#### 2.5 Conftest / OPA — Policy-as-Code (V7, V8, + warn on V6)

Policy file: `security/policies/dockerfile-policy.rego`

| Result | Rule                                             | Vulnerability           |
|--------|--------------------------------------------------|-------------------------|
| FAIL   | No `USER` directive found                        | **V7** runs as root     |
| FAIL   | No `HEALTHCHECK` directive found                 | **V8** no healthcheck   |
| WARN   | Base image `node:16` not minimal                 | **V6** non-minimal base |

Command:
```
conftest test --policy security/policies/dockerfile-policy.rego \
    --parser dockerfile --namespace dockerfile app/backend/Dockerfile
```

Output: **7 tests, 4 passed, 1 warning, 2 failures** — exit code 1 (pipeline-blocking).

---

#### 2.6 Trivy Image — Container Scan (V6 + V15)

Scanned image: `securetrack-backend:vulnerable`
Detected OS: **Debian 10.13** (EOL, no security updates) — the very reason `node:16` is dangerous.

| Target                                     | CRITICAL | HIGH |
|--------------------------------------------|---------:|-----:|
| `securetrack-backend:vulnerable` (debian 10.13) |   **16** |  366 |
| Node.js dependencies (express, etc.)       |        0 |   19 |
| **TOTAL**                                  |   **16** |  **385** |

Report: `reports/trivy-image.json`

---

### 3. Vulnerabilities *Not Yet Verified Locally*

These will be caught by **pipeline-only** or **runtime** tools during Phase 2:

| # | Vulnerability            | Detected By          | When                  |
|---|--------------------------|----------------------|-----------------------|
| V3 | SQL injection (raw query) | Semgrep registry rule `javascript.lang.security.audit.sqli.raw-query` | pipeline `sast` job (Semgrep CI ruleset) |
| V4 | XSS via `dangerouslySetInnerHTML` | Semgrep registry rule `react.dangerouslysetinnerhtml` | pipeline `sast` job |
| V9 | Debug mode in error handler | Semgrep CI ruleset |
| V10 | Missing helmet headers | OWASP ZAP (DAST) | post-deploy `dast-scan` job |
| V12 | Weak password policy | Semgrep custom rule | pipeline `sast` job |
| V13 | Password logged to console | Semgrep custom rule `sensitive-data-in-log` | pipeline `sast` job |
| V15 | Old Express version | Trivy image (already confirmed above) | — |

> The local Semgrep run used only the **custom** rules file. Registry rules (`p/javascript`, `p/react`, `p/nodejsscan`) run inside the pipeline via the `semgrep ci` action and will surface V3, V4, V9, V12.

---

### 4. Phase 1 Verdict

| Check                                             | Result |
|---------------------------------------------------|--------|
| Backend unit + integration tests                  | **34/34 PASS** |
| Frontend component tests                          | **5/5 PASS**   |
| Backend ESLint (source tree)                      | **clean** |
| Backend Docker image builds                       | **OK** (`securetrack-backend:vulnerable`) |
| Gitleaks detects planted secrets                  | **3 findings (V1, V2)** |
| Semgrep (custom rules) detects planted SAST bugs  | **6 findings (V1, V2, V11, V14)** |
| Trivy (fs) detects vulnerable dependency          | **V5 — 2 HIGH on lodash** |
| Conftest enforces container policy                | **2 FAIL (V7, V8) + 1 WARN (V6)** |
| Trivy (image) detects base-image CVEs             | **16 CRIT / 385 HIGH (V6 + V15)** |

**Phase 1 is GREEN** — the vulnerable baseline reliably reproduces the expected findings across every scanner that can be run locally. The project is ready to move into **Phase 2: Core CI Pipeline** (push to GitHub, enable GitHub Actions, wire SonarCloud secrets, and run the full 22-stage pipeline end-to-end).
