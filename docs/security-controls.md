# SecureTrack — Security Controls Inventory

## Control Catalog

| ID | Control | Type | Tool | Pipeline Stage | Blocking |
|----|---------|------|------|----------------|----------|
| SC-01 | Branch protection | Preventive | GitHub | N/A (config) | Yes |
| SC-02 | Pull request review | Preventive | GitHub | N/A (config) | Yes |
| SC-03 | Pre-commit hooks | Preventive | pre-commit | Local | Advisory |
| SC-04 | Secret scanning | Detective | Gitleaks | Stage 7 | **Yes** |
| SC-05 | ESLint security rules | Detective | eslint-plugin-security | Stage 4 | Yes |
| SC-06 | Unit tests | Detective | Jest/Vitest | Stage 5 | Yes |
| SC-07 | Code coverage enforcement | Detective | Jest coverage | Stage 6 | Yes (>=70%) |
| SC-08 | Static analysis | Detective | Semgrep | Stage 8 | **Yes** |
| SC-09 | Code quality gate | Detective | SonarCloud | Stage 9 | **Yes** |
| SC-10 | Dependency CVE scan | Detective | Trivy fs + npm audit | Stage 10 | **Yes** |
| SC-11 | Dockerfile lint | Preventive | Hadolint | Stage 12 | Yes |
| SC-12 | Container CVE scan | Detective | Trivy image | Stage 13 | **Yes** |
| SC-13 | SBOM generation | Transparency | Syft | Stage 14 | No |
| SC-14 | Image signing | Integrity | Cosign | Stage 15 | No |
| SC-15 | Policy-as-code | Preventive | Conftest/OPA | Stage 16 | **Yes** |
| SC-16 | Health check | Detective | curl | Stage 19 | Yes |
| SC-17 | DAST scan | Detective | OWASP ZAP | Stage 20 | Advisory |
| SC-18 | Metrics collection | Monitoring | Prometheus | Continuous | No |
| SC-19 | Security dashboard | Monitoring | Grafana | Continuous | No |
| SC-20 | Audit trail | Traceability | Git + GH Actions logs | Continuous | No |

## Security Gate Logic

### Gate 1: Source & Code (blocking)
- SC-04 (secrets) == 0
- SC-08 (SAST high/critical) == 0
- SC-09 (Sonar quality) == passed
- SC-10 (deps critical) == 0

### Gate 2: Container (blocking)
- SC-11 (Hadolint errors) == 0
- SC-12 (image critical CVEs) == 0
- SC-15 (policy violations) == 0

### Deployment Gate
- Gate 1 == passed
- Gate 2 == passed

## Compliance Mapping

See `compliance-mapping.md` for full mapping to OWASP SAMM, NIST SSDF, and ISO 27001.
