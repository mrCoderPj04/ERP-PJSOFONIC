/**
 * Master Engineering, Quality & Project Delivery Report Export Utility
 * Generates an exact 13-page corporate PDF matching the PS Softonic I7 Master Report
 * covering Parts A through F across all 11 EMS designations.
 */
import {
  CrmCustomerProject,
  MasterEngineeringReport,
  getDefaultMasterEngineeringReport,
} from './crm';

export function exportMasterEngineeringReportToPdf(
  project: CrmCustomerProject,
  reportData?: MasterEngineeringReport
): void {
  const report = reportData || project.masterReport || getDefaultMasterEngineeringReport(project);
  const printWindow = window.open('', '_blank', 'width=1100,height=1200');
  if (!printWindow) {
    alert('Please allow popups in your browser to view the printable A4 Master Engineering Report.');
    return;
  }

  const { docInfo, partA_FullStack, partB_DevOps, partC_AiEngineering, partD_Quality, partE_BugBounty, partF_Closure } = report;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Master Engineering Report - ${project.projectCode}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 9.5px;
      line-height: 1.35;
      color: #0f172a;
      margin: 0;
      padding: 0;
      background: #fff;
    }

    /* Page Container */
    .doc-page {
      width: 100%;
      min-height: 272mm;
      max-height: 277mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      position: relative;
      box-sizing: border-box;
      padding: 0;
    }

    .doc-page:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 5px;
      margin-bottom: 8px;
      font-size: 8px;
      color: #475569;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .page-header .brand {
      color: #0f172a;
      font-weight: 900;
    }
    .page-header .project-ref {
      color: #2563eb;
    }

    /* Page Footer */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #cbd5e1;
      padding-top: 5px;
      margin-top: 8px;
      font-size: 8px;
      color: #64748b;
    }
    .page-footer .confidential {
      color: #dc2626;
      font-weight: 700;
    }

    /* Main Page Content Body */
    .page-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    /* Section Styling */
    .section-title {
      font-size: 10.5px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      background: #f1f5f9;
      border-left: 4px solid #2563eb;
      padding: 3px 8px;
      margin: 6px 0 4px 0;
    }
    .part-banner {
      background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      padding: 5px 10px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      border-radius: 3px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .part-banner .role-tag {
      font-size: 8px;
      background: #2563eb;
      color: #ffffff;
      padding: 2px 6px;
      border-radius: 9999px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 6px;
      font-size: 8.5px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 3.5px 6px;
      text-align: left;
      vertical-align: middle;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8px;
      letter-spacing: 0.3px;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Status Pills */
    .pill {
      display: inline-block;
      padding: 1.5px 5px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 7.5px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      text-align: center;
    }
    .pill-pass, .pill-completed, .pill-verified, .pill-closed, .pill-live, .pill-yes {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }
    .pill-high, .pill-critical, .pill-open {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }
    .pill-med {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fcd34d;
    }
    .pill-low, .pill-trivial {
      background: #e0f2fe;
      color: #075985;
      border: 1px solid #7dd3fc;
    }

    /* Grids & Cards */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 5px 7px;
    }
    .card-title {
      font-size: 7.5px;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .card-val {
      font-size: 10px;
      font-weight: 800;
      color: #0f172a;
    }

    /* Sign-off Boxes */
    .signoff-container {
      margin-top: auto;
      padding-top: 6px;
      border-top: 1px dashed #cbd5e1;
    }
    .sign-box {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 6px 8px;
      background: #ffffff;
    }
    .sign-box.filled {
      border-color: #2563eb;
      background: #f0f7ff;
    }
    .sign-title {
      font-size: 8px;
      font-weight: 800;
      color: #1e3a8a;
      text-transform: uppercase;
    }
    .sign-name {
      font-size: 9.5px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 1px;
    }
    .sign-role {
      font-size: 7.5px;
      color: #64748b;
    }
    .sign-signature {
      font-family: 'Brush Script MT', 'Dancing Script', cursive, serif;
      font-size: 14px;
      color: #1d4ed8;
      margin: 3px 0;
      line-height: 1;
    }
    .sign-meta {
      font-size: 7.5px;
      color: #475569;
    }

    /* Cover Page Specific */
    .cover-hero {
      text-align: center;
      padding: 25px 20px 15px 20px;
      border-bottom: 3px solid #0f172a;
      margin-bottom: 20px;
    }
    .cover-brand {
      font-size: 24px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .cover-brand span {
      color: #2563eb;
    }
    .cover-sub {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .cover-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      margin: 18px 0 6px 0;
      line-height: 1.2;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cover-desc {
      font-size: 11px;
      color: #334155;
      font-weight: 600;
      max-width: 580px;
      margin: 0 auto;
    }
    .cover-system {
      display: inline-block;
      margin-top: 10px;
      padding: 4px 12px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 9999px;
      font-size: 9.5px;
      font-weight: 800;
      color: #1d4ed8;
      text-transform: uppercase;
    }

    /* Table of contents page */
    .toc-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 5px 0;
      border-bottom: 1px dotted #cbd5e1;
      font-size: 9.5px;
    }
    .toc-item.part-heading {
      font-weight: 900;
      color: #0f172a;
      border-bottom: 1.5px solid #0f172a;
      margin-top: 8px;
      padding-bottom: 3px;
      text-transform: uppercase;
      font-size: 10px;
    }
    .toc-item .page-num {
      font-weight: 800;
      color: #2563eb;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .doc-page {
        margin: 0;
        border: none;
      }
    }
  </style>
</head>
<body>

  <!-- ========================================================================= -->
  <!-- PAGE 1: COVER PAGE                                                       -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7 ENTERPRISE</span>
      <span>MASTER ENGINEERING DOSSIER</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content" style="justify-content: center;">
      <div class="cover-hero">
        <div class="cover-brand">PS SOFTONIC <span>I7</span></div>
        <div class="cover-sub">Enterprise Engineering &amp; Technology Directorate</div>
        <div class="cover-title">Master Engineering, Quality &amp; Project Delivery Report</div>
        <div class="cover-desc">
          Comprehensive Engineering, AI, DevOps, Quality Assurance &amp; Security Validation Dossier
        </div>
        <div class="cover-system">
          ${project.projectName} (${project.projectCode}) • PS Softonic I7 Enterprise Suite
        </div>
      </div>

      <div style="max-width: 620px; margin: 0 auto; width: 100%;">
        <div class="section-title" style="margin-bottom: 8px;">Document Control &amp; Authorization Metadata</div>
        <table>
          <tbody>
            <tr>
              <th style="width: 25%;">Report ID</th>
              <td style="width: 25%; font-weight: 800; color: #2563eb;">${docInfo.reportId || 'MRE-' + project.projectCode}</td>
              <th style="width: 25%;">Version</th>
              <td style="width: 25%; font-weight: 800;">${docInfo.version || '1.0 Final Release'}</td>
            </tr>
            <tr>
              <th>Date of Issue</th>
              <td>${docInfo.dateOfIssue || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              <th>Classification</th>
              <td><span class="pill pill-high">${docInfo.classification || 'Strictly Confidential'}</span></td>
            </tr>
            <tr>
              <th>Prepared By</th>
              <td style="font-weight: 700;">${docInfo.preparedBy || 'Engineering, DevOps, AI & QA Teams'}</td>
              <th>Reviewed By</th>
              <td style="font-weight: 700;">${docInfo.reviewedBy || 'Quality Head & Cyber Directorate'}</td>
            </tr>
            <tr>
              <th>Project Status</th>
              <td><span class="pill pill-pass">${docInfo.projectStatus || 'Production Certified & Closed'}</span></td>
              <th>Client / Customer</th>
              <td style="font-weight: 700;">${project.customerName || 'Enterprise Directorate'}</td>
            </tr>
            <tr>
              <th>Assigned Manager</th>
              <td>${project.managerName || 'Manager Directorate'}</td>
              <th>Production Head</th>
              <td>${project.productionHeadName || 'Production Head'}</td>
            </tr>
            <tr>
              <th>Assigned Team Lead</th>
              <td>${project.targetTeamLeadName || 'Technical Team Leader'}</td>
              <th>Target Environment</th>
              <td>Production (Multi-Region Cloud &amp; On-Prem)</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 25px; padding: 10px 14px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; font-size: 8px; color: #9f1239; line-height: 1.4;">
          <strong>SECURITY &amp; CONFIDENTIALITY NOTICE:</strong> This official Master Engineering Dossier contains proprietary system architecture, source deployment records, quality verification metrics, and security assessment findings belonging to PS SOFTONIC. Unauthorized reproduction, transmission, or disclosure without explicit written consent from the Directorate is strictly prohibited.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Master Engineering Dossier</span>
      <span class="confidential">CONFIDENTIAL &amp; PROPRIETARY</span>
      <span>Page 1 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 2: TABLE OF CONTENTS                                                 -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>EXECUTIVE TABLE OF CONTENTS</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <div class="section-title" style="margin-top: 0;">Table of Contents — Master Report Breakdown</div>
      <p style="font-size: 8.5px; color: #475569; margin: 0 0 10px 0;">
        This Master Engineering Report represents the combined verification of 6 engineering departments across 24 structured sections.
      </p>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 10px 16px;">
        <div class="toc-item part-heading">
          <span>PART A — PROJECT &amp; FULL STACK ENGINEERING</span>
          <span class="page-num">Pages 3 – 4</span>
        </div>
        <div class="toc-item" style="padding-left: 12px;"><span>1. Executive Summary &amp; Core Performance Metrics</span><span class="page-num">Page 3</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>2. Scope &amp; Deliverables Verification Matrix (Tasks 1 to 12)</span><span class="page-num">Page 3</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>3. Full Stack Engineering Areas (Frontend, Backend, DB, State, Security)</span><span class="page-num">Page 3</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>4. System Architecture &amp; Enterprise Tech Stack</span><span class="page-num">Page 4</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>5. ERP &amp; EMS Deep Integration Matrix &amp; Full Stack Sign-Off</span><span class="page-num">Page 4</span></div>

        <div class="toc-item part-heading">
          <span>PART B — DEVOPS &amp; PRODUCTION ENGINEERING</span>
          <span class="page-num">Pages 5 – 6</span>
        </div>
        <div class="toc-item" style="padding-left: 12px;"><span>6. DevOps Engineering &amp; Container Infrastructure Report</span><span class="page-num">Page 5</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>7. Environment Endpoints &amp; Production Deployments</span><span class="page-num">Page 5</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>8. CI/CD Monitoring, Telemetry, Backup &amp; Rollback Capabilities</span><span class="page-num">Page 5</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>9. Production Handover Checklist &amp; DevOps Sign-Off</span><span class="page-num">Page 6</span></div>

        <div class="toc-item part-heading">
          <span>PART C — AI ENGINEERING &amp; WORKFLOW AUTOMATION</span>
          <span class="page-num">Pages 7 – 8</span>
        </div>
        <div class="toc-item" style="padding-left: 12px;"><span>10. AI Engineering &amp; LLM Service Architecture Report</span><span class="page-num">Page 7</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>11. AI Architecture &amp; Autonomous Agent Workflow Details</span><span class="page-num">Page 7</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>12. n8n Enterprise Workflow Automation Pipeline (8 Stages)</span><span class="page-num">Page 7</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>13. AI Testing, Evaluation Metrics &amp; AI Engineer Sign-Off</span><span class="page-num">Page 8</span></div>

        <div class="toc-item part-heading">
          <span>PART D — QUALITY ENGINEERING &amp; TESTING VERIFICATION</span>
          <span class="page-num">Pages 9 – 10</span>
        </div>
        <div class="toc-item" style="padding-left: 12px;"><span>14. Quality Engineering Coverage Report (7 Core Test Disciplines)</span><span class="page-num">Page 9</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>15. Test Strategy &amp; Execution Coverage by System Module</span><span class="page-num">Page 9</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>16. Functional, Integration, Regression &amp; UAT Test Results</span><span class="page-num">Page 9</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>17. Defect Severity Matrix, Release Criteria &amp; Dual QA Sign-Off</span><span class="page-num">Page 10</span></div>

        <div class="toc-item part-heading">
          <span>PART E — BUG BOUNTY &amp; SECURITY ASSURANCE</span>
          <span class="page-num">Page 11</span>
        </div>
        <div class="toc-item" style="padding-left: 12px;"><span>18. Security Assessment &amp; Ethical Bug Bounty Validation Areas</span><span class="page-num">Page 11</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>19. Comprehensive Vulnerability Triage &amp; Risk Summary</span><span class="page-num">Page 11</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>20. Remediation Tracking (SEC-001..003) &amp; Dual Cyber Sign-Off</span><span class="page-num">Page 11</span></div>

        <div class="toc-item part-heading">
          <span>PART F — PERFORMANCE, CLOSURE &amp; GOVERNANCE</span>
          <span class="page-num">Pages 12 – 13</span>
        </div>
        <div class="toc-item" style="padding-left: 12px;"><span>21. Performance, Latency &amp; System Reliability Benchmarks</span><span class="page-num">Page 12</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>22. Final Project Delivery Metrics &amp; Engineering KPIs</span><span class="page-num">Page 12</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>23. Key Challenges &amp; Lessons Learned</span><span class="page-num">Page 12</span></div>
        <div class="toc-item" style="padding-left: 12px;"><span>24. Final Acceptance Table, 5-Tier Project Closure &amp; Revision Log</span><span class="page-num">Page 13</span></div>
      </div>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Master Engineering Dossier</span>
      <span>EXECUTIVE TABLE OF CONTENTS</span>
      <span>Page 2 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 3: PART A — FULL STACK ENGINEERING (1, 2, 3)                         -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>PART A: PROJECT &amp; FULL STACK ENGINEERING</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <div class="part-banner">
        <span>PART A — PROJECT &amp; FULL STACK ENGINEERING</span>
        <span class="role-tag">Designation: Full Stack Engineer</span>
      </div>

      <!-- 1. Executive Summary -->
      <div class="section-title">1. Executive Summary</div>
      <table>
        <tbody>
          <tr>
            <th style="width: 25%;">Project Outcome</th>
            <td style="width: 25%; font-weight: 800; color: #166534;">${partA_FullStack.executiveSummary.projectOutcome || 'SUCCESS / 100% ON-TIME DELIVERY'}</td>
            <th style="width: 25%;">Overall Delivery</th>
            <td style="width: 25%; font-weight: 800;">${partA_FullStack.executiveSummary.overallDelivery || '100% Features Delivered'}</td>
          </tr>
          <tr>
            <th>Budget Adherence</th>
            <td style="font-weight: 700; color: #166534;">${partA_FullStack.executiveSummary.budgetAdherence || 'Within Approved Budget'}</td>
            <th>Timeline Adherence</th>
            <td style="font-weight: 700; color: #166534;">${partA_FullStack.executiveSummary.timelineAdherence || 'Delivered On-Schedule'}</td>
          </tr>
          <tr>
            <th>Production Status</th>
            <td><span class="pill pill-live">${partA_FullStack.executiveSummary.productionStatus || 'Live / Operational'}</span></td>
            <th>Quality Status</th>
            <td><span class="pill pill-pass">${partA_FullStack.executiveSummary.qualityStatus || 'Production Ready / QA Certified'}</span></td>
          </tr>
          <tr>
            <th>Security Status</th>
            <td colspan="3"><span class="pill pill-pass">${partA_FullStack.executiveSummary.securityStatus || 'Zero Open Criticals / Pentest Cleared'}</span></td>
          </tr>
        </tbody>
      </table>
      <p style="font-size: 8px; color: #334155; margin: 0 0 6px 0; line-height: 1.35;">
        ${partA_FullStack.executiveSummary.overviewText || 'The system was engineered and delivered in full compliance with the approved architecture and business requirements. All full-stack deliverables underwent rigorous verification and end-to-end integration testing.'}
      </p>

      <!-- 2. Scope & Deliverables Matrix -->
      <div class="section-title">2. Scope &amp; Deliverables Matrix (Tasks 1 to 12)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">Task #</th>
            <th style="width: 38%;">Scope / Requirement Item</th>
            <th style="width: 42%;">Deliverable Work Product</th>
            <th style="width: 12%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(partA_FullStack.scopeDeliverables || []).map((d) => `
            <tr>
              <td style="text-align: center; font-weight: 700;">Task ${d.taskNo}</td>
              <td>${d.requirement}</td>
              <td>${d.deliverable}</td>
              <td style="text-align: center;"><span class="pill pill-completed">${d.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 3. Full Stack Engineering Areas -->
      <div class="section-title">3. Full Stack Engineering Areas</div>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Engineering Area</th>
            <th style="width: 63%;">Scope &amp; Implementation Details</th>
            <th style="width: 12%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(partA_FullStack.engineeringAreas || []).slice(0, 5).map((a) => `
            <tr>
              <td><strong>${a.area}</strong></td>
              <td>${a.scope}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${a.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Part A: Full Stack Engineering</span>
      <span>1. EXECUTIVE SUMMARY &amp; SCOPE MATRIX</span>
      <span>Page 3 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 4: PART A CONT. (3 CONT, 4, 5 & SIGN-OFF)                            -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>PART A: ARCHITECTURE &amp; INTEGRATION</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <!-- 3. Full Stack Engineering Cont. -->
      <div class="section-title" style="margin-top: 0;">3. Full Stack Engineering Areas (Cont.)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Engineering Area</th>
            <th style="width: 63%;">Scope &amp; Implementation Details</th>
            <th style="width: 12%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(partA_FullStack.engineeringAreas || []).slice(5).map((a) => `
            <tr>
              <td><strong>${a.area}</strong></td>
              <td>${a.scope}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${a.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 4. System Architecture & Tech Stack -->
      <div class="section-title">4. System Architecture &amp; Tech Stack</div>
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Architecture Layer</th>
            <th style="width: 33%;">Technology Stack &amp; Framework</th>
            <th style="width: 45%;">Design Purpose &amp; Specifications</th>
          </tr>
        </thead>
        <tbody>
          ${(partA_FullStack.systemArchitecture || []).map((s) => `
            <tr>
              <td><strong>${s.layer}</strong></td>
              <td style="font-weight: 700; color: #1e3a8a;">${s.technology}</td>
              <td>${s.purpose}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 5. ERP & EMS Integration -->
      <div class="section-title">5. ERP &amp; EMS Deep Integration Matrix</div>
      <table>
        <thead>
          <tr>
            <th style="width: 24%;">Integration Capability</th>
            <th style="width: 32%;">Method / Communication Protocol</th>
            <th style="width: 14%;">Status</th>
            <th style="width: 30%;">Validation Evidence</th>
          </tr>
        </thead>
        <tbody>
          ${(partA_FullStack.integrations || []).map((i) => `
            <tr>
              <td><strong>${i.integration}</strong></td>
              <td><code>${i.method}</code></td>
              <td style="text-align: center;"><span class="pill pill-pass">${i.status}</span></td>
              <td style="font-size: 8px;">${i.validation}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Part A Digital Sign-Off -->
      <div class="signoff-container">
        <div class="sign-box ${partA_FullStack.engineerSignoff ? 'filled' : ''}">
          <div class="sign-title">Full Stack Engineer Submission Sign-Off (Part A Complete)</div>
          <div class="sign-name">${partA_FullStack.engineerSignoff?.name || project.assignedEngineerName || 'Lead Full Stack Engineer'}</div>
          <div class="sign-role">${partA_FullStack.engineerSignoff?.designation || 'Full Stack Engineer'} • Employee ID: ${partA_FullStack.engineerSignoff?.employeeId || project.assignedEngineerId || 'EMS-ENG-01'}</div>
          <div class="sign-signature">${partA_FullStack.engineerSignoff?.signature || 'Verified Digital Submission'}</div>
          <div class="sign-meta">Date: ${partA_FullStack.engineerSignoff?.date || new Date().toLocaleDateString()} • Status: Certified Codebase Delivered &amp; Integrated</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Part A: Full Stack Engineering</span>
      <span>4. ARCHITECTURE &amp; 5. ERP/EMS INTEGRATION</span>
      <span>Page 4 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 5: PART B — DEVOPS & PRODUCTION ENGINEERING (6, 7, 8)                -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>PART B: DEVOPS &amp; PRODUCTION ENGINEERING</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <div class="part-banner">
        <span>PART B — DEVOPS &amp; PRODUCTION ENGINEERING</span>
        <span class="role-tag">Designation: DevOps Engineer</span>
      </div>

      <!-- 6. DevOps Engineering Report -->
      <div class="section-title">6. DevOps Engineering Report</div>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">DevOps Component</th>
            <th style="width: 63%;">Implementation &amp; Architecture Details</th>
            <th style="width: 12%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(partB_DevOps.devopsReport || []).map((d) => `
            <tr>
              <td><strong>${d.component}</strong></td>
              <td>${d.implementation}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${d.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 7. Environment & Deployment Endpoints -->
      <div class="section-title">7. Environment &amp; Deployment Endpoints</div>
      <table>
        <thead>
          <tr>
            <th style="width: 20%;">Environment</th>
            <th style="width: 44%;">Host Endpoint / URL</th>
            <th style="width: 14%;">Health Status</th>
            <th style="width: 22%;">Deployment Date</th>
          </tr>
        </thead>
        <tbody>
          ${(partB_DevOps.environments || []).map((e) => `
            <tr>
              <td><strong>${e.environment}</strong></td>
              <td><code>${e.endpoint}</code></td>
              <td style="text-align: center;"><span class="pill pill-pass">${e.status}</span></td>
              <td style="font-size: 8px;">${e.deploymentDate}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 8. CI/CD Monitoring, Backup & Rollback -->
      <div class="section-title">8. CI/CD Monitoring, Backup &amp; Rollback</div>
      <table>
        <thead>
          <tr>
            <th style="width: 30%;">Operational Capability</th>
            <th style="width: 20%;">Status / SLA</th>
            <th style="width: 50%;">Evidence &amp; Verification Method</th>
          </tr>
        </thead>
        <tbody>
          ${(partB_DevOps.cicdChecklist || []).map((c) => `
            <tr>
              <td><strong>${c.item}</strong></td>
              <td style="font-weight: 700; color: #166534;">${c.status}</td>
              <td>${c.evidence}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Part B: DevOps Engineering</span>
      <span>6. DEVOPS REPORT &amp; 7. ENVIRONMENT ENDPOINTS</span>
      <span>Page 5 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 6: PART B CONT. (9 PRODUCTION HANDOVER & SIGN-OFF)                   -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>PART B: PRODUCTION HANDOVER</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <!-- 9. Production Handover Checklist -->
      <div class="section-title" style="margin-top: 0;">9. Production Handover Checklist</div>
      <p style="font-size: 8.5px; color: #334155; margin: 0 0 8px 0; line-height: 1.35;">
        All production handover criteria have been audited, validated, and approved by the DevOps Directorate prior to live traffic transition.
      </p>

      <table>
        <thead>
          <tr>
            <th style="width: 8%;">No.</th>
            <th style="width: 67%;">Production Handover Verification Item</th>
            <th style="width: 25%;">Handover Status</th>
          </tr>
        </thead>
        <tbody>
          ${(partB_DevOps.handoverItems || []).map((h, i) => `
            <tr>
              <td style="text-align: center; font-weight: 700;">${i + 1}</td>
              <td><strong>${h.item}</strong></td>
              <td style="text-align: center;"><span class="pill pill-verified">${h.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 15px; padding: 10px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; font-size: 8.5px; color: #166534; line-height: 1.4;">
        <strong>DEVOPS READINESS CERTIFICATE:</strong> All automated deployment pipelines, canary stages, health probes, zero-downtime blue/green switches, and database snapshot mechanisms are fully verified and configured for high availability across multi-zone infrastructure.
      </div>

      <!-- Part B Digital Sign-Off -->
      <div class="signoff-container">
        <div class="sign-box ${partB_DevOps.devopsSignoff ? 'filled' : ''}">
          <div class="sign-title">DevOps &amp; Production Engineering Sign-Off (Part B Complete)</div>
          <div class="sign-name">${partB_DevOps.devopsSignoff?.name || project.assignedDevOpsName || 'Lead DevOps Engineer'}</div>
          <div class="sign-role">${partB_DevOps.devopsSignoff?.designation || 'DevOps Engineer'} • Employee ID: ${partB_DevOps.devopsSignoff?.employeeId || project.assignedDevOpsId || 'EMS-OPS-01'}</div>
          <div class="sign-signature">${partB_DevOps.devopsSignoff?.signature || 'Verified Infrastructure Handover'}</div>
          <div class="sign-meta">Date: ${partB_DevOps.devopsSignoff?.date || new Date().toLocaleDateString()} • Status: Infrastructure Ready &amp; Certified</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Part B: DevOps Engineering</span>
      <span>9. PRODUCTION HANDOVER CHECKLIST</span>
      <span>Page 6 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 7: PART C — AI ENGINEERING (10, 11, 12, 13 TOP)                     -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>PART C: AI ENGINEERING &amp; AGENTS</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <div class="part-banner">
        <span>PART C — AI ENGINEERING</span>
        <span class="role-tag">Designation: AI Engineer</span>
      </div>

      <!-- 10. AI Engineering Report -->
      <div class="section-title">10. AI Engineering Report</div>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">AI Engineering Area</th>
            <th style="width: 63%;">Architecture &amp; Pipeline Description</th>
            <th style="width: 12%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(partC_AiEngineering.aiReport || []).map((a) => `
            <tr>
              <td><strong>${a.area}</strong></td>
              <td>${a.description}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${a.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 11. AI Architecture & Agent Details -->
      <div class="section-title">11. AI Architecture &amp; Autonomous Agents</div>
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Agent / AI Service</th>
            <th style="width: 32%;">Core Responsibility</th>
            <th style="width: 23%;">Inputs</th>
            <th style="width: 23%;">Outputs</th>
          </tr>
        </thead>
        <tbody>
          ${(partC_AiEngineering.aiAgents || []).map((ag) => `
            <tr>
              <td><strong>${ag.agentService}</strong></td>
              <td>${ag.responsibility}</td>
              <td><code>${ag.inputs}</code></td>
              <td><code>${ag.outputs}</code></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 12. n8n Automation Workflows -->
      <div class="section-title">12. n8n Enterprise Workflow Automation (8 Stages)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 18%;">Workflow Stage</th>
            <th style="width: 47%;">Automated Action &amp; Node Configuration</th>
            <th style="width: 35%;">Validation / Gate Check</th>
          </tr>
        </thead>
        <tbody>
          ${(partC_AiEngineering.n8nWorkflows || []).map((w) => `
            <tr>
              <td><strong>${w.stage}</strong></td>
              <td>${w.action}</td>
              <td style="font-size: 8px;">${w.validation}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 13. AI Testing & Evaluation (Top Metrics) -->
      <div class="section-title">13. AI Testing &amp; Benchmark Evaluation</div>
      <table>
        <thead>
          <tr>
            <th style="width: 35%;">Evaluation Benchmark Area</th>
            <th style="width: 22%;">Target Threshold</th>
            <th style="width: 25%;">Actual Measured</th>
            <th style="width: 18%;">Compliance</th>
          </tr>
        </thead>
        <tbody>
          ${(partC_AiEngineering.evaluations || []).map((e) => `
            <tr>
              <td><strong>${e.area}</strong></td>
              <td>${e.target}</td>
              <td style="font-weight: 700; color: #166534;">${e.actual}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${e.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Part C: AI Engineering</span>
      <span>10. AI ARCHITECTURE &amp; 12. N8N AUTOMATION</span>
      <span>Page 7 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 8: PART C CONT. (13 EVALUATION CONT. & SIGN-OFF)                     -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>PART C: AI EVALUATION &amp; GUARDRAILS</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <!-- 13. AI Testing & Evaluation Cont. -->
      <div class="section-title" style="margin-top: 0;">13. AI Testing &amp; Evaluation (Cont.)</div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px;">
        <div class="card">
          <div class="card-title" style="color: #2563eb;">1. Failure Handling &amp; Graceful Degradation</div>
          <p style="font-size: 8.5px; color: #334155; margin: 2px 0;">
            The AI engine implements deterministic fallback strategies, circuit-breaker patterns on downstream LLM endpoints, and local cached responses. When external API latency exceeds 5000ms, the system seamlessly routes through local embedding caches with zero user disruption.
          </p>
        </div>

        <div class="card">
          <div class="card-title" style="color: #2563eb;">2. Prevention of Unauthorized Code Generation &amp; Toxicity</div>
          <p style="font-size: 8.5px; color: #334155; margin: 2px 0;">
            Dual guardrails inspect all inbound prompts and outbound model outputs against strict safety taxonomies. Prompts attempting shell breakout, credential dumping, or arbitrary remote execution are automatically intercepted, logged, and rejected with HTTP 403 Forbidden.
          </p>
        </div>

        <div class="card">
          <div class="card-title" style="color: #2563eb;">3. Complete Audit &amp; Telemetry Logging</div>
          <p style="font-size: 8.5px; color: #334155; margin: 2px 0;">
            100% of LLM inference requests, prompt tokens, completion tokens, model latency timestamps, and safety classifier scores are indexed to central Elasticsearch logs with SHA-256 caller signatures for strict forensic auditing.
          </p>
        </div>
      </div>

      <div style="padding: 10px 14px; background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 6px; font-size: 8.5px; color: #6b21a8; line-height: 1.4;">
        <strong>AI SAFETY CERTIFICATION:</strong> All AI agents and n8n orchestration pipelines have been evaluated against OWASP Top 10 for Large Language Models (LLM-01 Prompt Injection, LLM-02 Insecure Output Handling, LLM-06 Sensitive Information Disclosure) and meet production readiness standards.
      </div>

      <!-- Part C Digital Sign-Off -->
      <div class="signoff-container">
        <div class="sign-box ${partC_AiEngineering.aiSignoff ? 'filled' : ''}">
          <div class="sign-title">AI Engineering Sign-Off (Part C Complete)</div>
          <div class="sign-name">${partC_AiEngineering.aiSignoff?.name || project.assignedAiEngineerName || 'Lead AI Engineer'}</div>
          <div class="sign-role">${partC_AiEngineering.aiSignoff?.designation || 'AI Engineer'} • Employee ID: ${partC_AiEngineering.aiSignoff?.employeeId || project.assignedAiEngineerId || 'EMS-AI-01'}</div>
          <div class="sign-signature">${partC_AiEngineering.aiSignoff?.signature || 'Verified AI Model Safety & Accuracy'}</div>
          <div class="sign-meta">Date: ${partC_AiEngineering.aiSignoff?.date || new Date().toLocaleDateString()} • Status: AI Models Certified &amp; Operational</div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Part C: AI Engineering</span>
      <span>13. AI BENCHMARKS &amp; SAFETY VERIFICATION</span>
      <span>Page 8 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 9: PART D — QUALITY ENGINEERING (14, 15, 16, 17)                     -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>PART D: QUALITY ASSURANCE &amp; TESTING</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <div class="part-banner">
        <span>PART D — QUALITY ENGINEERING</span>
        <span class="role-tag">Designation: Quality Engineer &amp; QA Lead</span>
      </div>

      <!-- 14. Quality Engineering Report -->
      <div class="section-title">14. Quality Engineering Report (7 Core Disciplines)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Testing Discipline</th>
            <th style="width: 15%; text-align: center;">Planned</th>
            <th style="width: 15%; text-align: center;">Executed</th>
            <th style="width: 15%; text-align: center;">Passed</th>
            <th style="width: 15%; text-align: center;">Failed</th>
            <th style="width: 15%; text-align: center;">Coverage</th>
          </tr>
        </thead>
        <tbody>
          ${(partD_Quality.testingAreas || []).map((t) => `
            <tr>
              <td><strong>${t.area}</strong></td>
              <td style="text-align: center;">${t.planned}</td>
              <td style="text-align: center;">${t.executed}</td>
              <td style="text-align: center; font-weight: 700; color: #166534;">${t.passed}</td>
              <td style="text-align: center; color: #991b1b;">${t.failed}</td>
              <td style="text-align: center; font-weight: 800; color: #2563eb;">${t.coverage}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 15. Test Strategy & Coverage by Module -->
      <div class="section-title">15. Test Strategy &amp; Execution by Module</div>
      <table>
        <thead>
          <tr>
            <th style="width: 28%;">System Module</th>
            <th style="width: 14%; text-align: center;">Test Cases</th>
            <th style="width: 14%; text-align: center;">Passed</th>
            <th style="width: 14%; text-align: center;">Failed</th>
            <th style="width: 14%; text-align: center;">Blocked</th>
            <th style="width: 16%; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(partD_Quality.moduleStrategy || []).map((m) => `
            <tr>
              <td><strong>${m.module}</strong></td>
              <td style="text-align: center;">${m.testCases}</td>
              <td style="text-align: center; font-weight: 700; color: #166534;">${m.passed}</td>
              <td style="text-align: center;">${m.failed}</td>
              <td style="text-align: center;">${m.blocked}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${m.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 16. Functional, Integration, Regression & UAT -->
      <div class="section-title">16. Test Types Execution Summary</div>
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Test Level</th>
            <th style="width: 48%;">Scope &amp; Objective</th>
            <th style="width: 30%;">Result &amp; Certification</th>
          </tr>
        </thead>
        <tbody>
          ${(partD_Quality.testTypes || []).map((tt) => `
            <tr>
              <td><strong>${tt.testType}</strong></td>
              <td>${tt.objective}</td>
              <td style="font-weight: 700; color: #166534;">${tt.result}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 17. Defect Management & Severity Breakdown -->
      <div class="section-title">17. Defect Severity &amp; Remediation Matrix</div>
      <table>
        <thead>
          <tr>
            <th style="width: 22%;">Severity Level</th>
            <th style="width: 15%; text-align: center;">Total Found</th>
            <th style="width: 15%; text-align: center;">Resolved</th>
            <th style="width: 16%; text-align: center;">Retested</th>
            <th style="width: 16%; text-align: center;">Closed</th>
            <th style="width: 16%; text-align: center;">Open Defects</th>
          </tr>
        </thead>
        <tbody>
          ${(partD_Quality.defectSeverity || []).map((ds) => `
            <tr>
              <td><strong>${ds.severity}</strong></td>
              <td style="text-align: center;">${ds.total}</td>
              <td style="text-align: center;">${ds.resolved}</td>
              <td style="text-align: center;">${ds.retested}</td>
              <td style="text-align: center; font-weight: 700; color: #166534;">${ds.closed}</td>
              <td style="text-align: center; font-weight: 800; color: ${ds.open === 0 ? '#166534' : '#991b1b'};">
                ${ds.open === 0 ? '<span class="pill pill-pass">0 OPEN</span>' : ds.open}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Part D: Quality Engineering</span>
      <span>14. COVERAGE &amp; 17. DEFECT SEVERITY MATRIX</span>
      <span>Page 9 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 10: PART D CONT. (RELEASE CRITERIA & QA DUAL SIGN-OFF)              -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>PART D: QUALITY RELEASE CERTIFICATION</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <div class="section-title" style="margin-top: 0;">Quality Release Criteria Checklist</div>
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">Quality Gate Criteria</th>
            <th style="width: 25%; text-align: center;">Required Threshold</th>
            <th style="width: 25%; text-align: center;">Actual Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Critical (P1) Open Defects</strong></td>
            <td style="text-align: center;">0</td>
            <td style="text-align: center;"><span class="pill pill-pass">0 (PASSED)</span></td>
          </tr>
          <tr>
            <td><strong>High Severity (P2) Open Defects</strong></td>
            <td style="text-align: center;">0</td>
            <td style="text-align: center;"><span class="pill pill-pass">0 (PASSED)</span></td>
          </tr>
          <tr>
            <td><strong>Automated Regression Suite Pass Rate</strong></td>
            <td style="text-align: center;">&gt;= 99%</td>
            <td style="text-align: center;"><span class="pill pill-pass">100% (PASSED)</span></td>
          </tr>
          <tr>
            <td><strong>User Acceptance Testing (UAT) Sign-Off</strong></td>
            <td style="text-align: center;">100% Formal Approval</td>
            <td style="text-align: center;"><span class="pill pill-pass">APPROVED</span></td>
          </tr>
          <tr>
            <td><strong>Production Smoke &amp; Sanity Test Suite</strong></td>
            <td style="text-align: center;">100% Passing</td>
            <td style="text-align: center;"><span class="pill pill-pass">100% PASSED</span></td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 15px; padding: 12px 14px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; font-size: 9px; color: #166534; line-height: 1.45;">
        <strong>QUALITY RELEASE DECLARATION:</strong><br />
        ${partD_Quality.releaseCriteria.statement || 'The Quality Engineering Department certifies that all functional, integration, performance, and regression test gates have been successfully satisfied. With zero open Critical or High severity defects and complete automated regression coverage, this release is certified production-ready.'}
      </div>

      <!-- Part D Dual Quality Sign-Off -->
      <div class="signoff-container">
        <div class="grid-2">
          <div class="sign-box ${partD_Quality.qaLeadSignoff ? 'filled' : ''}">
            <div class="sign-title">1. Quality Assurance Lead Sign-Off</div>
            <div class="sign-name">${partD_Quality.qaLeadSignoff?.name || project.assignedQualityEngineerName || 'Lead Quality Assurance Engineer'}</div>
            <div class="sign-role">${partD_Quality.qaLeadSignoff?.designation || 'QA Lead / Senior QA Engineer'} • Employee ID: ${partD_Quality.qaLeadSignoff?.employeeId || project.assignedQualityEngineerId || 'EMS-QA-01'}</div>
            <div class="sign-signature">${partD_Quality.qaLeadSignoff?.signature || 'Verified Quality Release Gates'}</div>
            <div class="sign-meta">Date: ${partD_Quality.qaLeadSignoff?.date || new Date().toLocaleDateString()} • Test Suite Execution Verified</div>
          </div>

          <div class="sign-box ${partD_Quality.qualityHeadSignoff?.approved ? 'filled' : ''}">
            <div class="sign-title">2. Quality Head Approval &amp; Certification</div>
            <div class="sign-name">${partD_Quality.qualityHeadSignoff?.name || project.qualityHeadName || 'Quality Head'}</div>
            <div class="sign-role">${partD_Quality.qualityHeadSignoff?.designation || 'Head of Quality Assurance'} • Employee ID: ${partD_Quality.qualityHeadSignoff?.employeeId || project.qualityHeadId || 'EMS-QH-01'}</div>
            <div class="sign-signature">${partD_Quality.qualityHeadSignoff?.signature || 'Approved for Production Delivery'}</div>
            <div class="sign-meta">Date: ${partD_Quality.qualityHeadSignoff?.date || new Date().toLocaleDateString()} • Directorate Quality Approval Granted</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Part D: Quality Engineering</span>
      <span>QUALITY RELEASE CRITERIA &amp; DUAL QA SIGN-OFF</span>
      <span>Page 10 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 11: PART E — BUG BOUNTY & SECURITY (18, 19, 20 & CYBER SIGN-OFF)     -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>PART E: BUG BOUNTY &amp; SECURITY ASSURANCE</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <div class="part-banner">
        <span>PART E — BUG BOUNTY &amp; SECURITY</span>
        <span class="role-tag">Designation: Bug Bounty Specialist &amp; Cyber Head</span>
      </div>

      <!-- 18. Security & Bug Bounty Validation -->
      <div class="section-title">18. Security Assessment &amp; Validation Disciplines</div>
      <table>
        <thead>
          <tr>
            <th style="width: 32%;">Security Assessment Area</th>
            <th style="width: 53%;">Validation Methodology &amp; Standard</th>
            <th style="width: 15%; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(partE_BugBounty.securityAreas || []).map((s) => `
            <tr>
              <td><strong>${s.area}</strong></td>
              <td>${s.validation}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${s.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 19. Vulnerability Summary -->
      <div class="section-title">19. Vulnerability Triage &amp; Risk Summary</div>
      <table>
        <thead>
          <tr>
            <th style="width: 20%;">Severity</th>
            <th style="width: 16%; text-align: center;">Identified</th>
            <th style="width: 16%; text-align: center;">Remediated</th>
            <th style="width: 16%; text-align: center;">Retested &amp; Verified</th>
            <th style="width: 16%; text-align: center;">Accepted Risk</th>
            <th style="width: 16%; text-align: center;">Open Vulnerabilities</th>
          </tr>
        </thead>
        <tbody>
          ${(partE_BugBounty.vulnerabilitySummary || []).map((v) => `
            <tr>
              <td><strong>${v.severity}</strong></td>
              <td style="text-align: center;">${v.identified}</td>
              <td style="text-align: center;">${v.fixed}</td>
              <td style="text-align: center; font-weight: 700; color: #166534;">${v.retested}</td>
              <td style="text-align: center;">${v.acceptedRisk}</td>
              <td style="text-align: center; font-weight: 800; color: ${v.open === 0 ? '#166534' : '#991b1b'};">
                ${v.open === 0 ? '<span class="pill pill-pass">0 OPEN</span>' : v.open}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 20. Remediation Tracking -->
      <div class="section-title">20. Remediation Tracking Matrix (SEC-001 to SEC-003)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 10%;">ID</th>
            <th style="width: 25%;">Vulnerability Finding</th>
            <th style="width: 10%;">Risk</th>
            <th style="width: 33%;">Remediation Action Taken</th>
            <th style="width: 12%;">Retest Date</th>
            <th style="width: 10%; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(partE_BugBounty.remediationFindings || []).map((r) => `
            <tr>
              <td><strong>${r.findingId}</strong></td>
              <td>${r.finding}</td>
              <td><span class="pill ${r.risk === 'High' ? 'pill-high' : 'pill-med'}">${r.risk}</span></td>
              <td>${r.remediation}</td>
              <td style="font-size: 8px;">${r.retestDate}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${r.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="margin-top: 8px; padding: 6px 10px; background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 4px; font-size: 8px; color: #831843;">
        <strong>SECURITY RELEASE STATUS:</strong> ${partE_BugBounty.securityReleaseStatus || 'Approved for Production. All identified vulnerabilities remediated, verified by ethical bug bounty team, and zero open critical or high risks remain.'}
      </div>

      <!-- Part E Dual Cyber Sign-Off -->
      <div class="signoff-container">
        <div class="grid-2">
          <div class="sign-box ${partE_BugBounty.securityLeadSignoff ? 'filled' : ''}">
            <div class="sign-title">1. Bug Bounty Specialist / Pentester Sign-Off</div>
            <div class="sign-name">${partE_BugBounty.securityLeadSignoff?.name || project.assignedBugBountyName || 'Lead Penetration Tester'}</div>
            <div class="sign-role">${partE_BugBounty.securityLeadSignoff?.designation || 'Bug Bounty Specialist'} • Employee ID: ${partE_BugBounty.securityLeadSignoff?.employeeId || project.assignedBugBountyId || 'EMS-SEC-01'}</div>
            <div class="sign-signature">${partE_BugBounty.securityLeadSignoff?.signature || 'Verified Vulnerability Remediation'}</div>
            <div class="sign-meta">Date: ${partE_BugBounty.securityLeadSignoff?.date || new Date().toLocaleDateString()} • Pentest &amp; Bug Bounty Verification Complete</div>
          </div>

          <div class="sign-box ${partE_BugBounty.cyberHeadSignoff?.approved ? 'filled' : ''}">
            <div class="sign-title">2. Cyber Head / CISO Certification</div>
            <div class="sign-name">${partE_BugBounty.cyberHeadSignoff?.name || project.cyberHeadName || 'Cyber Security Head'}</div>
            <div class="sign-role">${partE_BugBounty.cyberHeadSignoff?.designation || 'Chief Information Security Officer (CISO)'} • Employee ID: ${partE_BugBounty.cyberHeadSignoff?.employeeId || project.cyberHeadId || 'EMS-CH-01'}</div>
            <div class="sign-signature">${partE_BugBounty.cyberHeadSignoff?.signature || 'Certified Production Secure'}</div>
            <div class="sign-meta">Date: ${partE_BugBounty.cyberHeadSignoff?.date || new Date().toLocaleDateString()} • Directorate Security Clearance Approved</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Part E: Bug Bounty &amp; Security</span>
      <span>18. SECURITY VALIDATION &amp; DUAL CYBER SIGN-OFF</span>
      <span>Page 11 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 12: PART F — PERFORMANCE & CLOSURE (21, 22, 23, 24 TOP)              -->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>PART F: PERFORMANCE &amp; CLOSURE</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <div class="part-banner">
        <span>PART F — PERFORMANCE &amp; CLOSURE</span>
        <span class="role-tag">Designation: Manager &amp; Project Leadership</span>
      </div>

      <!-- 21. Performance & Reliability Metrics -->
      <div class="section-title">21. Performance &amp; Reliability Metrics</div>
      <table>
        <thead>
          <tr>
            <th style="width: 35%;">System Reliability Metric</th>
            <th style="width: 20%;">Target SLA</th>
            <th style="width: 25%;">Actual Measured</th>
            <th style="width: 20%; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(partF_Closure.performanceReliability || []).map((p) => `
            <tr>
              <td><strong>${p.metric}</strong></td>
              <td>${p.target}</td>
              <td style="font-weight: 700; color: #166534;">${p.actual}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${p.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 22. Final Project Metrics -->
      <div class="section-title">22. Final Project Metrics &amp; Delivery KPIs</div>
      <table>
        <thead>
          <tr>
            <th style="width: 35%;">Delivery Metric</th>
            <th style="width: 20%;">Target Goal</th>
            <th style="width: 25%;">Actual Delivered</th>
            <th style="width: 20%; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(partF_Closure.finalMetrics || []).map((fm) => `
            <tr>
              <td><strong>${fm.metric}</strong></td>
              <td>${fm.target}</td>
              <td style="font-weight: 700; color: #166534;">${fm.actual}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${fm.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 23. Lessons Learned -->
      <div class="section-title">23. Key Challenges &amp; Lessons Learned</div>
      <table>
        <thead>
          <tr>
            <th style="width: 24%;">Challenge</th>
            <th style="width: 24%;">Project Impact</th>
            <th style="width: 26%;">Technical Resolution</th>
            <th style="width: 26%;">Key Lesson Learned</th>
          </tr>
        </thead>
        <tbody>
          ${(partF_Closure.lessonsLearned || []).map((l) => `
            <tr>
              <td><strong>${l.challenge}</strong></td>
              <td>${l.impact}</td>
              <td>${l.resolution}</td>
              <td>${l.lessonLearned}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- 24. Final Acceptance (First 5 Roles) -->
      <div class="section-title">24. Final Acceptance &amp; Sign-Off (Roles 1 to 5)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 24%;">Stakeholder Role</th>
            <th style="width: 26%;">Stakeholder Name</th>
            <th style="width: 15%;">Date</th>
            <th style="width: 15%; text-align: center;">Status</th>
            <th style="width: 20%;">Digital Signature</th>
          </tr>
        </thead>
        <tbody>
          ${(partF_Closure.finalAcceptance || []).slice(0, 5).map((fa) => `
            <tr>
              <td><strong>${fa.role}</strong></td>
              <td>${fa.name}</td>
              <td style="font-size: 8px;">${fa.date}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${fa.status}</span></td>
              <td style="font-family: 'Brush Script MT', cursive; font-size: 11px; color: #1e3a8a;">${fa.signature}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Part F: Performance &amp; Closure</span>
      <span>21. PERFORMANCE METRICS &amp; 23. LESSONS LEARNED</span>
      <span>Page 12 of 13</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE 13: PART F CONT. (FINAL ACCEPTANCE, 5-TIER SIGNATURES & REVISION LOG)-->
  <!-- ========================================================================= -->
  <div class="doc-page">
    <div class="page-header">
      <span class="brand">PS SOFTONIC / I7</span>
      <span>PART F: PROJECT CLOSURE &amp; GOVERNANCE</span>
      <span class="project-ref">${project.projectCode}</span>
    </div>

    <div class="page-content">
      <!-- 24. Final Acceptance Cont. -->
      <div class="section-title" style="margin-top: 0;">24. Final Acceptance &amp; Sign-Off (Cont. Roles 6 &amp; 7)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 24%;">Stakeholder Role</th>
            <th style="width: 26%;">Stakeholder Name</th>
            <th style="width: 15%;">Date</th>
            <th style="width: 15%; text-align: center;">Status</th>
            <th style="width: 20%;">Digital Signature</th>
          </tr>
        </thead>
        <tbody>
          ${(partF_Closure.finalAcceptance || []).slice(5).map((fa) => `
            <tr>
              <td><strong>${fa.role}</strong></td>
              <td>${fa.name}</td>
              <td style="font-size: 8px;">${fa.date}</td>
              <td style="text-align: center;"><span class="pill pill-pass">${fa.status}</span></td>
              <td style="font-family: 'Brush Script MT', cursive; font-size: 11px; color: #1e3a8a;">${fa.signature}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Formal Project Closure Declaration -->
      <div class="section-title">Project Closure Declaration</div>
      <div style="padding: 8px 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 8.5px; line-height: 1.4; margin-bottom: 8px;">
        This document formally certifies that the <strong>${project.projectName}</strong> (${project.projectCode}) project has been completed in full compliance with all technical, functional, performance, quality, and security requirements. All deliverables, documentation, source code repositories, automated pipelines, and operational runbooks have been transferred to production support and accepted by the client.
        <br />
        <strong>Official Final Closure Date:</strong> ${partF_Closure.closureDeclaration.finalClosureDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>

      <!-- 5-Tier Formal Signatures Grid -->
      <div style="margin-bottom: 8px;">
        <div style="font-size: 8.5px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">
          Multi-Tier Executive Leadership Signatures
        </div>
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px;">
          <div class="card" style="text-align: center; padding: 4px;">
            <div class="card-title">1. Project Manager</div>
            <div style="font-family: 'Brush Script MT', cursive; font-size: 12px; color: #1e3a8a; margin: 2px 0;">${partF_Closure.closureDeclaration.projectManager || 'P. Manager'}</div>
            <div style="font-size: 7.5px; font-weight: 700;">${project.managerName || 'Project Manager'}</div>
          </div>
          <div class="card" style="text-align: center; padding: 4px;">
            <div class="card-title">2. Production Head</div>
            <div style="font-family: 'Brush Script MT', cursive; font-size: 12px; color: #1e3a8a; margin: 2px 0;">${partF_Closure.closureDeclaration.productionHead || 'Prod. Head'}</div>
            <div style="font-size: 7.5px; font-weight: 700;">${project.productionHeadName || 'Production Head'}</div>
          </div>
          <div class="card" style="text-align: center; padding: 4px;">
            <div class="card-title">3. Quality Head</div>
            <div style="font-family: 'Brush Script MT', cursive; font-size: 12px; color: #1e3a8a; margin: 2px 0;">${partF_Closure.closureDeclaration.qualityHead || 'Q. Head'}</div>
            <div style="font-size: 7.5px; font-weight: 700;">${project.qualityHeadName || 'Quality Head'}</div>
          </div>
          <div class="card" style="text-align: center; padding: 4px;">
            <div class="card-title">4. Cyber Lead / CISO</div>
            <div style="font-family: 'Brush Script MT', cursive; font-size: 12px; color: #1e3a8a; margin: 2px 0;">${partF_Closure.closureDeclaration.securityLead || 'Cyber CISO'}</div>
            <div style="font-size: 7.5px; font-weight: 700;">${project.cyberHeadName || 'Cyber Head'}</div>
          </div>
          <div class="card" style="text-align: center; padding: 4px; background: #eff6ff; border-color: #93c5fd;">
            <div class="card-title" style="color: #1d4ed8;">5. Directorate / CEO</div>
            <div style="font-family: 'Brush Script MT', cursive; font-size: 12px; color: #1e3a8a; margin: 2px 0;">${partF_Closure.closureDeclaration.clientApprover || 'Director General'}</div>
            <div style="font-size: 7.5px; font-weight: 800; color: #1e3a8a;">Executive Directorate</div>
          </div>
        </div>
      </div>

      <!-- Document Revision History -->
      <div class="section-title">Document Revision History</div>
      <table>
        <thead>
          <tr>
            <th style="width: 14%;">Revision</th>
            <th style="width: 18%;">Date</th>
            <th style="width: 44%;">Description of Change</th>
            <th style="width: 24%;">Author / Approver</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>V0.1</strong></td>
            <td>Sprint 1 Kickoff</td>
            <td>Initial Engineering Scope, Baseline Architecture &amp; CI/CD Skeleton</td>
            <td>Technical Team Leader</td>
          </tr>
          <tr>
            <td><strong>V0.9</strong></td>
            <td>Sprint 6 Freeze</td>
            <td>Pre-Release Quality Audit, OWASP Pentest Remediation &amp; AI Benchmarks</td>
            <td>QA Lead &amp; Cyber Head</td>
          </tr>
          <tr>
            <td><strong>V1.0</strong></td>
            <td>${docInfo.dateOfIssue || 'Final Handover'}</td>
            <td>Final Production Delivery, Acceptance Signatures &amp; CRM Sync</td>
            <td>Project Manager &amp; Directorate</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: 10px; text-align: center; padding: 6px; background: #0f172a; color: #ffffff; border-radius: 4px; font-size: 8px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
        PS SOFTONIC I7 ENTERPRISE INTEGRATION SUITE • OFFICIALLY CLOSED &amp; CERTIFIED
      </div>
    </div>

    <div class="page-footer">
      <span>PS SOFTONIC I7 • Part F: Project Closure &amp; Governance</span>
      <span>PROJECT CLOSURE DECLARATION &amp; REVISION LOG</span>
      <span>Page 13 of 13</span>
    </div>
  </div>

</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}
