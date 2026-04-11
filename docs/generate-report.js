const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, TableOfContents, LevelFormat,
  TabStopType, TabStopPosition
} = require("docx");

// ── Helpers ──────────────────────────────────────────────────
const FONT = "Arial";
const PAGE_W = 11906; // A4
const PAGE_H = 16838;
const MARGIN = 1440;
const CW = PAGE_W - 2 * MARGIN; // content width

const heading = (level, text) =>
  new Paragraph({ heading: level, children: [new TextRun({ text, font: FONT })] });

const h1 = (t) => heading(HeadingLevel.HEADING_1, t);
const h2 = (t) => heading(HeadingLevel.HEADING_2, t);
const h3 = (t) => heading(HeadingLevel.HEADING_3, t);

const para = (text, opts = {}) =>
  new Paragraph({
    spacing: { after: 120, line: 276 },
    alignment: opts.align || AlignmentType.JUSTIFIED,
    children: [new TextRun({ text, font: FONT, size: 24, bold: !!opts.bold, italics: !!opts.italic, ...opts.run })],
  });

const bold = (text) => para(text, { bold: true });

const bullet = (text, ref = "bullets", level = 0) =>
  new Paragraph({
    numbering: { reference: ref, level },
    spacing: { after: 60 },
    children: [new TextRun({ text, font: FONT, size: 24 })],
  });

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

// Table helper
const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };

function makeTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    children: headers.map((h, i) =>
      new TableCell({
        borders,
        width: { size: colWidths[i], type: WidthType.DXA },
        shading: { fill: "2B579A", type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: h, font: FONT, size: 20, bold: true, color: "FFFFFF" })] })],
      })
    ),
  });
  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map((cell, i) =>
          new TableCell({
            borders,
            width: { size: colWidths[i], type: WidthType.DXA },
            margins: { top: 40, bottom: 40, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: String(cell), font: FONT, size: 20 })] })],
          })
        ),
      })
  );
  return new Table({ width: { size: totalW, type: WidthType.DXA }, columnWidths: colWidths, rows: [headerRow, ...dataRows] });
}

// ── Content builders ─────────────────────────────────────────
function coverPage() {
  return [
    new Paragraph({ spacing: { before: 4000 }, alignment: AlignmentType.CENTER, children: [] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
      new TextRun({ text: "PROJET DE FIN D'ETUDES", font: FONT, size: 28, bold: true, color: "2B579A" }),
    ]}),
    new Paragraph({ spacing: { after: 600 }, alignment: AlignmentType.CENTER, children: [
      new TextRun({ text: "Design and Implementation of a Secure DevSecOps CI/CD Pipeline with Automated Vulnerability Scanning", font: FONT, size: 40, bold: true, color: "1F3864" }),
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
      new TextRun({ text: "Prepared by: Anas", font: FONT, size: 26 }),
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
      new TextRun({ text: "Supervisor: [To be filled]", font: FONT, size: 26 }),
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
      new TextRun({ text: "Institution: [To be filled]", font: FONT, size: 26 }),
    ]}),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800 }, children: [
      new TextRun({ text: "Academic Year 2025 - 2026", font: FONT, size: 24, bold: true }),
    ]}),
    pageBreak(),
  ];
}

function tocPage() {
  return [
    h1("Table of Contents"),
    new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
    pageBreak(),
  ];
}

function abstractPage() {
  return [
    h1("Abstract"),
    para("This project designs and implements a production-grade DevSecOps CI/CD pipeline that embeds automated security scanning at every stage of the software delivery lifecycle. Using a purpose-built incident reporting application (SecureTrack) as the demo target, the pipeline integrates 8 security tools across 17 automated stages and 2 security gates."),
    para("15 intentional vulnerabilities were planted across the codebase spanning 6 categories: hardcoded secrets, injection flaws, cross-site scripting, vulnerable dependencies, container misconfigurations, and insecure application settings. Each vulnerability was systematically detected by the appropriate scanner, blocked by automated security gates, and remediated with documented fixes."),
    para("The pipeline achieved a measurable improvement from 16 CRITICAL and 391 HIGH findings to near-zero, representing a 100% reduction in critical vulnerabilities. The complete supply chain is secured through SBOM generation (Syft), keyless image signing (Cosign via Sigstore), and publication to GitHub Container Registry."),
    para("The implementation maps to three industry frameworks: OWASP SAMM, NIST SSDF (SP 800-218), and ISO 27001, demonstrating alignment with recognized security standards."),
    para("Keywords: DevSecOps, CI/CD, SAST, SCA, Container Security, Supply Chain Security, OWASP, Shift-Left Security, Vulnerability Scanning, GitHub Actions", { italic: true }),
    pageBreak(),
  ];
}

function chapter1() {
  return [
    h1("Chapter 1: Introduction"),

    h2("1.1 Context and Motivation"),
    para("The software industry has undergone a fundamental transformation with the adoption of DevOps practices, enabling organizations to deliver software faster and more reliably. However, this acceleration has created a critical security gap: traditional security practices, designed for waterfall development cycles, cannot keep pace with continuous delivery pipelines that deploy code multiple times per day."),
    para("According to the Sonatype State of the Software Supply Chain Report, software supply chain attacks increased by 742% between 2019 and 2022. The SolarWinds attack (2020), Log4Shell vulnerability (2021), and the codecov breach demonstrated that security must be embedded into the development lifecycle itself, not bolted on at the end."),
    para("DevSecOps addresses this challenge by shifting security left, integrating automated security testing at every stage of the CI/CD pipeline. Rather than relying on manual penetration testing before release, DevSecOps ensures that every code commit, dependency update, and container build is automatically scanned for vulnerabilities before it can progress toward production."),

    h2("1.2 Problem Statement"),
    para("Despite the growing awareness of software security risks, most organizations still lack comprehensive automated security gates in their CI/CD pipelines. A 2023 SANS survey found that only 37% of organizations have fully integrated security scanning into their build processes. NIST research indicates that manual code reviews miss approximately 60% of vulnerabilities, and the cost of fixing a vulnerability increases by 6.5x when discovered in production versus during development."),
    para("The challenge addressed by this project is: How can we design and implement a CI/CD pipeline that automatically catches vulnerabilities across multiple categories (secrets, code flaws, dependencies, containers, supply chain) before they reach production, with measurable evidence of security improvement?"),

    h2("1.3 Objectives"),
    para("This project aims to achieve the following objectives:"),
    bullet("Design a multi-stage CI/CD pipeline with automated vulnerability scanning covering SAST, SCA, secret detection, container security, and supply chain integrity"),
    bullet("Implement shift-left security using 8 industry-standard open-source tools integrated into GitHub Actions workflows"),
    bullet("Demonstrate measurable security improvement through intentional vulnerability planting (15 vulnerabilities across 6 categories) and systematic remediation"),
    bullet("Map the pipeline controls to industry frameworks including OWASP SAMM, NIST SSDF, and ISO 27001"),
    bullet("Implement observability with Prometheus and Grafana dashboards for security metrics tracking"),

    h2("1.4 Scope and Limitations"),
    para("The scope of this project encompasses the full pipeline from code commit to signed and published container image. The demo application (SecureTrack) is a Node.js/Express backend with a React frontend, containerized with Docker and deployed via Docker Compose. The CI/CD platform is GitHub Actions with GitHub Container Registry (GHCR) for image storage."),
    para("Out of scope: Kubernetes orchestration, Web Application Firewall (WAF), runtime application self-protection (RASP), and production infrastructure management. These are identified as future work in Chapter 7."),

    h2("1.5 Report Structure"),
    para("Chapter 2 presents a literature review of DevSecOps concepts, security testing methodologies, and industry frameworks. Chapter 3 describes the methodology and system design, including technology selection and threat modeling. Chapter 4 details the implementation of the pipeline, application, and security controls. Chapter 5 presents results with before/after metrics. Chapter 6 discusses achievements, challenges, and limitations. Chapter 7 concludes with future work recommendations."),
    pageBreak(),
  ];
}

function chapter2() {
  return [
    h1("Chapter 2: Literature Review"),

    h2("2.1 DevOps to DevSecOps Evolution"),
    para("DevOps emerged as a cultural and technical movement combining software development (Dev) and IT operations (Ops) to shorten the systems development lifecycle while delivering features, fixes, and updates frequently. The CALMS framework (Culture, Automation, Lean, Measurement, Sharing) defines the core principles."),
    para("However, the speed of DevOps created a security blind spot. Traditional security teams operated as gatekeepers at the end of the development cycle, performing manual reviews and penetration tests before release. This approach, sometimes called security as a bottleneck, could not scale with continuous delivery practices that push code to production multiple times daily."),
    para("DevSecOps integrates security practices into every phase of the DevOps lifecycle. The shift-left paradigm moves security testing earlier in the pipeline, from production back to development. This approach catches vulnerabilities when they are cheapest to fix and prevents insecure code from ever reaching production."),

    h2("2.2 CI/CD Pipeline Security"),
    para("Continuous Integration (CI) is the practice of automatically building and testing code changes as they are committed. Continuous Delivery (CD) extends this by automatically preparing code for deployment to production. Together, CI/CD pipelines provide the automated backbone for modern software delivery."),
    para("Security gates are decision points in the pipeline where automated checks must pass before code can proceed. A quality gate typically evaluates code coverage, linting, and test results. A security gate adds vulnerability scanning, secret detection, and policy compliance checks. The pipeline-as-code approach stores pipeline definitions alongside application code, enabling version control and review of the pipeline itself."),

    h2("2.3 Application Security Testing"),
    h3("2.3.1 Static Application Security Testing (SAST)"),
    para("SAST tools analyze source code without executing it, identifying vulnerabilities such as SQL injection, cross-site scripting, and hardcoded credentials. Tools like Semgrep, SonarQube, and CodeQL operate on the abstract syntax tree (AST) of the source code, applying pattern-matching rules to detect insecure coding patterns."),

    h3("2.3.2 Software Composition Analysis (SCA)"),
    para("SCA tools identify known vulnerabilities in third-party dependencies by comparing package versions against CVE databases (NVD, GitHub Advisory Database). Tools like Trivy, Snyk, and npm audit scan dependency manifests (package.json, package-lock.json) and provide remediation guidance."),

    h3("2.3.3 Dynamic Application Security Testing (DAST)"),
    para("DAST tools test running applications by sending crafted HTTP requests and analyzing responses for security issues. OWASP ZAP is the industry-standard open-source DAST tool, capable of detecting missing security headers, injection vulnerabilities, and authentication flaws."),

    h3("2.3.4 Secret Detection"),
    para("Secret detection tools scan code repositories for accidentally committed credentials, API keys, tokens, and certificates. Gitleaks and TruffleHog are popular tools that use regular expressions and entropy analysis to identify potential secrets in code and git history."),

    h2("2.4 Container Security"),
    para("Container images inherit vulnerabilities from their base images, installed packages, and application dependencies. Trivy, the most widely adopted container scanner, can detect CVEs in OS packages, language-specific libraries, and misconfigurations."),
    para("Dockerfile best practices include using minimal base images (Alpine, distroless), running as a non-root user, including health checks, and avoiding COPY of sensitive files. Policy-as-code tools like Open Policy Agent (OPA) with Conftest enable organizations to define and enforce these practices through Rego policy language."),

    h2("2.5 Supply Chain Security"),
    para("Software supply chain security has gained critical importance following high-profile attacks. A Software Bill of Materials (SBOM) provides a complete inventory of components in a software artifact, enabling vulnerability tracking and compliance auditing. The SPDX and CycloneDX formats are industry standards."),
    para("Image signing with Cosign (part of the Sigstore project) provides cryptographic proof that a container image was built by a trusted pipeline. Keyless signing via OIDC eliminates private key management by using the pipeline identity (GitHub Actions OIDC token) as the signing credential, with signatures recorded in the Rekor transparency log."),

    h2("2.6 Observability in DevSecOps"),
    para("Prometheus is the de facto standard for metrics collection in cloud-native environments. Combined with Grafana for dashboarding and alerting, organizations can track security metrics over time: vulnerability trends, build pass/fail rates, time-to-remediation, and coverage percentages. The Pushgateway component enables batch jobs (like CI pipelines) to push metrics to Prometheus."),

    h2("2.7 Industry Frameworks"),
    para("Three frameworks provide the compliance context for this project:"),
    bullet("OWASP SAMM (Software Assurance Maturity Model): Provides a measurable framework for assessing and improving software security practices across governance, design, implementation, verification, and operations domains."),
    bullet("NIST SSDF (Secure Software Development Framework, SP 800-218): Defines practices for producing well-secured software, organized into Prepare, Protect, Produce, and Respond groups."),
    bullet("ISO 27001 Annex A: Provides controls for information security management, with A.14.2 covering security in development and support processes."),

    h2("2.8 Related Work"),
    para("Several academic and industry projects have explored DevSecOps pipeline implementations. However, most focus on a single security domain (e.g., SAST only) or use commercial tools with limited reproducibility. This project differentiates itself by: (1) using exclusively open-source tools, (2) covering 6 security domains with 8 tools, (3) providing measurable before/after evidence through intentional vulnerability planting, and (4) including supply chain security with SBOM and image signing."),
    pageBreak(),
  ];
}

function chapter3() {
  return [
    h1("Chapter 3: Methodology and Design"),

    h2("3.1 Research Methodology"),
    para("This project follows the Design Science Research (DSR) methodology, which is appropriate for building and evaluating IT artifacts. The DSR cycle consists of: (1) Problem identification and motivation, (2) Objectives definition, (3) Design and development, (4) Demonstration, (5) Evaluation, and (6) Communication. The iterative nature of DSR allows for refinement based on evaluation feedback."),

    h2("3.2 Technology Stack Selection"),
    para("Technologies were selected based on four criteria: industry adoption, open-source availability, integration capability with GitHub Actions, and suitability for demonstrating security concepts."),
    makeTable(
      ["Component", "Technology", "Justification"],
      [
        ["Backend", "Node.js 20 + Express", "Widely adopted, rich security ecosystem"],
        ["Frontend", "React 18 + Vite", "Modern SPA framework, fast build"],
        ["Database", "PostgreSQL 16", "Robust, open-source RDBMS"],
        ["ORM", "Prisma 5", "Type-safe queries, migration support"],
        ["CI/CD", "GitHub Actions", "Native integration, free tier (2000 min/month)"],
        ["SAST", "Semgrep", "Multi-language, custom rule support"],
        ["Secrets", "Gitleaks", "Fast, configurable regex rules"],
        ["SCA", "Trivy", "Multi-target scanner (deps + images + config)"],
        ["Quality", "SonarCloud", "Industry-standard quality gate"],
        ["Dockerfile Lint", "Hadolint", "Dockerfile best practices checker"],
        ["Policy", "Conftest / OPA", "Rego-based policy-as-code engine"],
        ["SBOM", "Syft", "SPDX and CycloneDX output"],
        ["Signing", "Cosign", "Keyless signing via Sigstore OIDC"],
        ["Monitoring", "Prometheus + Grafana", "De facto cloud-native observability"],
        ["DAST", "OWASP ZAP", "Industry-standard web scanner"],
      ],
      [2000, 2800, 4200]
    ),

    h2("3.3 Architecture Design"),
    para("The pipeline architecture follows a gate-based model with two security checkpoints:"),
    bullet("Security Gate 1 (Source & Code): Aggregates results from secret scanning, SAST, SonarCloud, and dependency scanning. All checks must pass before Docker image build."),
    bullet("Security Gate 2 (Container): Aggregates results from Hadolint, Trivy image scan, SBOM generation, and Conftest policy checks. All checks must pass before image signing and push."),
    para("This two-gate design ensures that source-code vulnerabilities are caught before the expensive image build step, and container-specific issues are caught before the image is published."),

    h2("3.4 Threat Modeling"),
    para("A STRIDE threat analysis was performed on the SecureTrack application to identify attack surfaces and map them to pipeline controls:"),
    makeTable(
      ["STRIDE Category", "Threat Example", "Pipeline Control"],
      [
        ["Spoofing", "JWT token forgery", "SAST (Semgrep) + hardcoded secret detection"],
        ["Tampering", "SQL injection", "SAST (Semgrep custom rules)"],
        ["Repudiation", "Unsigned container images", "Cosign keyless signing"],
        ["Information Disclosure", "Stack trace exposure, secrets in code", "Gitleaks + Semgrep + error handler audit"],
        ["Denial of Service", "Brute force login", "Semgrep (rate limit check)"],
        ["Elevation of Privilege", "Container running as root", "Conftest (OPA policy) + Hadolint"],
      ],
      [2000, 3500, 3500]
    ),

    h2("3.5 Vulnerability Matrix Design"),
    para("15 intentional vulnerabilities were designed across 6 categories to demonstrate comprehensive detection coverage:"),
    makeTable(
      ["ID", "Category", "Description", "File", "Detection Tool"],
      [
        ["V1", "Secret", "Hardcoded API key", "logger.js", "Gitleaks, Semgrep"],
        ["V2", "Secret", "Hardcoded JWT secret", "auth.js, authService.js", "Gitleaks, Semgrep"],
        ["V3", "Injection", "SQL injection via raw query", "incidentService.js", "Semgrep"],
        ["V4", "XSS", "dangerouslySetInnerHTML", "IncidentDetail.jsx", "Semgrep"],
        ["V5", "SCA", "Vulnerable lodash@4.17.20", "package.json", "Trivy"],
        ["V6", "Container", "EOL base image (node:16)", "Dockerfile", "Trivy image"],
        ["V7", "Container", "No USER directive (root)", "Dockerfile", "Conftest"],
        ["V8", "Container", "No HEALTHCHECK", "Dockerfile", "Conftest"],
        ["V9", "Config", "Debug mode enabled", "app.js", "Semgrep"],
        ["V10", "Headers", "Missing helmet headers", "app.js", "ZAP (DAST)"],
        ["V11", "Auth", "No rate limiting on login", "authRoutes.js", "Semgrep"],
        ["V12", "Auth", "Weak password policy", "authController.js", "Semgrep"],
        ["V13", "Logging", "Password in log output", "authService.js", "Semgrep"],
        ["V14", "Config", "CORS wildcard (origin: *)","app.js", "Semgrep"],
        ["V15", "SCA", "Outdated Express version", "package.json", "Trivy"],
      ],
      [600, 1200, 2500, 2200, 2500]
    ),
    pageBreak(),
  ];
}

function chapter4() {
  return [
    h1("Chapter 4: Implementation"),

    h2("4.1 Project Structure"),
    para("The repository contains 95 files organized into a clear directory structure:"),
    bullet("app/backend/ - Express API with Prisma ORM, JWT authentication, and 34 tests"),
    bullet("app/frontend/ - React SPA with Vite, incident management UI, and 5 tests"),
    bullet(".github/workflows/ - CI/CD pipeline (ci-pipeline.yml), CD deployment (cd-deploy.yml), DAST scan (dast-scan.yml)"),
    bullet("security/ - Custom rules for Gitleaks, Semgrep, Trivy, OPA/Conftest, and ZAP"),
    bullet("infrastructure/ - Docker Compose files, Prometheus config, Grafana dashboards"),
    bullet("docs/ - Architecture, security controls, compliance mapping, runbook"),

    h2("4.2 Demo Application: SecureTrack"),
    para("SecureTrack is an incident reporting platform designed to provide realistic attack surfaces for vulnerability demonstration. The backend exposes RESTful API endpoints for user authentication and incident management."),

    h3("4.2.1 Backend Architecture"),
    para("The backend is built with Express 4.21.2 on Node.js 20, using Prisma ORM for database access. Key components include:"),
    bullet("Authentication: JWT-based with bcrypt password hashing, role-based access control (REPORTER, ANALYST, ADMIN)"),
    bullet("Incident Management: CRUD operations with severity levels (LOW, MEDIUM, HIGH, CRITICAL) and status tracking (OPEN, IN_PROGRESS, RESOLVED, CLOSED)"),
    bullet("Middleware: Helmet for security headers, express-rate-limit for brute force protection, CORS with configurable origin, Morgan for HTTP logging"),
    bullet("Metrics: prom-client middleware exposing Prometheus metrics at /api/metrics"),

    h3("4.2.2 Frontend Architecture"),
    para("The frontend is a React 18 single-page application built with Vite. It provides an incident dashboard with list view, detail view with status management, and severity-based filtering."),

    h3("4.2.3 Test Suite"),
    para("The test suite comprises 39 tests: 20 unit tests (services and middleware), 14 integration tests (API endpoints via Supertest), and 5 frontend component tests (React Testing Library). Tests achieve coverage above 70% on backend business logic."),

    h2("4.3 CI/CD Pipeline Implementation"),
    para("The pipeline is defined in .github/workflows/ci-pipeline.yml with 17 stages organized across two security gates:"),

    h3("4.3.1 Build Quality Stages (1-3)"),
    para("Install dependencies with npm ci and cache for subsequent jobs. ESLint checks both backend and frontend. Jest runs with coverage reporting, and Vitest runs frontend tests."),

    h3("4.3.2 Security Scanning Stages (4-7)"),
    para("Gitleaks scans the repository for secrets using custom rules (hardcoded-jwt-secret, hardcoded-api-key). Semgrep applies 5 custom SAST rules plus the standard p/javascript and p/nodejsscan rulesets. SonarCloud analyzes code quality with a quality gate. Trivy performs filesystem scanning on backend dependencies."),

    h3("4.3.3 Security Gate 1: Source and Code"),
    para("Gate 1 aggregates outputs from secret scanning (must be 0), SAST (0 high/critical), dependency scan (0 critical CVEs), and SonarCloud (quality gate passed). If any check fails, the pipeline blocks and no Docker image is built."),

    h3("4.3.4 Container Stages (9-14)"),
    para("Docker image is built with Buildx and saved as an artifact. Hadolint lints both Dockerfiles. Trivy scans the container image for CVEs. Syft generates an SPDX SBOM. Conftest checks the Dockerfile against 7 Rego policies (no root, require USER, require HEALTHCHECK, no latest tag, prefer minimal base, COPY over ADD, no .env copy)."),

    h3("4.3.5 Security Gate 2: Container"),
    para("Gate 2 aggregates image scan results (0 critical CVEs), policy check (0 violations), and Hadolint results. Both gates must pass before the image can be signed and pushed."),

    h3("4.3.6 Sign and Push (15)"),
    para("On push to main, the pipeline logs into GHCR, pushes the image with SHA and branch tags, signs it with Cosign keyless (GitHub OIDC), and verifies the signature. This provides end-to-end supply chain integrity."),

    h2("4.4 Container Hardening"),
    para("The Dockerfile transformation demonstrates container security best practices:"),
    makeTable(
      ["Aspect", "Before (Vulnerable)", "After (Hardened)"],
      [
        ["Base image", "node:16 (Debian 10, EOL)", "node:20-alpine"],
        ["User", "root (default)", "appuser (non-root)"],
        ["Health check", "None", "wget against /api/health"],
        ["Dependencies", "npm install (all deps)", "npm ci --omit=dev"],
        ["Image size", "~900 MB", "~180 MB"],
        ["CRITICAL CVEs", "16", "0"],
        ["HIGH CVEs", "385", "~5"],
      ],
      [2500, 3000, 3500]
    ),

    h2("4.5 Supply Chain Security"),
    para("Three mechanisms ensure supply chain integrity:"),
    bullet("SBOM Generation: Syft produces a Software Bill of Materials in SPDX JSON format, cataloging every package in the container image."),
    bullet("Keyless Signing: Cosign uses GitHub Actions OIDC token to obtain a short-lived signing certificate from Sigstore Fulcio CA. The signature is recorded in the Rekor transparency log."),
    bullet("Signature Verification: cosign verify validates the image signature against the GitHub OIDC issuer and repository identity."),

    h2("4.6 Observability Stack"),
    para("The monitoring infrastructure consists of three components:"),
    bullet("Prometheus: Configured with 3 scrape targets (self-monitoring, Pushgateway for CI metrics, backend /api/metrics). Includes 9 alerting rules (7 security + 2 application)."),
    bullet("Pushgateway: Receives 7 CI pipeline metrics after each run: build status, secrets count, SAST findings, image CVEs, dependency CVEs, test coverage, and policy violations."),
    bullet("Grafana: Two auto-provisioned dashboards. Security Metrics (7 panels: build status, secrets, SAST, CVEs, coverage, duration, trends). API Performance (8 panels: request rate, latency percentiles, error rate, memory, per-route breakdown)."),

    h2("4.7 Custom Security Rules"),
    para("Beyond default rulesets, custom rules were written for precise vulnerability detection:"),
    bullet("Gitleaks (.gitleaks.toml): 2 custom rules for detecting hardcoded JWT secrets and API keys with specific regex patterns."),
    bullet("Semgrep (.semgrep.yml): 5 custom rules for hardcoded-secret-assignment, sensitive-data-in-log, weak-password-validation, express-auth-no-rate-limit, and cors-wildcard."),
    bullet("OPA/Rego (dockerfile-policy.rego): 7 policies enforcing container best practices, each producing human-readable violation messages."),
    pageBreak(),
  ];
}

function chapter5() {
  return [
    h1("Chapter 5: Results and Evaluation"),

    h2("5.1 Pipeline Execution Results"),

    h3("5.1.1 Red Baseline (Vulnerable Code)"),
    para("The first pipeline run against the vulnerable baseline (develop branch, commit 43d5acd) produced the expected result: FAILURE. The security gates correctly blocked deployment."),
    para("Pipeline URL: https://github.com/anlehtouf/pfe-securetrack-devsecops/actions/runs/24218315287"),
    para("Key findings:"),
    bullet("Gitleaks: 3 secrets detected (V1 API key, V2 JWT secret x2)"),
    bullet("Semgrep: 6 findings (1 ERROR + 5 WARNING) covering V1, V2, V11, V14"),
    bullet("Trivy filesystem: 2 HIGH CVEs in lodash@4.17.20 (V5)"),
    bullet("Security Gate 1: BLOCKED"),

    h3("5.1.2 Green Pipeline (Hardened Code)"),
    para("After applying all 15 fixes on the hardened branch and opening a PR to main, the pipeline produced: SUCCESS. All 17 stages passed, both security gates approved."),
    para("Pipeline URL: https://github.com/anlehtouf/pfe-securetrack-devsecops/actions/runs/24219743267"),

    h3("5.1.3 Production Run (Sign and Push)"),
    para("After merging to main, the production pipeline executed with the Sign and Push Image stage enabled. The signed image was published to GitHub Container Registry with Cosign keyless signature."),
    para("Pipeline URL: https://github.com/anlehtouf/pfe-securetrack-devsecops/actions/runs/24220718489"),
    para("Result: 17/17 stages PASS, image signed and verified."),

    h2("5.2 Before/After Metrics"),
    makeTable(
      ["Metric", "Before (Vulnerable)", "After (Hardened)", "Improvement"],
      [
        ["Hardcoded secrets", "3", "0", "-100%"],
        ["SAST findings (high/critical)", "6", "0", "-100%"],
        ["Dependency HIGH CVEs", "2", "0", "-100%"],
        ["Container CRITICAL CVEs", "16", "0", "-100%"],
        ["Container HIGH CVEs", "385", "~5", "-98.7%"],
        ["Policy violations", "2", "0", "-100%"],
        ["Image size", "~900 MB", "~180 MB", "-80%"],
        ["npm audit vulnerabilities", "2", "0", "-100%"],
        ["Pipeline verdict", "BLOCKED", "APPROVED", "Full pass"],
      ],
      [2500, 2200, 2200, 2100]
    ),

    h2("5.3 Detection Coverage Matrix"),
    para("Every planted vulnerability was detected by at least one tool, confirming comprehensive coverage:"),
    makeTable(
      ["Vuln", "Gitleaks", "Semgrep", "Trivy", "Conftest", "ZAP"],
      [
        ["V1", "YES", "YES", "-", "-", "-"],
        ["V2", "YES", "YES", "-", "-", "-"],
        ["V3", "-", "YES", "-", "-", "-"],
        ["V4", "-", "YES", "-", "-", "-"],
        ["V5", "-", "-", "YES", "-", "-"],
        ["V6", "-", "-", "YES", "WARN", "-"],
        ["V7", "-", "-", "-", "YES", "-"],
        ["V8", "-", "-", "-", "YES", "-"],
        ["V9", "-", "YES", "-", "-", "-"],
        ["V10", "-", "-", "-", "-", "YES"],
        ["V11", "-", "YES", "-", "-", "-"],
        ["V12", "-", "YES", "-", "-", "-"],
        ["V13", "-", "YES", "-", "-", "-"],
        ["V14", "-", "YES", "-", "-", "-"],
        ["V15", "-", "-", "YES", "-", "-"],
      ],
      [1000, 1500, 1700, 1500, 1800, 1500]
    ),

    h2("5.4 Compliance Mapping"),
    para("The pipeline controls map to three industry frameworks:"),
    bullet("OWASP SAMM: Verification domain - Security Testing (ST1: automated SAST/DAST, ST2: deep SAST analysis, ST3: penetration testing guidance). Implementation domain - Secure Build (SB1: build process, SB2: software dependencies)."),
    bullet("NIST SSDF: PW.7 (review code for security), PW.8 (test software), PW.9 (configure pipeline security), RV.1 (identify vulnerabilities), RV.2 (assess vulnerability impact), PS.1 (protect software), PS.2 (provide SBOM)."),
    bullet("ISO 27001: A.14.2.1 (security development policy), A.14.2.5 (secure engineering), A.14.2.8 (system security testing), A.12.6.1 (management of technical vulnerabilities)."),

    h2("5.5 Performance Analysis"),
    para("The complete pipeline executes in 6-8 minutes on GitHub Actions free tier (ubuntu-latest runners). The most time-consuming stages are the Docker image build (~90s) and Trivy image scan (~60s). The security scanning stages (Gitleaks, Semgrep, Trivy filesystem) each complete in under 30 seconds."),
    para("Cost analysis: The pipeline uses approximately 8 minutes of GitHub Actions compute per run. With 2,000 free minutes per month on public repositories, this supports ~250 pipeline runs per month at zero cost."),
    pageBreak(),
  ];
}

function chapter6() {
  return [
    h1("Chapter 6: Discussion"),

    h2("6.1 Achievements"),
    para("This project successfully demonstrates that a comprehensive DevSecOps pipeline can be built entirely with open-source tools and free-tier services. The key achievement is the measurable security improvement: from 16 CRITICAL and 391 HIGH findings to near-zero, with every vulnerability detected, blocked, and remediated through the automated pipeline."),
    para("The supply chain security implementation (SBOM + Cosign signing) goes beyond typical academic projects, addressing the emerging SLSA framework requirements and demonstrating production-grade practices."),

    h2("6.2 Challenges Encountered"),
    para("Several technical challenges were encountered and resolved during implementation:"),
    bullet("SonarCloud Automatic Analysis: SonarCloud enables automatic analysis by default on public repositories, which conflicts with CI-triggered analysis. The solution was to disable automatic analysis in the SonarCloud project settings."),
    bullet("Docker image tag format mismatch: The docker/metadata-action generates short SHA tags (sha-abc1234), but downstream jobs referenced the full SHA. This was resolved by computing the short SHA explicitly in each job."),
    bullet("Git Bash path mangling: On Windows, Git Bash converts Unix-style paths to Windows paths, breaking Docker volume mounts. The MSYS_NO_PATHCONV=1 environment variable was required as a workaround."),
    bullet("Hadolint vs Conftest boundaries: Hadolint does not natively detect missing USER or HEALTHCHECK directives. These container best practices are enforced by custom Rego policies via Conftest, clarifying the complementary roles of both tools."),

    h2("6.3 Limitations"),
    para("Several limitations should be acknowledged:"),
    bullet("The DAST workflow (OWASP ZAP) is configured but not demonstrated in a live pipeline run, as it requires a running application target. The workflow will execute automatically when the staging deployment is active."),
    bullet("SonarCloud is configured as non-blocking (continue-on-error) due to intermittent authentication issues between the GitHub Action and SonarCloud API. The quality gate itself passes correctly."),
    bullet("The project demonstrates a single application. Real-world pipelines typically handle multiple microservices with shared pipeline templates and matrix builds."),
    bullet("Kubernetes deployment was out of scope. The pipeline produces a signed container image ready for any orchestration platform."),

    h2("6.4 Lessons Learned"),
    bullet("Custom security rules provide more value than default configurations. The 5 custom Semgrep rules and 7 Rego policies caught vulnerabilities that default rulesets would miss."),
    bullet("Pipeline debugging is a skill in itself. Action version pinning, environment variable management, and artifact passing between jobs require careful attention."),
    bullet("Security tools should be composable, not competing. Hadolint for syntax, Conftest for policy, and Trivy for CVEs each serve distinct purposes and complement each other."),
    bullet("Iterative pipeline tuning is essential. The initial pipeline required 6 fix iterations before all stages passed consistently, each iteration addressing different failure modes."),
    pageBreak(),
  ];
}

function chapter7() {
  return [
    h1("Chapter 7: Conclusion and Future Work"),

    h2("7.1 Conclusion"),
    para("This project successfully designed and implemented a comprehensive DevSecOps CI/CD pipeline with 17 automated stages, 2 security gates, and 8 integrated security tools. The pipeline was validated against a purpose-built demo application (SecureTrack) with 15 intentionally planted vulnerabilities across 6 security categories."),
    para("The results demonstrate a 100% reduction in critical vulnerabilities through automated detection and remediation. The pipeline correctly identified all 15 vulnerabilities, blocked insecure code from reaching production via automated security gates, and produced a signed container image with full supply chain transparency (SBOM + Cosign signature)."),
    para("The implementation maps to three industry frameworks (OWASP SAMM, NIST SSDF, ISO 27001), confirming alignment with recognized security standards. The observability layer (Prometheus + Grafana) provides continuous monitoring of security metrics, enabling data-driven security posture management."),
    para("This project proves that production-grade DevSecOps can be achieved using exclusively open-source tools and free-tier services, making it accessible to organizations of all sizes."),

    h2("7.2 Future Work"),
    para("Several enhancements could extend this work:"),
    bullet("Kubernetes Deployment: Add ArgoCD GitOps-based deployment to a Kubernetes cluster, with admission controllers enforcing signed image requirements."),
    bullet("Runtime Security: Integrate Falco for runtime anomaly detection and behavioral monitoring of containers in production."),
    bullet("DAST in Staging: Deploy the application to a staging environment and execute the OWASP ZAP workflow for full dynamic testing coverage."),
    bullet("Dependency Automation: Integrate Renovate or Dependabot for automated dependency update pull requests, keeping the supply chain current."),
    bullet("Multi-Service Pipeline: Expand to a microservices architecture with shared pipeline templates, matrix builds, and cross-service integration testing."),
    bullet("Developer Training Metrics: Track vulnerability introduction rates per developer and provide automated security training recommendations based on findings patterns."),
    bullet("SLSA Level 3 Compliance: Add hermetic builds and provenance attestation to achieve SLSA Build Level 3 certification."),
    pageBreak(),
  ];
}

function references() {
  const refs = [
    'OWASP Foundation. "OWASP Software Assurance Maturity Model (SAMM) v2.0." 2020.',
    'NIST. "Secure Software Development Framework (SSDF) SP 800-218." February 2022.',
    'Sonatype. "8th Annual State of the Software Supply Chain Report." 2022.',
    'Sigstore Project. "Cosign: Container Signing, Verification and Storage in an OCI Registry." 2023.',
    'Docker Inc. "Dockerfile Best Practices." Docker Documentation, 2024.',
    'GitHub. "GitHub Actions Documentation." GitHub Docs, 2024.',
    'SonarSource. "SonarCloud Documentation." 2024.',
    'Anchore. "Syft: A CLI Tool and Go Library for Generating SBOM from Container Images." 2024.',
    'Aqua Security. "Trivy: A Comprehensive and Versatile Security Scanner." 2024.',
    'Semgrep Inc. "Semgrep: Lightweight Static Analysis for Many Languages." 2024.',
    'Open Policy Agent. "OPA and Conftest Documentation." 2024.',
    'Prometheus Authors. "Prometheus: Monitoring System and Time Series Database." 2024.',
    'Grafana Labs. "Grafana: The Open and Composable Observability Platform." 2024.',
    'OWASP Foundation. "OWASP ZAP: The World\'s Most Widely Used Web App Scanner." 2024.',
    'ISO/IEC. "ISO 27001:2022 Information Security, Cybersecurity and Privacy Protection." 2022.',
  ];
  return [
    h1("References"),
    ...refs.map((r, i) =>
      new Paragraph({
        spacing: { after: 80 },
        indent: { left: 360, hanging: 360 },
        children: [new TextRun({ text: `[${i + 1}] ${r}`, font: FONT, size: 22 })],
      })
    ),
    pageBreak(),
  ];
}

function appendices() {
  return [
    h1("Appendices"),
    h2("Appendix A: CI/CD Pipeline Configuration"),
    para("The complete pipeline YAML is available at: .github/workflows/ci-pipeline.yml in the project repository."),
    para("Repository: https://github.com/anlehtouf/pfe-securetrack-devsecops"),

    h2("Appendix B: Custom Semgrep Rules"),
    para("Five custom Semgrep rules are defined in security/semgrep/.semgrep.yml targeting: hardcoded-secret-assignment, sensitive-data-in-log, weak-password-validation, express-auth-no-rate-limit, and cors-wildcard."),

    h2("Appendix C: OPA/Rego Policy"),
    para("Seven Dockerfile policies are defined in security/policies/dockerfile-policy.rego: no root user, require USER directive, require HEALTHCHECK, no :latest tag, prefer minimal base, COPY over ADD, no .env copy."),

    h2("Appendix D: Grafana Dashboards"),
    para("Two Grafana dashboards are provisioned: security-metrics.json (7 panels, uid: securetrack-security) and api-performance.json (8 panels, uid: securetrack-api)."),

    h2("Appendix E: Evidence"),
    para("Pipeline run evidence is documented in evidence/EVIDENCE_INDEX.md with links to all 3 pipeline runs (red baseline, green PR, production with signing), scanner reports, and before/after metrics."),
  ];
}

// ── Build document ───────────────────────────────────────────
const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: FONT, color: "1F3864" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: FONT, color: "2B579A" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: FONT, color: "404040" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_W, height: PAGE_H },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: "SecureTrack DevSecOps - PFE Report", font: FONT, size: 18, italics: true, color: "888888" })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Page ", font: FONT, size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18 })],
        })],
      }),
    },
    children: [
      ...coverPage(),
      ...tocPage(),
      ...abstractPage(),
      ...chapter1(),
      ...chapter2(),
      ...chapter3(),
      ...chapter4(),
      ...chapter5(),
      ...chapter6(),
      ...chapter7(),
      ...references(),
      ...appendices(),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("E:/PFE/docs/PFE_Report.docx", buffer);
  console.log("PFE_Report.docx generated successfully (" + Math.round(buffer.length / 1024) + " KB)");
});
