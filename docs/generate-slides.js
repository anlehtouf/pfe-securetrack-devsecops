const PptxGenJS = require("pptxgenjs");
const pptx = new PptxGenJS();

// ── Theme ────────────────────────────────────────────────────
const DARK = "1F3864";
const ACCENT = "2B579A";
const LIGHT_BG = "F2F6FC";
const GREEN = "27AE60";
const RED = "E74C3C";
const ORANGE = "F39C12";
const WHITE = "FFFFFF";
const GRAY = "666666";
const FONT = "Arial";

pptx.author = "Anas";
pptx.title = "Design and Implementation of a Secure DevSecOps CI/CD Pipeline";
pptx.subject = "PFE Presentation";
pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5

// ── Helpers ──────────────────────────────────────────────────
function addSlide(opts = {}) {
  const slide = pptx.addSlide();
  // Dark top bar
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: 0.06, fill: { color: ACCENT } });
  // Footer
  slide.addText("SecureTrack DevSecOps | PFE 2025-2026 | Anas", {
    x: 0.5, y: 7.0, w: 8, h: 0.3, fontSize: 9, color: GRAY, fontFace: FONT,
  });
  if (opts.title) {
    slide.addText(opts.title, {
      x: 0.6, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true, color: DARK, fontFace: FONT,
    });
  }
  if (opts.subtitle) {
    slide.addText(opts.subtitle, {
      x: 0.6, y: 1.0, w: 12, h: 0.4, fontSize: 16, color: ACCENT, fontFace: FONT,
    });
  }
  return slide;
}

function bulletList(items, opts = {}) {
  return items.map((item) => ({
    text: item,
    options: {
      fontSize: opts.fontSize || 18,
      color: opts.color || "333333",
      fontFace: FONT,
      bullet: { type: "bullet", indent: 10 },
      paraSpaceAfter: 6,
    },
  }));
}

// ── SLIDE 1: Title ───────────────────────────────────────────
const slide1 = pptx.addSlide();
slide1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: DARK } });
slide1.addShape(pptx.ShapeType.rect, { x: 0, y: 3.2, w: "100%", h: 0.05, fill: { color: ACCENT } });
slide1.addText("PROJET DE FIN D'ETUDES", {
  x: 0.5, y: 1.0, w: 12.3, h: 0.6, fontSize: 18, color: ACCENT, fontFace: FONT, bold: true, align: "center",
});
slide1.addText("Design and Implementation of a\nSecure DevSecOps CI/CD Pipeline\nwith Automated Vulnerability Scanning", {
  x: 0.5, y: 1.7, w: 12.3, h: 1.8, fontSize: 30, color: WHITE, fontFace: FONT, bold: true, align: "center", lineSpacingMultiple: 1.2,
});
slide1.addText("Prepared by: Anas\nSupervisor: [To be filled]\nInstitution: [To be filled]", {
  x: 0.5, y: 3.8, w: 12.3, h: 1.2, fontSize: 16, color: "AAAAAA", fontFace: FONT, align: "center", lineSpacingMultiple: 1.4,
});
slide1.addText("Academic Year 2025 - 2026", {
  x: 0.5, y: 5.5, w: 12.3, h: 0.5, fontSize: 14, color: ACCENT, fontFace: FONT, bold: true, align: "center",
});

// ── SLIDE 2: Agenda ──────────────────────────────────────────
const slide2 = addSlide({ title: "Agenda" });
const agendaItems = [
  "1. Introduction & Problem Statement",
  "2. Objectives & Methodology",
  "3. Architecture & Design",
  "4. Pipeline Implementation (17 Stages)",
  "5. Vulnerability Detection & Remediation",
  "6. Results & Metrics",
  "7. Supply Chain Security",
  "8. Observability & Monitoring",
  "9. Compliance Mapping",
  "10. Demo: Red Pipeline vs Green Pipeline",
  "11. Conclusion & Future Work",
];
slide2.addText(bulletList(agendaItems, { fontSize: 17 }), { x: 1.0, y: 1.5, w: 11, h: 5.5 });

// ── SLIDE 3: Problem Statement ───────────────────────────────
const slide3 = addSlide({ title: "Introduction & Problem Statement" });
slide3.addText(bulletList([
  "Software supply chain attacks increased 742% (2019-2022) - Sonatype Report",
  "Only 37% of organizations have integrated security in CI/CD (SANS 2023)",
  "Cost of fixing a vulnerability: 6.5x more in production vs development",
  "Manual code reviews miss ~60% of vulnerabilities (NIST)",
]), { x: 0.6, y: 1.5, w: 7.5, h: 3.5 });
// Stat box
slide3.addShape(pptx.ShapeType.rect, { x: 8.5, y: 1.5, w: 4.3, h: 3.5, fill: { color: LIGHT_BG }, rectRadius: 0.15 });
slide3.addText("The Challenge", {
  x: 8.7, y: 1.7, w: 3.9, h: 0.5, fontSize: 16, bold: true, color: DARK, fontFace: FONT, align: "center",
});
slide3.addText("How to automatically catch vulnerabilities across secrets, code, dependencies, and containers before production?", {
  x: 8.7, y: 2.3, w: 3.9, h: 2.2, fontSize: 14, color: "444444", fontFace: FONT, align: "center", valign: "top",
});
slide3.addText(bulletList([
  "SolarWinds (2020), Log4Shell (2021), Codecov breach",
  "Security must be embedded, not bolted on",
  "DevSecOps: Shift-Left Security",
], { fontSize: 16 }), { x: 0.6, y: 5.2, w: 12, h: 1.5 });

// ── SLIDE 4: Objectives ──────────────────────────────────────
const slide4 = addSlide({ title: "Project Objectives" });
slide4.addText(bulletList([
  "Design a 17-stage CI/CD pipeline with 2 security gates",
  "Integrate 8 open-source security tools (SAST, SCA, secrets, container, DAST)",
  "Plant 15 intentional vulnerabilities across 6 categories and detect all of them",
  "Achieve measurable improvement: 16 CRITICAL + 391 HIGH to near-zero",
  "Implement supply chain security: SBOM (Syft) + keyless signing (Cosign)",
  "Map pipeline controls to OWASP SAMM, NIST SSDF, and ISO 27001",
  "Build observability layer with Prometheus + Grafana dashboards",
], { fontSize: 17 }), { x: 0.6, y: 1.5, w: 12, h: 5 });

// ── SLIDE 5: Methodology ─────────────────────────────────────
const slide5 = addSlide({ title: "Methodology", subtitle: "Design Science Research (DSR)" });
const dsrSteps = [
  ["1. Problem Identification", "Security gaps in CI/CD pipelines"],
  ["2. Objectives Definition", "17 stages, 8 tools, measurable improvement"],
  ["3. Design & Development", "Pipeline architecture, tool selection, integration"],
  ["4. Demonstration", "15 vulnerabilities planted and detected"],
  ["5. Evaluation", "Before/after metrics, compliance mapping"],
  ["6. Communication", "This report and presentation"],
];
dsrSteps.forEach(([step, desc], i) => {
  const y = 1.6 + i * 0.85;
  slide5.addShape(pptx.ShapeType.rect, { x: 0.6, y, w: 3.5, h: 0.65, fill: { color: i % 2 === 0 ? ACCENT : DARK }, rectRadius: 0.08 });
  slide5.addText(step, { x: 0.6, y, w: 3.5, h: 0.65, fontSize: 14, bold: true, color: WHITE, fontFace: FONT, align: "center" });
  slide5.addText(desc, { x: 4.4, y, w: 8.5, h: 0.65, fontSize: 14, color: "333333", fontFace: FONT, valign: "middle" });
});

// ── SLIDE 6: Technology Stack ────────────────────────────────
const slide6 = addSlide({ title: "Technology Stack" });
const techRows = [
  ["Component", "Technology", "Purpose"],
  ["Backend", "Node.js 20 + Express 4.21", "RESTful API, JWT Auth"],
  ["Frontend", "React 18 + Vite", "Incident management SPA"],
  ["Database", "PostgreSQL 16 + Prisma 5", "Type-safe ORM"],
  ["CI/CD", "GitHub Actions", "Pipeline orchestration"],
  ["SAST", "Semgrep", "Custom rule + standard rulesets"],
  ["Secrets", "Gitleaks", "Regex + entropy detection"],
  ["SCA", "Trivy", "CVE scanning (deps + images)"],
  ["Quality", "SonarCloud", "Quality gate + code smells"],
  ["Policy", "Conftest / OPA", "Rego-based Dockerfile checks"],
  ["SBOM", "Syft", "SPDX component inventory"],
  ["Signing", "Cosign (Sigstore)", "Keyless OIDC signing"],
  ["Monitoring", "Prometheus + Grafana", "Metrics + dashboards"],
];
slide6.addTable(techRows, {
  x: 0.6, y: 1.3, w: 12.1,
  fontSize: 13, fontFace: FONT,
  colW: [1.8, 3.2, 7.1],
  border: { type: "solid", pt: 0.5, color: "CCCCCC" },
  rowH: 0.42,
  autoPage: false,
  color: "333333",
  headerRow: true,
});

// ── SLIDE 7: Architecture ────────────────────────────────────
const slide7 = addSlide({ title: "Pipeline Architecture", subtitle: "17 Stages, 2 Security Gates" });
// Gate 1 box
slide7.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.5, w: 6, h: 5, fill: { color: "FFF3E0" }, rectRadius: 0.1 });
slide7.addText("GATE 1: Source & Code", { x: 0.4, y: 1.5, w: 6, h: 0.5, fontSize: 14, bold: true, color: ORANGE, fontFace: FONT, align: "center" });

const gate1Items = [
  "Install Dependencies + Cache",
  "ESLint (Backend + Frontend)",
  "Jest Tests (20 unit + 14 integration)",
  "Vitest Tests (5 frontend)",
  "Gitleaks (Secret Detection)",
  "Semgrep (SAST - 5 custom rules)",
  "SonarCloud (Quality Gate)",
  "Trivy Filesystem (Dependency CVEs)",
  "SECURITY GATE 1 DECISION",
];
slide7.addText(gate1Items.map((t, i) => ({
  text: `${i + 1}. ${t}`,
  options: { fontSize: 13, color: i === 8 ? RED : "333333", bold: i === 8, fontFace: FONT, paraSpaceAfter: 2 },
})), { x: 0.6, y: 2.1, w: 5.5, h: 4.2 });

// Gate 2 box
slide7.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.5, w: 6, h: 5, fill: { color: "E8F5E9" }, rectRadius: 0.1 });
slide7.addText("GATE 2: Container", { x: 6.8, y: 1.5, w: 6, h: 0.5, fontSize: 14, bold: true, color: GREEN, fontFace: FONT, align: "center" });

const gate2Items = [
  "Docker Build (Buildx + cache)",
  "Hadolint (Dockerfile lint)",
  "Trivy Image Scan (CVEs)",
  "Syft SBOM (SPDX format)",
  "Conftest (7 Rego policies)",
  "SECURITY GATE 2 DECISION",
  "Cosign Sign + Push to GHCR",
  "Pipeline Summary + Metrics Push",
];
slide7.addText(gate2Items.map((t, i) => ({
  text: `${i + 10}. ${t}`,
  options: { fontSize: 13, color: (i === 5) ? RED : (i === 6 ? GREEN : "333333"), bold: i === 5 || i === 6, fontFace: FONT, paraSpaceAfter: 2 },
})), { x: 7.0, y: 2.1, w: 5.5, h: 4.2 });

// ── SLIDE 8: Vulnerability Matrix ────────────────────────────
const slide8 = addSlide({ title: "Vulnerability Matrix", subtitle: "15 Intentional Vulnerabilities Across 6 Categories" });
const vulnRows = [
  ["ID", "Category", "Description", "File", "Tool"],
  ["V1", "Secret", "Hardcoded API key", "logger.js", "Gitleaks, Semgrep"],
  ["V2", "Secret", "Hardcoded JWT secret", "auth.js", "Gitleaks, Semgrep"],
  ["V3", "Injection", "SQL injection (raw query)", "incidentService.js", "Semgrep"],
  ["V4", "XSS", "dangerouslySetInnerHTML", "IncidentDetail.jsx", "Semgrep"],
  ["V5", "SCA", "lodash@4.17.20 (CVEs)", "package.json", "Trivy"],
  ["V6", "Container", "EOL base image (node:16)", "Dockerfile", "Trivy image"],
  ["V7", "Container", "No USER (runs as root)", "Dockerfile", "Conftest"],
  ["V8", "Container", "No HEALTHCHECK", "Dockerfile", "Conftest"],
  ["V9", "Config", "Debug mode enabled", "app.js", "Semgrep"],
  ["V10", "Headers", "Missing helmet headers", "app.js", "ZAP (DAST)"],
  ["V11", "Auth", "No rate limit on login", "authRoutes.js", "Semgrep"],
  ["V12", "Auth", "Weak password policy", "authController.js", "Semgrep"],
  ["V13", "Logging", "Password in log output", "authService.js", "Semgrep"],
  ["V14", "Config", "CORS wildcard (*)", "app.js", "Semgrep"],
  ["V15", "SCA", "Old Express version", "package.json", "Trivy"],
];
slide8.addTable(vulnRows, {
  x: 0.3, y: 1.4, w: 12.7,
  fontSize: 11, fontFace: FONT,
  colW: [0.6, 1.2, 3.0, 3.2, 2.5],
  border: { type: "solid", pt: 0.5, color: "CCCCCC" },
  rowH: 0.34,
  autoPage: false,
  color: "333333",
  headerRow: true,
});

// ── SLIDE 9: Key Remediation Examples ────────────────────────
const slide9 = addSlide({ title: "Key Remediation Examples" });
// Left column - Before
slide9.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.4, w: 6.1, h: 5.2, fill: { color: "FDEDEC" }, rectRadius: 0.1 });
slide9.addText("BEFORE (Vulnerable)", { x: 0.4, y: 1.4, w: 6.1, h: 0.45, fontSize: 15, bold: true, color: RED, fontFace: FONT, align: "center" });
slide9.addText([
  { text: "V2 - Hardcoded JWT Secret:", options: { fontSize: 12, bold: true, color: "333333", fontFace: FONT } },
  { text: "\nconst JWT_SECRET = 'mysecret123';", options: { fontSize: 11, color: RED, fontFace: "Consolas" } },
  { text: "\n\nV3 - SQL Injection:", options: { fontSize: 12, bold: true, color: "333333", fontFace: FONT } },
  { text: "\nprisma.$queryRawUnsafe(\n  `SELECT * WHERE title LIKE '%${search}%'`\n)", options: { fontSize: 11, color: RED, fontFace: "Consolas" } },
  { text: "\n\nV6/V7/V8 - Dockerfile:", options: { fontSize: 12, bold: true, color: "333333", fontFace: FONT } },
  { text: "\nFROM node:16\n# No USER, no HEALTHCHECK\n# 900MB, 16 CRIT + 385 HIGH CVEs", options: { fontSize: 11, color: RED, fontFace: "Consolas" } },
], { x: 0.6, y: 2.0, w: 5.7, h: 4.3, valign: "top" });

// Right column - After
slide9.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.4, w: 6.1, h: 5.2, fill: { color: "E8F8F5" }, rectRadius: 0.1 });
slide9.addText("AFTER (Hardened)", { x: 6.8, y: 1.4, w: 6.1, h: 0.45, fontSize: 15, bold: true, color: GREEN, fontFace: FONT, align: "center" });
slide9.addText([
  { text: "V2 - Environment Variable:", options: { fontSize: 12, bold: true, color: "333333", fontFace: FONT } },
  { text: "\njwt.verify(token, process.env.JWT_SECRET);", options: { fontSize: 11, color: GREEN, fontFace: "Consolas" } },
  { text: "\n\nV3 - Parameterized Query:", options: { fontSize: 12, bold: true, color: "333333", fontFace: FONT } },
  { text: "\nprisma.incident.findMany({\n  where: { title: { contains: search } }\n})", options: { fontSize: 11, color: GREEN, fontFace: "Consolas" } },
  { text: "\n\nV6/V7/V8 - Hardened Dockerfile:", options: { fontSize: 12, bold: true, color: "333333", fontFace: FONT } },
  { text: "\nFROM node:20-alpine\nUSER appuser\nHEALTHCHECK ...\n# 180MB, 0 CRIT, ~5 HIGH", options: { fontSize: 11, color: GREEN, fontFace: "Consolas" } },
], { x: 7.0, y: 2.0, w: 5.7, h: 4.3, valign: "top" });

// ── SLIDE 10: Red vs Green Pipeline ──────────────────────────
const slide10 = addSlide({ title: "Pipeline Results: Red vs Green" });
// Red side
slide10.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.4, w: 6.1, h: 5.0, fill: { color: "FDEDEC" }, rectRadius: 0.1 });
slide10.addText("RED BASELINE (Vulnerable)", { x: 0.4, y: 1.4, w: 6.1, h: 0.5, fontSize: 15, bold: true, color: RED, fontFace: FONT, align: "center" });
slide10.addText(bulletList([
  "Gitleaks: 3 secrets detected",
  "Semgrep: 6 findings (1 ERROR + 5 WARNING)",
  "Trivy: 2 HIGH CVEs (lodash)",
  "Gate 1: BLOCKED",
  "Container: 16 CRITICAL + 385 HIGH CVEs",
  "Policy: 2 violations (no USER, no HEALTHCHECK)",
  "Pipeline verdict: FAILED",
], { fontSize: 14, color: RED }), { x: 0.6, y: 2.0, w: 5.7, h: 4.2 });

// Green side
slide10.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.4, w: 6.1, h: 5.0, fill: { color: "E8F8F5" }, rectRadius: 0.1 });
slide10.addText("GREEN HARDENED (Fixed)", { x: 6.8, y: 1.4, w: 6.1, h: 0.5, fontSize: 15, bold: true, color: GREEN, fontFace: FONT, align: "center" });
slide10.addText(bulletList([
  "Gitleaks: 0 secrets",
  "Semgrep: 0 findings",
  "Trivy: 0 HIGH CVEs",
  "Gate 1: PASSED",
  "Container: 0 CRITICAL, ~5 HIGH CVEs",
  "Policy: 0 violations, 7/7 pass",
  "Pipeline verdict: 17/17 APPROVED",
], { fontSize: 14, color: GREEN }), { x: 7.0, y: 2.0, w: 5.7, h: 4.2 });

// ── SLIDE 11: Before/After Metrics ───────────────────────────
const slide11 = addSlide({ title: "Security Metrics: Before vs After" });
const metricsRows = [
  ["Metric", "Before (Vulnerable)", "After (Hardened)", "Improvement"],
  ["Hardcoded secrets", "3", "0", "-100%"],
  ["SAST findings", "6", "0", "-100%"],
  ["Dependency HIGH CVEs", "2", "0", "-100%"],
  ["Container CRITICAL CVEs", "16", "0", "-100%"],
  ["Container HIGH CVEs", "385", "~5", "-98.7%"],
  ["Policy violations", "2", "0", "-100%"],
  ["Image size", "~900 MB", "~180 MB", "-80%"],
  ["Pipeline verdict", "BLOCKED", "APPROVED", "Full pass"],
];
slide11.addTable(metricsRows, {
  x: 0.8, y: 1.5, w: 11.7,
  fontSize: 15, fontFace: FONT,
  colW: [3.5, 2.8, 2.8, 2.6],
  border: { type: "solid", pt: 0.5, color: "CCCCCC" },
  rowH: 0.55,
  autoPage: false,
  color: "333333",
  headerRow: true,
});

// ── SLIDE 12: Supply Chain Security ──────────────────────────
const slide12 = addSlide({ title: "Supply Chain Security" });
slide12.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.4, w: 3.8, h: 4.5, fill: { color: LIGHT_BG }, rectRadius: 0.1 });
slide12.addText("SBOM (Syft)", { x: 0.4, y: 1.5, w: 3.8, h: 0.5, fontSize: 16, bold: true, color: DARK, fontFace: FONT, align: "center" });
slide12.addText(bulletList([
  "SPDX JSON format",
  "Full component inventory",
  "Tracks every package",
  "Enables CVE tracking",
], { fontSize: 14 }), { x: 0.5, y: 2.1, w: 3.6, h: 3.0 });

slide12.addShape(pptx.ShapeType.rect, { x: 4.6, y: 1.4, w: 4.2, h: 4.5, fill: { color: LIGHT_BG }, rectRadius: 0.1 });
slide12.addText("Cosign Keyless Signing", { x: 4.6, y: 1.5, w: 4.2, h: 0.5, fontSize: 16, bold: true, color: DARK, fontFace: FONT, align: "center" });
slide12.addText(bulletList([
  "GitHub OIDC identity",
  "No private key to manage",
  "Fulcio CA short-lived cert",
  "Rekor transparency log",
], { fontSize: 14 }), { x: 4.7, y: 2.1, w: 4.0, h: 3.0 });

slide12.addShape(pptx.ShapeType.rect, { x: 9.2, y: 1.4, w: 3.8, h: 4.5, fill: { color: LIGHT_BG }, rectRadius: 0.1 });
slide12.addText("GHCR Publication", { x: 9.2, y: 1.5, w: 3.8, h: 0.5, fontSize: 16, bold: true, color: DARK, fontFace: FONT, align: "center" });
slide12.addText(bulletList([
  "GitHub Container Registry",
  "SHA + branch tags",
  "Signed and verified",
  "Production-ready",
], { fontSize: 14 }), { x: 9.3, y: 2.1, w: 3.6, h: 3.0 });

slide12.addText("Image: ghcr.io/anlehtouf/pfe-securetrack-devsecops/securetrack-backend", {
  x: 0.4, y: 6.2, w: 12.5, h: 0.5, fontSize: 12, color: ACCENT, fontFace: "Consolas", align: "center",
});

// ── SLIDE 13: Observability ──────────────────────────────────
const slide13 = addSlide({ title: "Observability & Monitoring" });
// Left - Prometheus
slide13.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.4, w: 6.1, h: 5.0, fill: { color: LIGHT_BG }, rectRadius: 0.1 });
slide13.addText("Prometheus + Alerting", { x: 0.4, y: 1.4, w: 6.1, h: 0.5, fontSize: 16, bold: true, color: DARK, fontFace: FONT, align: "center" });
slide13.addText(bulletList([
  "7 CI pipeline metrics pushed via Pushgateway",
  "3 scrape targets (self, pushgateway, backend)",
  "9 alerting rules in 2 groups:",
  "  - Security: build failed, secrets found, SAST findings, CVEs, low coverage",
  "  - Application: high error rate (>5%), high latency (>2s p95)",
  "30-day metric retention",
], { fontSize: 14 }), { x: 0.6, y: 2.0, w: 5.7, h: 4.2 });

// Right - Grafana
slide13.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.4, w: 6.1, h: 5.0, fill: { color: LIGHT_BG }, rectRadius: 0.1 });
slide13.addText("Grafana Dashboards", { x: 6.8, y: 1.4, w: 6.1, h: 0.5, fontSize: 16, bold: true, color: DARK, fontFace: FONT, align: "center" });
slide13.addText(bulletList([
  "Security Metrics Dashboard (7 panels):",
  "  - Build status, secrets count, SAST findings",
  "  - Image CVEs, test coverage, pipeline duration",
  "  - Findings trend over time",
  "API Performance Dashboard (8 panels):",
  "  - Request rate, p50/p95/p99 latency",
  "  - Error rate gauge, per-route breakdown",
], { fontSize: 14 }), { x: 7.0, y: 2.0, w: 5.7, h: 4.2 });

// ── SLIDE 14: Compliance Mapping ─────────────────────────────
const slide14 = addSlide({ title: "Compliance Mapping" });
const compRows = [
  ["Framework", "Controls Addressed", "Pipeline Mapping"],
  ["OWASP SAMM", "Security Testing (ST1-ST3)\nSecure Build (SB1-SB2)\nDefect Management", "Semgrep, Trivy, ZAP, Gitleaks\nGitHub Actions, npm ci\nGate 1 + Gate 2 blocking"],
  ["NIST SSDF\n(SP 800-218)", "PW.7 Review code\nPW.8 Test software\nPW.9 Configure pipeline\nPS.1 Protect, PS.2 SBOM", "Semgrep SAST + SonarCloud\nJest + Vitest (39 tests)\nGitHub Actions workflow\nCosign signing, Syft SBOM"],
  ["ISO 27001\nAnnex A", "A.14.2.1 Dev security policy\nA.14.2.5 Secure engineering\nA.14.2.8 System testing\nA.12.6.1 Vulnerability mgmt", "Pipeline-as-code in VCS\nGate-based approval model\n39 automated tests\nTrivy + Gitleaks + Semgrep"],
];
slide14.addTable(compRows, {
  x: 0.4, y: 1.4, w: 12.5,
  fontSize: 12, fontFace: FONT,
  colW: [2.2, 4.5, 5.8],
  border: { type: "solid", pt: 0.5, color: "CCCCCC" },
  rowH: [0.4, 1.4, 1.4, 1.4],
  autoPage: false,
  color: "333333",
  headerRow: true,
});

// ── SLIDE 15: Container Hardening ────────────────────────────
const slide15 = addSlide({ title: "Container Hardening" });
const containerRows = [
  ["Aspect", "Before", "After"],
  ["Base image", "node:16 (Debian 10, EOL)", "node:20-alpine"],
  ["User", "root (default)", "appuser (non-root)"],
  ["Health check", "None", "wget against /api/health"],
  ["Dependencies", "npm install (all deps)", "npm ci --omit=dev"],
  ["Image size", "~900 MB", "~180 MB"],
  ["CRITICAL CVEs", "16", "0"],
  ["HIGH CVEs", "385", "~5"],
];
slide15.addTable(containerRows, {
  x: 1.0, y: 1.5, w: 11.3,
  fontSize: 16, fontFace: FONT,
  colW: [2.5, 4.4, 4.4],
  border: { type: "solid", pt: 0.5, color: "CCCCCC" },
  rowH: 0.6,
  autoPage: false,
  color: "333333",
  headerRow: true,
});
// Policy box
slide15.addShape(pptx.ShapeType.rect, { x: 1.0, y: 6.0, w: 11.3, h: 0.7, fill: { color: LIGHT_BG }, rectRadius: 0.08 });
slide15.addText("7 OPA/Rego policies enforced via Conftest: no root, require USER, require HEALTHCHECK, no :latest, minimal base, COPY over ADD, no .env", {
  x: 1.2, y: 6.0, w: 10.9, h: 0.7, fontSize: 12, color: DARK, fontFace: FONT, valign: "middle",
});

// ── SLIDE 16: Demo Overview ──────────────────────────────────
const slide16 = addSlide({ title: "Live Demo", subtitle: "Red Pipeline -> Fix -> Green Pipeline" });
slide16.addText(bulletList([
  "1. Show GitHub repository overview (95 files, branch protection)",
  "2. Open RED pipeline run (commit 43d5acd on develop)",
  "   - Walk through each failing scanner job",
  "   - Show Security Gate 1 BLOCKING deployment",
  "3. Open PR #1: Files Changed tab",
  "   - Highlight key fixes: secrets removed, SQL injection fixed, Dockerfile hardened",
  "4. Open GREEN pipeline run (17/17 on main)",
  "   - Both gates pass, image built, scanned, signed",
  "5. Show Cosign signature verification",
  "6. Show Grafana dashboards (if Docker running) or JSON configs",
], { fontSize: 16 }), { x: 0.6, y: 1.5, w: 12, h: 5.5 });

// ── SLIDE 17: Challenges & Lessons ───────────────────────────
const slide17 = addSlide({ title: "Challenges & Lessons Learned" });
// Challenges
slide17.addShape(pptx.ShapeType.rect, { x: 0.4, y: 1.4, w: 6.1, h: 4.5, fill: { color: "FFF3E0" }, rectRadius: 0.1 });
slide17.addText("Challenges", { x: 0.4, y: 1.4, w: 6.1, h: 0.5, fontSize: 16, bold: true, color: ORANGE, fontFace: FONT, align: "center" });
slide17.addText(bulletList([
  "SonarCloud Automatic Analysis conflicts with CI-triggered scans",
  "Docker image tag format mismatch (short vs full SHA)",
  "Hadolint vs Conftest boundary: complementary, not competing",
  "8 fix iterations needed before consistent green pipeline",
], { fontSize: 14 }), { x: 0.6, y: 2.0, w: 5.7, h: 3.5 });

// Lessons
slide17.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.4, w: 6.1, h: 4.5, fill: { color: "E8F5E9" }, rectRadius: 0.1 });
slide17.addText("Lessons Learned", { x: 6.8, y: 1.4, w: 6.1, h: 0.5, fontSize: 16, bold: true, color: GREEN, fontFace: FONT, align: "center" });
slide17.addText(bulletList([
  "Custom rules >> default configs for targeted detection",
  "Security tools are composable, not competing",
  "Pipeline debugging is a skill in itself",
  "Iterative tuning is essential - expect multiple fix rounds",
], { fontSize: 14 }), { x: 7.0, y: 2.0, w: 5.7, h: 3.5 });

// ── SLIDE 18: Future Work ────────────────────────────────────
const slide18 = addSlide({ title: "Future Work" });
slide18.addText(bulletList([
  "Kubernetes Deployment: ArgoCD GitOps with admission controllers enforcing signed images",
  "Runtime Security: Falco for container behavior monitoring in production",
  "DAST in Staging: OWASP ZAP baseline scan against running application",
  "Dependency Automation: Renovate/Dependabot for automated updates",
  "Multi-Service Pipeline: Shared templates, matrix builds, cross-service tests",
  "SLSA Level 3: Hermetic builds + provenance attestation",
], { fontSize: 17 }), { x: 0.6, y: 1.5, w: 12, h: 5 });

// ── SLIDE 19: Conclusion ─────────────────────────────────────
const slide19 = addSlide({ title: "Conclusion" });
slide19.addText(bulletList([
  "17-stage pipeline with 2 security gates, 8 open-source tools",
  "15/15 vulnerabilities detected and remediated (6 categories)",
  "100% reduction in critical findings (16 CRIT + 391 HIGH to near-zero)",
  "Full supply chain security: SBOM + keyless signing + verified image",
  "Mapped to OWASP SAMM, NIST SSDF, and ISO 27001",
  "Observability: Prometheus metrics + Grafana dashboards + 9 alert rules",
  "Zero cost: entirely built on open-source tools and free tiers",
], { fontSize: 18 }), { x: 0.6, y: 1.5, w: 12, h: 4.0 });
// Highlight box
slide19.addShape(pptx.ShapeType.rect, { x: 2.0, y: 5.5, w: 9.3, h: 1.2, fill: { color: LIGHT_BG }, rectRadius: 0.15 });
slide19.addText("Production-grade DevSecOps is achievable with open-source tools.\nSecurity must be automated, measurable, and embedded in the pipeline.", {
  x: 2.2, y: 5.6, w: 8.9, h: 1.0, fontSize: 16, color: DARK, fontFace: FONT, align: "center", bold: true, lineSpacingMultiple: 1.3,
});

// ── SLIDE 20: Thank You / Q&A ────────────────────────────────
const slide20 = pptx.addSlide();
slide20.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: DARK } });
slide20.addText("Thank You", {
  x: 0.5, y: 1.5, w: 12.3, h: 1.5, fontSize: 48, color: WHITE, fontFace: FONT, bold: true, align: "center",
});
slide20.addText("Questions & Discussion", {
  x: 0.5, y: 3.2, w: 12.3, h: 0.8, fontSize: 24, color: ACCENT, fontFace: FONT, align: "center",
});
slide20.addShape(pptx.ShapeType.rect, { x: 4, y: 4.2, w: 5.3, h: 0.04, fill: { color: ACCENT } });
slide20.addText("Anas | PFE 2025-2026\nhttps://github.com/anlehtouf/pfe-securetrack-devsecops", {
  x: 0.5, y: 4.8, w: 12.3, h: 1.0, fontSize: 14, color: "AAAAAA", fontFace: FONT, align: "center", lineSpacingMultiple: 1.5,
});

// ── Generate ─────────────────────────────────────────────────
pptx.writeFile({ fileName: "E:/PFE/docs/PFE_Presentation.pptx" })
  .then(() => console.log("PFE_Presentation.pptx generated successfully"))
  .catch((err) => console.error("Error:", err));
