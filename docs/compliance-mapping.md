# SecureTrack — Compliance Mapping

This document maps SecureTrack security controls to industry frameworks.

## OWASP SAMM (Software Assurance Maturity Model)

| SAMM Practice | SecureTrack Control | Evidence |
|---------------|---------------------|----------|
| Threat Assessment | STRIDE threat model | `security/threat-model/threat-model.md` |
| Security Requirements | Security policies in code | `security/policies/*.rego` |
| Secure Build | Hardened Dockerfile + Hadolint + Trivy | CI pipeline stages 11-13 |
| Secure Deployment | Signed images + SBOM + policy-as-code | CI pipeline stages 14-16 |
| Defect Management | Security gates blocking bad builds | CI pipeline gates |
| Security Testing | SAST + DAST + SCA | Semgrep + ZAP + Trivy |
| Operational Management | Monitoring + dashboards | Prometheus + Grafana |

## NIST SSDF (Secure Software Development Framework) SP 800-218

| SSDF Practice | SecureTrack Implementation |
|---------------|---------------------------|
| PO.3.2 — Implement supporting toolchains | Full DevSecOps toolchain integrated |
| PS.1.1 — Store source code securely | GitHub with branch protection |
| PS.2.1 — Provide mechanism for verifying software release integrity | Cosign image signing + SBOM |
| PW.4.1 — Use existing secure components | Dependency scanning with Trivy |
| PW.7.1 — Determine whether existing code meets security requirements | SAST with Semgrep + SonarCloud |
| PW.8.2 — Analyze runtime issues | DAST with OWASP ZAP |
| RV.1.1 — Identify and confirm vulnerabilities | Automated scanning + reporting |
| RV.1.3 — Analyze vulnerabilities to identify root causes | SARIF reports in GitHub Security |

## ISO/IEC 27001:2022 Annex A

| Control | SecureTrack Implementation |
|---------|---------------------------|
| A.5.23 — Information security for use of cloud services | GitHub Actions security, OIDC |
| A.5.30 — ICT readiness for business continuity | Health checks + rollback procedures |
| A.8.8 — Management of technical vulnerabilities | Trivy (deps + image) + weekly scheduled scans |
| A.8.9 — Configuration management | Policy-as-code (Conftest) |
| A.8.25 — Secure development life cycle | Full DevSecOps pipeline |
| A.8.26 — Application security requirements | Security requirements in PR template |
| A.8.27 — Secure system architecture and engineering principles | Threat model + architecture docs |
| A.8.28 — Secure coding | ESLint security + Semgrep |
| A.8.29 — Security testing in development and acceptance | Unit tests + SAST + DAST |
| A.8.30 — Outsourced development | N/A (single developer) |
| A.8.31 — Separation of development, test and production environments | dev + staging separation |
| A.8.32 — Change management | PR workflow + code review |

## OWASP Top 10 (2021) Mitigations

| OWASP Risk | Mitigation in SecureTrack |
|-----------|--------------------------|
| A01 Broken Access Control | JWT auth middleware, route protection |
| A02 Cryptographic Failures | bcrypt password hashing, HTTPS in prod |
| A03 Injection | Prisma ORM (after fix); SAST detects raw queries |
| A04 Insecure Design | Threat model + security gates |
| A05 Security Misconfiguration | Hadolint + Conftest + helmet (after fix) |
| A06 Vulnerable Components | Trivy dep scan + SBOM + weekly scheduled scan |
| A07 Identification/Auth Failures | Rate limiting (after fix), password policy (after fix) |
| A08 Software/Data Integrity Failures | Cosign image signing + SBOM |
| A09 Logging and Monitoring Failures | Winston logging + Prometheus + Grafana |
| A10 SSRF | Input validation, no outbound requests from user input |

## SLSA (Supply-chain Levels for Software Artifacts)

SecureTrack targets **SLSA Level 2**:
- **Source**: version controlled (GitHub) ✓
- **Build**: hosted build service (GitHub Actions) ✓
- **Provenance**: generated and signed (Cosign keyless) ✓
- **Provenance authenticity**: verifiable via Rekor ✓

Future work could target SLSA Level 3 (hermetic builds, isolated builders).
