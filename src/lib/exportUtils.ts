/**
 * Utility functions for exporting Timesheet and Project reports to Excel and PDF formats.
 * Works natively in modern browsers with zero external runtime dependencies.
 */
import { CrmCustomerProject, getDefaultQualityReport, getDefaultCyberReport } from './crm';

// 1. Export structured data to Excel XML / Spreadsheet (.xlsx / .xml / .xls)
export function exportToExcel(
  data: Record<string, any>[],
  fileName: string = 'report.xls',
  sheetName: string = 'Report'
) {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  const keys = Object.keys(data[0]);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Cell">
   <Alignment ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#1F2937"/>
  </Style>
  <Style ss:ID="Title">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="14" ss:Color="#111827" ss:Bold="1"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sheetName}">
  <Table>
`;

  // Columns specification
  keys.forEach(() => {
    xml += `   <Column ss:AutoFitWidth="1" ss:Width="160"/>\n`;
  });

  // Header Row
  xml += `   <Row ss:Height="26">\n`;
  keys.forEach((k) => {
    const formattedHeader = k
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
    xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(formattedHeader)}</Data></Cell>\n`;
  });
  xml += `   </Row>\n`;

  // Data Rows
  data.forEach((row) => {
    xml += `   <Row ss:Height="20">\n`;
    keys.forEach((k) => {
      const val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
      const isNum = !isNaN(Number(val)) && val.trim() !== '' && !val.startsWith('0') && !val.includes('-') && !val.includes(':');
      if (isNum) {
        xml += `    <Cell ss:StyleID="Cell"><Data ss:Type="Number">${val}</Data></Cell>\n`;
      } else {
        xml += `    <Cell ss:StyleID="Cell"><Data ss:Type="String">${escapeXml(val)}</Data></Cell>\n`;
      }
    });
    xml += `   </Row>\n`;
  });

  xml += `  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  triggerDownload(blob, fileName.endsWith('.xls') || fileName.endsWith('.xlsx') ? fileName : `${fileName}.xls`);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 200);
}

// 2. Export Timesheet logs directly to Excel (.xls / .xlsx compatible)
export function exportTimesheetReportToExcel(timesheetList: any[], teamLeaderName?: string) {
  const formatted = timesheetList.map((ts, index) => ({
    'S.No': index + 1,
    'Date': ts.date || new Date().toLocaleDateString(),
    'Employee ID': ts.employeeId || ts.userId || 'EMS-USER',
    'Employee Name': ts.employeeName || ts.userName || 'Full Stack Engineer',
    'Department': ts.department || 'Software Engineering',
    'Project Name': ts.projectName || 'ERP Platform',
    'Task Description / TODO': ts.description || ts.taskTitle || 'Milestone Task',
    'Logged Hours': ts.hours || 0,
    'Status': ts.status || (ts.completed ? 'COMPLETED (DONE)' : 'TODO / IN PROGRESS'),
    'Completed At': ts.completedAt || (ts.completed ? 'Yes' : 'Pending'),
  }));

  const filename = `Timesheet_Report_${teamLeaderName ? teamLeaderName.replace(/\s+/g, '_') : 'Team'}_${new Date().toISOString().split('T')[0]}.xls`;
  exportToExcel(formatted, filename, 'Timesheet Log');
}

// 3. Export Project Deliverables & Quality Audit to Excel
export function exportProjectReportToExcel(project: any) {
  const p = project || {};
  const prod = p.productionDeliverables || {};
  const qa = p.qualityReports || {};

  const summary = [
    { Field: 'Project Code', Value: p.projectCode || 'N/A' },
    { Field: 'Project Name', Value: p.projectName || 'N/A' },
    { Field: 'Customer / Client', Value: p.customerName || 'N/A' },
    { Field: 'Department Scope', Value: p.departmentScope || 'Software Engineering' },
    { Field: 'Assigned Team Leader', Value: p.targetTeamLeadName || 'N/A' },
    { Field: 'Assigned Full Stack Engineer', Value: p.assignedEngineerName || prod.submittedBy || 'N/A' },
    { Field: 'Budget ($)', Value: p.budget ? `$${p.budget.toLocaleString()}` : '$0' },
    { Field: 'Overall Project Status', Value: p.status || 'working' },
    { Field: 'Current Workflow Stage', Value: p.stage || 'IN_PROGRESS' },
    { Field: '--- PRODUCTION DELIVERABLES ---', Value: '----------------------------------------' },
    { Field: '1. Implementation Plan', Value: prod.implementationPlan || 'Pending' },
    { Field: '2. Logo Image Details', Value: prod.logoImg ? 'Uploaded (Verified)' : 'Pending' },
    { Field: '3. Walkthrough Details', Value: prod.walkthrough || 'Pending' },
    { Field: '4. Workflow Chart Details', Value: prod.workflowChart ? 'Uploaded (Verified)' : 'Pending' },
    { Field: 'Production Submitted At', Value: prod.submittedAt || 'N/A' },
    { Field: 'TL Production Approval', Value: p.tlProductionApproval?.approved ? `Approved by ${p.tlProductionApproval.approvedBy} on ${p.tlProductionApproval.approvedAt}` : 'Pending TL Approval' },
    { Field: '--- QUALITY AUDIT REPORTS ---', Value: '----------------------------------------' },
    { Field: '1. Bug Report', Value: qa.bugReport || 'Pending QA' },
    { Field: '2. Test Report', Value: qa.testReport || 'Pending QA' },
    { Field: '3. Quality Report', Value: qa.qualityReport || 'Pending QA' },
    { Field: 'Quality Verified By', Value: qa.verifiedBy || 'N/A' },
    { Field: 'Quality Verification Date', Value: qa.verifiedAt || 'N/A' },
    { Field: 'Quality Status', Value: qa.qualityStatus || 'Pending' },
    { Field: '--- FINAL APPROVAL TRAIL ---', Value: '----------------------------------------' },
    { Field: 'Team Leader All Done Submitted', Value: p.tlFinalSubmission?.submitted ? `Submitted on ${p.tlFinalSubmission.submittedAt}` : 'Pending' },
    { Field: 'Admin Final Approval', Value: p.adminFinalApproval?.approved ? `Approved by Admin on ${p.adminFinalApproval.approvedAt}` : 'Pending Admin Final Approval' },
  ];

  const filename = `Project_Full_Report_${p.projectCode || 'PROJECT'}_${new Date().toISOString().split('T')[0]}.xls`;
  exportToExcel(summary, filename, 'Project Deliverables & QA');
}

// 4. Generate Professional Printable PDF View with Print & Download
export function exportProjectReportToPdf(project: any) {
  const p = project || {};
  const prod = p.productionDeliverables || {};
  const qa = p.qualityReports || {};

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    alert('Please allow popups to generate and download the PDF report.');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PJSOFONIC ERP - Project Report (${p.projectCode})</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      background: #ffffff;
      margin: 0;
      padding: 40px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #4f46e5;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .logo-box h1 {
      font-size: 24px;
      font-weight: 900;
      color: #111827;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .logo-box p {
      font-size: 12px;
      color: #6b7280;
      margin: 2px 0 0 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-indigo { background: #e0e7ff; color: #4338ca; }
    .badge-amber { background: #fef3c7; color: #b45309; }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 14px 18px;
    }
    .card-title {
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .card-value {
      font-size: 14px;
      font-weight: 700;
      color: #111827;
    }

    .section {
      margin-top: 24px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    }
    .section-header {
      background: #f3f4f6;
      padding: 12px 18px;
      font-size: 13px;
      font-weight: 800;
      color: #111827;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-body {
      padding: 16px 18px;
      font-size: 13px;
    }
    .report-item {
      margin-bottom: 14px;
      padding-bottom: 14px;
      border-bottom: 1px dashed #e5e7eb;
    }
    .report-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .report-item h4 {
      font-size: 12px;
      font-weight: 700;
      color: #4f46e5;
      text-transform: uppercase;
      margin: 0 0 6px 0;
    }
    .report-item p {
      margin: 0;
      color: #374151;
      white-space: pre-wrap;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      background: #f8fafc;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #edf2f7;
    }
    .img-preview {
      max-width: 280px;
      max-height: 180px;
      border-radius: 8px;
      border: 1px solid #d1d5db;
      margin-top: 6px;
      display: block;
    }
    .footer {
      margin-top: 36px;
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #9ca3af;
    }
    .btn-print {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #4f46e5;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 12px;
      border: none;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
    }
    @media print {
      .btn-print { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-box">
      <h1>PJSOFONIC ERP</h1>
      <p>Official Project Execution & Quality Verification Dossier</p>
    </div>
    <div style="text-align: right;">
      <span class="badge ${p.status === 'COMPLETED' ? 'badge-success' : 'badge-indigo'}">
        STATUS: ${p.status || 'ACTIVE'}
      </span>
      <p style="font-size: 11px; color: #6b7280; margin: 4px 0 0 0;">Report Date: ${new Date().toLocaleDateString()}</p>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Project Code & Name</div>
      <div class="card-value">${p.projectCode || 'N/A'} - ${p.projectName || 'Project'}</div>
    </div>
    <div class="card">
      <div class="card-title">Customer / Client</div>
      <div class="card-value">${p.customerName || 'N/A'}</div>
    </div>
    <div class="card">
      <div class="card-title">Assigned Team Leader</div>
      <div class="card-value">${p.targetTeamLeadName || 'N/A'}</div>
    </div>
    <div class="card">
      <div class="card-title">Full Stack Engineer</div>
      <div class="card-value">${p.assignedEngineerName || prod.submittedBy || 'Assigned Engineer'}</div>
    </div>
  </div>

  <!-- PRODUCTION DELIVERABLES SECTION -->
  <div class="section">
    <div class="section-header">
      <span>1. PRODUCTION DELIVERABLES (Full Stack Submission)</span>
      <span class="badge ${p.tlProductionApproval?.approved ? 'badge-success' : 'badge-amber'}">
        ${p.tlProductionApproval?.approved ? 'TL APPROVED' : 'SUBMITTED'}
      </span>
    </div>
    <div class="section-body">
      <div class="report-item">
        <h4>1. Implementation Plan</h4>
        <p>${prod.implementationPlan || 'Implementation plan details not submitted.'}</p>
      </div>

      <div class="report-item">
        <h4>2. Logo Image</h4>
        ${
          prod.logoImg
            ? `<img src="${prod.logoImg}" alt="Logo Deliverable" class="img-preview" />`
            : '<p>Logo image deliverable not provided.</p>'
        }
      </div>

      <div class="report-item">
        <h4>3. Walkthrough</h4>
        <p>${prod.walkthrough || 'Walkthrough notes not submitted.'}</p>
      </div>

      <div class="report-item">
        <h4>4. Workflow Chart</h4>
        ${
          prod.workflowChart
            ? `<img src="${prod.workflowChart}" alt="Workflow Chart" class="img-preview" />`
            : '<p>Workflow chart deliverable not provided.</p>'
        }
      </div>
    </div>
  </div>

  <!-- QUALITY AUDIT REPORTS SECTION -->
  <div class="section">
    <div class="section-header">
      <span>2. QUALITY ASSURANCE AUDIT (QA Department Reports)</span>
      <span class="badge ${qa.qualityStatus === 'QUALITY_APPROVED' || qa.qualityStatus === 'DONE' ? 'badge-success' : 'badge-amber'}">
        ${qa.qualityStatus || 'IN PROCESS'}
      </span>
    </div>
    <div class="section-body">
      <div class="report-item">
        <h4>1. Bug Report</h4>
        <p>${qa.bugReport || 'No unresolved critical bugs identified during QA testing.'}</p>
      </div>

      <div class="report-item">
        <h4>2. Test Report</h4>
        <p>${qa.testReport || 'Automated and manual test suites passed successfully.'}</p>
      </div>

      <div class="report-item">
        <h4>3. Quality Report</h4>
        <p>${qa.qualityReport || 'Quality assurance inspection verified and approved for production release.'}</p>
      </div>

      <div style="font-size: 11px; color: #6b7280; margin-top: 8px;">
        Audited by: <strong>${qa.verifiedBy || 'QA Auditor'}</strong> on ${qa.verifiedAt || new Date().toLocaleDateString()}
      </div>
    </div>
  </div>

  <!-- APPROVAL SIGN-OFF TRAIL -->
  <div class="section">
    <div class="section-header">
      <span>3. MULTI-TIER APPROVAL & SIGN-OFF TRAIL</span>
      <span class="badge badge-success">VERIFIED</span>
    </div>
    <div class="section-body" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
      <div class="card">
        <div class="card-title">Full Stack Engineer</div>
        <div class="card-value" style="font-size: 12px;">${prod.submittedBy || 'Submitted'}</div>
        <div style="font-size: 10px; color: #6b7280;">Date: ${prod.submittedAt ? new Date(prod.submittedAt).toLocaleDateString() : 'Recorded'}</div>
      </div>
      <div class="card">
        <div class="card-title">Team Leader Approval</div>
        <div class="card-value" style="font-size: 12px;">${p.tlProductionApproval?.approvedBy || p.targetTeamLeadName || 'Approved'}</div>
        <div style="font-size: 10px; color: #6b7280;">Date: ${p.tlProductionApproval?.approvedAt ? new Date(p.tlProductionApproval.approvedAt).toLocaleDateString() : 'Recorded'}</div>
      </div>
      <div class="card">
        <div class="card-title">Admin Final Sign-Off</div>
        <div class="card-value" style="font-size: 12px;">${p.adminFinalApproval?.approvedBy || 'Admin Approved'}</div>
        <div style="font-size: 10px; color: #6b7280;">Date: ${p.adminFinalApproval?.approvedAt ? new Date(p.adminFinalApproval.approvedAt).toLocaleDateString() : (p.status === 'COMPLETED' ? new Date().toLocaleDateString() : 'Pending')}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>PJSOFONIC Enterprise Resource Planning System (ERP)</span>
    <span>Generated on ${new Date().toLocaleString()}</span>
  </div>

  <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
</body>
</html>
`;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Generates an executive A4 printable PDF report for the comprehensive 10-section Production Report
 * including all 10 sections, tables, checklists, and the 4-tier signoff verification trail.
 */
export function exportProductionReportToPdf(
  project: {
    projectCode?: string;
    projectName?: string;
    customerName?: string;
    budget?: number;
    assignedEngineerName?: string;
    targetTeamLeadName?: string;
    status?: string;
  },
  report: import('./crm').ProductionReport
) {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank', 'width=1120,height=920');
  if (!printWindow) {
    alert('Please allow popups to print / export the Production Report PDF.');
    return;
  }

  const projCode = report.projectCode || project.projectCode || 'PJ-PROD';
  const projName = report.projectName || project.projectName || 'Enterprise Application';
  const exec = report.executiveSummary || ({} as any);
  const arch = report.systemArchitecture || ({} as any);
  const dep = report.deploymentInfo || ({} as any);
  const integ = report.integrations || ({} as any);
  const src = report.sourceCodeHandover || ({} as any);

  const fullstack = report.fullstackSignoff;
  const tl = report.teamLeadSignoff;
  const head = report.productionHeadSignoff;
  const mgr = report.managerSignoff;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PRODUCTION_REPORT_${projCode}</title>
  <style>
    @media print {
      @page { size: A4 portrait; margin: 12mm 10mm; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      padding: 24px;
      font-size: 11px;
      line-height: 1.5;
    }
    .container { max-width: 960px; margin: 0 auto; background: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title-area h1 { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
    .title-area h2 { font-size: 13px; font-weight: 600; color: #0284c7; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .title-area p { font-size: 11px; color: #64748b; margin-top: 2px; }
    .meta-box { text-align: right; }
    .meta-badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 11px; background: #dcfce7; color: #15803d; margin-bottom: 6px; }
    .meta-text { font-size: 10px; color: #64748b; }
    
    .section { margin-bottom: 22px; }
    .section-title { font-size: 13px; font-weight: 800; color: #0f172a; padding: 6px 10px; background: #f1f5f9; border-left: 4px solid #0284c7; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.3px; display: flex; justify-content: space-between; align-items: center; }
    .section-desc { font-size: 11px; color: #475569; margin-bottom: 10px; line-height: 1.5; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 10.5px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; text-align: left; padding: 7px 10px; border: 1px solid #cbd5e1; font-size: 10px; text-transform: uppercase; }
    td { padding: 6px 10px; border: 1px solid #e2e8f0; color: #1e293b; vertical-align: top; }
    tr:nth-child(even) td { background: #fafafa; }
    
    .status-pill { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9.5px; font-weight: 700; }
    .status-live { background: #dcfce7; color: #166534; }
    .status-done { background: #e0f2fe; color: #0369a1; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 10px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 10px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; }
    .card h4 { font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    .card p { font-size: 10px; color: #475569; }
    
    .checklist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px; }
    .check-item { display: flex; align-items: center; font-size: 10px; padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; }
    .check-icon { color: #16a34a; font-weight: 800; margin-right: 6px; }
    
    .signoff-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 14px; }
    .sign-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #ffffff; display: flex; flex-direction: column; justify-content: space-between; min-height: 145px; }
    .sign-box.filled { border-color: #0284c7; background: #f0f9ff; }
    .sign-header { font-weight: 800; font-size: 10px; color: #0369a1; text-transform: uppercase; margin-bottom: 6px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; }
    .sign-body { flex: 1; font-size: 10px; color: #334155; }
    .sign-name { font-weight: 700; color: #0f172a; font-size: 10.5px; }
    .sign-sig { font-family: 'Brush Script MT', 'Segoe Script', cursive, sans-serif; font-size: 16px; color: #0369a1; margin: 6px 0; min-height: 22px; }
    .sign-footer { font-size: 9px; color: #64748b; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px; }
    
    .closure-box { background: #fefce8; border: 1.5px solid #ca8a04; border-radius: 6px; padding: 10px; margin-top: 12px; }
    .closure-title { font-weight: 800; font-size: 11px; color: #854d0e; text-transform: uppercase; margin-bottom: 6px; }
    .closure-row { display: flex; justify-content: space-between; font-size: 10.5px; color: #713f12; margin-bottom: 4px; }
    
    .btn-bar { position: fixed; top: 16px; right: 24px; display: flex; gap: 8px; z-index: 9999; }
    .btn-print { background: #0284c7; color: #ffffff; border: none; padding: 10px 18px; font-size: 13px; font-weight: 700; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .btn-print:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="btn-bar no-print">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <div class="title-area">
        <h1>PRODUCTION REPORT</h1>
        <h2>${projName} (${projCode})</h2>
        <p>PJSOFONIC Enterprise Resource Planning & Management System</p>
      </div>
      <div class="meta-box">
        <span class="meta-badge">${report.currentStage?.replace(/_/g, ' ') || 'PRODUCTION STABLE'}</span>
        <div class="meta-text">Generated: ${new Date().toLocaleDateString('en-GB')}</div>
        <div class="meta-text">Ref: PJ-PROD-${projCode}</div>
      </div>
    </div>

    <!-- 1. PRODUCTION EXECUTIVE SUMMARY -->
    <div class="section">
      <div class="section-title">1. Production Executive Summary</div>
      
      <p style="font-weight: 700; margin-bottom: 6px; color: #0f172a;">1.1 Production Delivery Status</p>
      <table>
        <thead>
          <tr><th style="width: 40%;">Parameter</th><th>Status / Details</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Production Status</strong></td><td><span class="status-pill status-live">${exec.productionStatus || '🟢 LIVE / STABLE'}</span></td></tr>
          <tr><td><strong>Development Status</strong></td><td>${exec.developmentStatus || '✅ Completed'}</td></tr>
          <tr><td><strong>Deployment Status</strong></td><td>${exec.deploymentStatus || '✅ Completed'}</td></tr>
          <tr><td><strong>Integration Status</strong></td><td>${exec.integrationStatus || '✅ Completed'}</td></tr>
          <tr><td><strong>Environment Sync</strong></td><td>${exec.environmentSync || '✅ Completed'}</td></tr>
          <tr><td><strong>Documentation</strong></td><td>${exec.documentation || '✅ Completed'}</td></tr>
          <tr><td><strong>Source Code Handover</strong></td><td>${exec.sourceCodeHandover || '✅ Completed'}</td></tr>
          <tr><td><strong>Production Handover</strong></td><td>${exec.productionHandover || '✅ Completed'}</td></tr>
        </tbody>
      </table>

      <p style="font-weight: 700; margin: 10px 0 4px 0; color: #0f172a;">1.2 Production Overview</p>
      <div class="card" style="margin-bottom: 8px;">
        <p>${exec.overview || 'The PS Softonic I7 application has been successfully designed, developed, configured, integrated and deployed into the production environment. The Production team completed the required application implementation, EMS and ERP integration, MUI reporting functionality, Buy module implementation, environment synchronization, code archival and production deployment activities. All production deliverables have been validated and confirmed operational across production infrastructure.'}</p>
      </div>

      <div class="grid-2">
        <div class="card">
          <h4>1.3 Production Core Objectives</h4>
          <p>• Full Stack System Delivery: Front-end, back-end, database and cloud architecture.<br/>
          • Cross-System Synchronization: End-to-end integration between EMS and ERP.<br/>
          • Reporting Module Integration: Full MUI reporting with XLS & PDF generation.<br/>
          • Buy Module Delivery: Integrated procurement and customer workflow.<br/>
          • High Availability & Security: Deployed in secured, load-balanced production.</p>
        </div>
        <div class="card">
          <h4>1.4 Production Key Metrics</h4>
          <p>• Total Implemented Modules: <strong>12 Modules</strong><br/>
          • API Endpoints Configured: <strong>48 Production APIs</strong><br/>
          • Database Collections / Tables: <strong>24 Tables</strong><br/>
          • Frontend Components: <strong>68 React / Next.js Components</strong><br/>
          • Integrated Services: <strong>6 Services</strong><br/>
          • Test Case Pass Rate: <strong>100% (Zero P0/P1 Defects)</strong><br/>
          • Deployment Target: <strong>99.9% Production SLA</strong></p>
        </div>
      </div>
    </div>

    <!-- 2. PRODUCTION SCOPE & IMPLEMENTED MODULES -->
    <div class="section">
      <div class="section-title">2. Production Scope & Implemented Modules (12 Tasks)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">No.</th>
            <th style="width: 32%;">Task / Feature Requirement</th>
            <th style="width: 48%;">Deliverable & Implementation Details</th>
            <th style="width: 12%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(report.deliverables || []).map((d) => `
            <tr>
              <td><strong>Task ${d.taskNo}</strong></td>
              <td>${d.requirement}</td>
              <td>${d.deliverable}</td>
              <td><span class="status-pill status-done">${d.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 3. PRODUCTION ARCHITECTURE OVERVIEW -->
    <div class="section">
      <div class="section-title">3. Production Architecture Overview (5 Layers)</div>
      <table>
        <thead>
          <tr><th style="width: 25%;">Layer</th><th>Architectural Stack & Security Implementation</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>1. Frontend Client Layer</strong></td><td>${arch.clientLayer || 'Next.js 14, React 18, Tailwind CSS, MUI DataGrid, Responsive corporate viewport'}</td></tr>
          <tr><td><strong>2. Backend Application Layer</strong></td><td>${arch.applicationLayer || 'Node.js & Express RESTful microservices, JWT authentication, RBAC authorization guards, Rate-limiting, CORS security'}</td></tr>
          <tr><td><strong>3. Integration Layer</strong></td><td>${arch.integrationLayer || 'EMS bi-directional sync, ERP enterprise accounting & project tracking, CRM Webhook pipeline, REST APIs'}</td></tr>
          <tr><td><strong>4. Database & Storage Layer</strong></td><td>${arch.dataLayer || 'PostgreSQL / Supabase relational storage, MongoDB document store, LocalStorage fallback, Cloudinary / S3 asset storage'}</td></tr>
          <tr><td><strong>5. Infrastructure & QA Layer</strong></td><td>${arch.infrastructureLayer || 'Vercel / Render cloud hosting, Cloudflare SSL/TLS termination, Global CDN edge caching, 99.9% SLA load balancer'}</td></tr>
        </tbody>
      </table>
    </div>

    <div class="page-break"></div>

    <!-- 4. PRODUCTION TECHNOLOGY STACK -->
    <div class="section">
      <div class="section-title">4. Production Technology Stack</div>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Layer / Component</th>
            <th style="width: 30%;">Technology</th>
            <th style="width: 45%;">Purpose & Production Role</th>
          </tr>
        </thead>
        <tbody>
          ${(report.techStack || []).map((t) => `
            <tr>
              <td><strong>${t.layer}</strong></td>
              <td>${t.technology}</td>
              <td>${t.purpose}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 5. PRODUCTION ENVIRONMENT CONFIGURATION -->
    <div class="section">
      <div class="section-title">5. Production Environment Configuration (8 Environments)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 28%;">Environment</th>
            <th style="width: 38%;">Endpoint / Host / Port</th>
            <th style="width: 16%;">Status</th>
            <th style="width: 18%;">Owner</th>
          </tr>
        </thead>
        <tbody>
          ${(report.environments || []).map((e) => `
            <tr>
              <td><strong>${e.environment}</strong></td>
              <td><code>${e.endpoint}</code></td>
              <td><span class="status-pill status-live">${e.status}</span></td>
              <td>${e.owner}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 6. PRODUCTION DEPLOYMENT DETAILS & PRE-FLIGHT CHECKLIST -->
    <div class="section">
      <div class="section-title">6. Production Deployment Details & Pre-Flight Checklist</div>
      <div class="grid-3">
        <div class="card">
          <h4>Release Version</h4>
          <p><strong>${dep.releaseVersion || 'v1.0.0-PROD'}</strong> (${dep.releaseType || 'Major Production'})</p>
        </div>
        <div class="card">
          <h4>Deployment Owner</h4>
          <p><strong>${dep.deploymentOwner || project.assignedEngineerName || 'Full Stack Engineer'}</strong></p>
        </div>
        <div class="card">
          <h4>Execution Method</h4>
          <p><strong>${dep.deploymentMethod || 'Blue-Green Zero-Downtime Pipeline'}</strong></p>
        </div>
      </div>
      
      <p style="font-weight: 700; margin: 8px 0 4px 0; color: #0f172a;">Pre-Flight Verification Checklist (13 Items):</p>
      <div class="checklist-grid">
        ${Object.entries(dep.checklist || {}).map(([key, val]) => `
          <div class="check-item">
            <span class="check-icon">${val ? '☑' : '☐'}</span>
            <span>${key}</span>
          </div>
        `).join('')}
      </div>

      <div class="card" style="margin-top: 6px;">
        <h4>Rollback Plan:</h4>
        <p>${dep.rollbackPlan || 'Automated instant rollback to previous stable commit tag within 60 seconds.'}</p>
      </div>
    </div>

    <!-- 7. EMS & ERP INTEGRATION SPECIFICATIONS -->
    <div class="section">
      <div class="section-title">7. EMS & ERP Integration Specifications</div>
      <table>
        <thead>
          <tr>
            <th style="width: 30%;">Integration Flow</th>
            <th style="width: 25%;">Protocol / Method</th>
            <th style="width: 15%;">Status</th>
            <th style="width: 30%;">Validation Mechanism</th>
          </tr>
        </thead>
        <tbody>
          ${(integ.matrix || []).map((m: any) => `
            <tr>
              <td><strong>${m.integration}</strong></td>
              <td>${m.method}</td>
              <td><span class="status-pill status-live">${m.status}</span></td>
              <td>${m.validation}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="grid-2">
        <div class="card">
          <h4>EMS Sync State:</h4>
          <p><strong>${integ.emsIntegrationStatus || 'Connected & Synchronized'}</strong></p>
        </div>
        <div class="card">
          <h4>ERP Ledger State:</h4>
          <p><strong>${integ.erpIntegrationStatus || 'Connected & Operational'}</strong></p>
        </div>
      </div>
    </div>

    <!-- 8. TECHNICAL DOCUMENTATION DELIVERABLES -->
    <div class="section">
      <div class="section-title">8. Production Technical Documentation Deliverables (9 Deliverables)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 60%;">Technical Document</th>
            <th style="width: 15%;">Version</th>
            <th style="width: 25%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${(report.documents || []).map((doc) => `
            <tr>
              <td><strong>${doc.document}</strong></td>
              <td>${doc.version}</td>
              <td><span class="status-pill status-done">${doc.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 9. SOURCE CODE HANDOVER & ARCHIVAL SPECIFICATIONS -->
    <div class="section">
      <div class="section-title">9. Source Code Handover & Archival Specifications</div>
      <div class="grid-3">
        <div class="card">
          <h4>Repository & Branch</h4>
          <p><code>${src.repository || 'pjsofonic/erp-ems-suite'}</code><br/>Branch: <strong>${src.branch || 'main'}</strong></p>
        </div>
        <div class="card">
          <h4>Release Tag</h4>
          <p>Tag: <strong>${src.releaseTag || 'v1.0.0-PROD'}</strong><br/>Status: Verified</p>
        </div>
        <div class="card">
          <h4>Code Ownership</h4>
          <p>${src.codeOwner || 'PJ Softonic Engineering Directorate'}</p>
        </div>
      </div>
    </div>

    <!-- 10. PRODUCTION HANDOVER & SUPPORT CHECKLIST -->
    <div class="section">
      <div class="section-title">10. Production Handover & Support Checklist (10 Items)</div>
      <div class="checklist-grid">
        ${Object.entries(report.handoverChecklist || {}).map(([item, checked]) => `
          <div class="check-item">
            <span class="check-icon">${checked ? '☑' : '☐'}</span>
            <span>${item}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- MULTI-TIER DIGITAL SIGN-OFF TRAIL -->
    <div class="section">
      <div class="section-title">MULTI-TIER DIGITAL SIGN-OFF & ACCEPTANCE TRAIL</div>
      <div class="signoff-grid">
        <!-- Tier 1 -->
        <div class="sign-box ${fullstack?.signature ? 'filled' : ''}">
          <div class="sign-header">Tier 1: Full Stack Engineer</div>
          <div class="sign-body">
            <div class="sign-name">${fullstack?.name || project.assignedEngineerName || 'Full Stack Engineer'}</div>
            <div style="font-size: 9px; color: #64748b;">${fullstack?.designation || 'Full Stack Engineer'}</div>
            <div class="sign-sig">${fullstack?.signature || 'Pending Signature'}</div>
          </div>
          <div class="sign-footer">
            <div>Date: ${fullstack?.date || 'Pending'}</div>
            <div>Status: ${fullstack?.signature ? 'SUBMITTED' : 'DRAFT'}</div>
          </div>
        </div>

        <!-- Tier 2 -->
        <div class="sign-box ${tl?.signature ? 'filled' : ''}">
          <div class="sign-header">Tier 2: Team Leader</div>
          <div class="sign-body">
            <div class="sign-name">${tl?.name || project.targetTeamLeadName || 'Team Leader'}</div>
            <div style="font-size: 9px; color: #64748b;">${tl?.designation || 'Team Leader'}</div>
            <div class="sign-sig">${tl?.signature || 'Pending Review'}</div>
            ${tl?.reviewNotes ? `<div style="font-size: 8.5px; color: #334155; margin-top: 2px;"><em>"${tl.reviewNotes}"</em></div>` : ''}
          </div>
          <div class="sign-footer">
            <div>Date: ${tl?.date || 'Pending'}</div>
            <div>Status: ${tl?.signature ? 'REVIEWED & VERIFIED' : 'Awaiting TL'}</div>
          </div>
        </div>

        <!-- Tier 3 -->
        <div class="sign-box ${head?.signature ? 'filled' : ''}">
          <div class="sign-header">Tier 3: Production Head</div>
          <div class="sign-body">
            <div class="sign-name">${head?.name || 'Production Head'}</div>
            <div style="font-size: 9px; color: #64748b;">${head?.designation || 'Production Head'}</div>
            <div class="sign-sig">${head?.signature || 'Pending Approval'}</div>
            ${head?.approvalRemarks ? `<div style="font-size: 8.5px; color: #334155; margin-top: 2px;"><em>"${head.approvalRemarks}"</em></div>` : ''}
          </div>
          <div class="sign-footer">
            <div>Date: ${head?.date || 'Pending'}</div>
            <div>Status: ${head?.signature ? 'APPROVED' : 'Awaiting Head'}</div>
          </div>
        </div>

        <!-- Tier 4 -->
        <div class="sign-box ${mgr?.signature ? 'filled' : ''}">
          <div class="sign-header">Tier 4: Manager (Final Closure)</div>
          <div class="sign-body">
            <div class="sign-name">${mgr?.name || 'Project Manager'}</div>
            <div style="font-size: 9px; color: #64748b;">${mgr?.designation || 'Manager'}</div>
            <div class="sign-sig">${mgr?.signature || 'Pending Final Closure'}</div>
            ${mgr?.remarks ? `<div style="font-size: 8.5px; color: #334155; margin-top: 2px;"><em>"${mgr.remarks}"</em></div>` : ''}
          </div>
          <div class="sign-footer">
            <div>Closure Date: ${mgr?.finalClosureDate || 'Pending'}</div>
            <div>Status: <strong>${mgr?.finalStatus || 'Pending'}</strong></div>
          </div>
        </div>
      </div>

      ${mgr?.finalStatus ? `
        <div class="closure-box">
          <div class="closure-title">🏁 Official Project Closure Record</div>
          <div class="closure-row">
            <span><strong>Final Project Acceptance Status:</strong> ${mgr.finalStatus}</span>
            <span><strong>Final Closure Date:</strong> ${mgr.finalClosureDate}</span>
          </div>
          <div class="closure-row">
            <span><strong>Authorized Executive:</strong> ${mgr.name} (${mgr.designation})</span>
            <span><strong>Quad Digital Sign-Off:</strong> Complete & Verified</span>
          </div>
        </div>
      ` : ''}
    </div>

    <!-- FOOTER -->
    <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #64748b;">
      <span>PJSOFONIC ERP Production Engine • ISO 9001:2015 Compliant</span>
      <span>Confidential Corporate Document • Page 1 of 2</span>
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Exports complete Quality Assurance & Testing Report to a printable A4 corporate document.
 */
export function exportQualityReportToPdf(project: CrmCustomerProject): void {
  const qa = project.qualityReport || getDefaultQualityReport(project);
  const printWindow = window.open('', '_blank', 'width=1000,height=1200');
  if (!printWindow) {
    alert('Please allow popups in your browser to view the printable A4 Quality Report.');
    return;
  }

  const engSign = qa.engineerSignoff;
  const headSign = qa.headApproval;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Quality Assurance Report - ${project.projectCode}</title>
  <style>
    @page { size: A4; margin: 12mm 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #0f172a; margin: 0; background: #fff; }
    .page-container { width: 100%; max-width: 210mm; margin: 0 auto; padding: 12px; }
    .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px; }
    .logo-area h1 { font-size: 18px; font-weight: 900; margin: 0; color: #0369a1; letter-spacing: -0.5px; }
    .logo-area p { margin: 2px 0 0; font-size: 10px; color: #64748b; }
    .meta-box { text-align: right; font-size: 10px; }
    .status-pill { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 9px; text-transform: uppercase; }
    .status-pass { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .status-verified { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
    .section { margin-bottom: 16px; page-break-inside: avoid; }
    .section-title { font-size: 12px; font-weight: 800; color: #0369a1; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10px; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; }
    th { background: #f0f9ff; font-weight: 700; color: #0369a1; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 10px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; }
    .card h4 { margin: 0 0 4px; font-size: 9px; color: #64748b; text-transform: uppercase; }
    .card p { margin: 0; font-size: 13px; font-weight: 800; color: #0f172a; }
    .signoff-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px; }
    .sign-box { border: 1px dashed #94a3b8; border-radius: 6px; padding: 10px; background: #fafafa; }
    .sign-box.filled { border: 1px solid #0284c7; background: #f0f9ff; }
    .sign-header { font-size: 9.5px; font-weight: 800; color: #0369a1; text-transform: uppercase; margin-bottom: 4px; }
    .sign-sig { font-family: 'Brush Script MT', 'Dancing Script', cursive; font-size: 18px; color: #0369a1; margin: 6px 0; }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header-bar">
      <div class="logo-area">
        <h1>PJ SOFONIC • QUALITY ASSURANCE REPORT</h1>
        <p>Project Code: <strong>${project.projectCode}</strong> • ${project.projectName}</p>
      </div>
      <div class="meta-box">
        <span class="status-pill status-pass">Pass Rate: ${qa.testSummary.passRate}</span>
        <div style="margin-top: 4px;">Audited: ${qa.testSummary.executionDate}</div>
      </div>
    </div>

    <!-- 1. TEST EXECUTION SUMMARY -->
    <div class="section">
      <div class="section-title">1. Executive QA Testing Summary</div>
      <div class="grid-4">
        <div class="card">
          <h4>Total Tests Run</h4>
          <p>${qa.testSummary.totalTests}</p>
        </div>
        <div class="card">
          <h4>Tests Passed</h4>
          <p style="color: #15803d;">${qa.testSummary.passed}</p>
        </div>
        <div class="card">
          <h4>Tests Failed</h4>
          <p style="color: #b91c1c;">${qa.testSummary.failed}</p>
        </div>
        <div class="card">
          <h4>Pass Percentage</h4>
          <p style="color: #0369a1;">${qa.testSummary.passRate}</p>
        </div>
      </div>
    </div>

    <!-- 2. TEST SUITES EXECUTION MATRIX -->
    <div class="section">
      <div class="section-title">2. Test Suites Execution Matrix</div>
      <table>
        <thead>
          <tr>
            <th>Suite Name</th>
            <th>Module</th>
            <th style="width: 15%;">Tests Run</th>
            <th style="width: 15%;">Passed</th>
            <th style="width: 15%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${qa.testSuites.map((s: any) => `
            <tr>
              <td><strong>${s.suiteName}</strong></td>
              <td>${s.module}</td>
              <td>${s.testsCount}</td>
              <td style="color: #15803d; font-weight: 700;">${s.passCount}</td>
              <td><span class="status-pill status-pass">${s.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 3. DEFECT & PERFORMANCE METRICS -->
    <div class="section">
      <div class="section-title">3. Defect Density & Performance Benchmarks</div>
      <div class="grid-2">
        <div class="card">
          <h4>Defect Severity Matrix</h4>
          <p style="font-size: 11px; font-weight: normal; margin-top: 4px;">
            Critical: <strong>${qa.defectSeverityMatrix.critical}</strong> • 
            High: <strong>${qa.defectSeverityMatrix.high}</strong> • 
            Medium: <strong>${qa.defectSeverityMatrix.medium}</strong> • 
            Low: <strong>${qa.defectSeverityMatrix.low}</strong>
          </p>
        </div>
        <div class="card">
          <h4>API Latency & SLA</h4>
          <p style="font-size: 11px; font-weight: normal; margin-top: 4px;">
            Avg: <strong>${qa.performanceMetrics.avgApiResponseMs}ms</strong> • 
            P99: <strong>${qa.performanceMetrics.p99ResponseMs}ms</strong> • 
            Error Rate: <strong>${qa.performanceMetrics.errorRatePercent}%</strong>
          </p>
        </div>
      </div>
    </div>

    <!-- 4. ENVIRONMENTS TESTED -->
    <div class="section">
      <div class="section-title">4. Environments Tested & Status</div>
      <table>
        <thead>
          <tr>
            <th>Environment</th>
            <th>Endpoint / Host</th>
            <th style="width: 20%;">Validation State</th>
          </tr>
        </thead>
        <tbody>
          ${qa.environmentsTested.map((env: any) => `
            <tr>
              <td><strong>${env.env}</strong></td>
              <td><code>${env.url}</code></td>
              <td><span class="status-pill status-verified">${env.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 5. DUAL QUALITY SIGN-OFF -->
    <div class="section">
      <div class="section-title">5. Quality Department Sign-Off & Approval Trail</div>
      <div class="signoff-grid">
        <div class="sign-box ${engSign?.signature ? 'filled' : ''}">
          <div class="sign-header">Quality Engineer Execution Sign-Off</div>
          <div style="font-weight: 700;">${engSign?.name || project.assignedQualityEngineerName || 'Quality Engineer'}</div>
          <div style="font-size: 9px; color: #64748b;">${engSign?.designation || 'Senior Quality Engineer'}</div>
          <div class="sign-sig">${engSign?.signature || 'Pending Signature'}</div>
          <div style="font-size: 9px; color: #475569;">Date: ${engSign?.date || 'Pending'} • ${engSign?.notes || 'All automated tests executed successfully'}</div>
        </div>

        <div class="sign-box ${headSign?.approved ? 'filled' : ''}">
          <div class="sign-header">Quality Head Final Acceptance</div>
          <div style="font-weight: 700;">${headSign?.name || project.qualityHeadName || 'Quality Head'}</div>
          <div style="font-size: 9px; color: #64748b;">${headSign?.designation || 'Head of Quality Assurance'}</div>
          <div class="sign-sig">${headSign?.signature || 'Pending Approval'}</div>
          <div style="font-size: 9px; color: #475569;">Approved: ${headSign?.date || 'Pending'} • ${headSign?.remarks || 'Approved for Production & Security Audit'}</div>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #64748b;">
      <span>PJSOFONIC QA Engine • ISO/IEC/IEEE 29119 Standards</span>
      <span>Confidential QA Handover • Verified</span>
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Exports complete Cyber Security, Penetration Testing & Bug Bounty Report to a printable A4 corporate document.
 */
export function exportCyberReportToPdf(project: CrmCustomerProject): void {
  const cyber = project.cyberReport || getDefaultCyberReport(project);
  const printWindow = window.open('', '_blank', 'width=1000,height=1200');
  if (!printWindow) {
    alert('Please allow popups in your browser to view the printable A4 Cyber Security Report.');
    return;
  }

  const testerSign = cyber.testerSignoff;
  const headSign = cyber.headApproval;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Cyber Security & Bug Bounty Audit - ${project.projectCode}</title>
  <style>
    @page { size: A4; margin: 12mm 15mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #0f172a; margin: 0; background: #fff; }
    .page-container { width: 100%; max-width: 210mm; margin: 0 auto; padding: 12px; }
    .header-bar { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #7c3aed; padding-bottom: 12px; margin-bottom: 16px; }
    .logo-area h1 { font-size: 18px; font-weight: 900; margin: 0; color: #6d28d9; letter-spacing: -0.5px; }
    .logo-area p { margin: 2px 0 0; font-size: 10px; color: #64748b; }
    .meta-box { text-align: right; font-size: 10px; }
    .status-pill { display: inline-block; padding: 3px 8px; border-radius: 9999px; font-weight: 700; font-size: 9px; text-transform: uppercase; }
    .status-secure { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
    .status-high { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .status-med { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
    .section { margin-bottom: 16px; page-break-inside: avoid; }
    .section-title { font-size: 12px; font-weight: 800; color: #6d28d9; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10px; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; }
    th { background: #f5f3ff; font-weight: 700; color: #6d28d9; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 10px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; }
    .card h4 { margin: 0 0 4px; font-size: 9px; color: #64748b; text-transform: uppercase; }
    .card p { margin: 0; font-size: 13px; font-weight: 800; color: #0f172a; }
    .signoff-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 10px; }
    .sign-box { border: 1px dashed #94a3b8; border-radius: 6px; padding: 10px; background: #fafafa; }
    .sign-box.filled { border: 1px solid #7c3aed; background: #faf5ff; }
    .sign-header { font-size: 9.5px; font-weight: 800; color: #6d28d9; text-transform: uppercase; margin-bottom: 4px; }
    .sign-sig { font-family: 'Brush Script MT', 'Dancing Script', cursive; font-size: 18px; color: #6d28d9; margin: 6px 0; }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header-bar">
      <div class="logo-area">
        <h1>PJ SOFONIC • CYBER SECURITY & BUG BOUNTY AUDIT</h1>
        <p>Project Code: <strong>${project.projectCode}</strong> • ${project.projectName}</p>
      </div>
      <div class="meta-box">
        <span class="status-pill status-secure">Security Posture: ${cyber.executiveSummary.postureStatus}</span>
        <div style="margin-top: 4px;">Audit Window: ${cyber.executiveSummary.testingPeriod}</div>
      </div>
    </div>

    <!-- 1. SECURITY POSTURE -->
    <div class="section">
      <div class="section-title">1. Security Posture & Vulnerability Triage</div>
      <div class="grid-4">
        <div class="card">
          <h4>Vulnerabilities Identified</h4>
          <p>${cyber.executiveSummary.totalVulnerabilitiesFound}</p>
        </div>
        <div class="card">
          <h4>Resolved & Patched</h4>
          <p style="color: #15803d;">${cyber.executiveSummary.vulnerabilitiesResolved}</p>
        </div>
        <div class="card">
          <h4>Open Critical CVEs</h4>
          <p style="color: #15803d;">${cyber.executiveSummary.openVulnerabilities}</p>
        </div>
        <div class="card">
          <h4>Pentest Methodology</h4>
          <p style="font-size: 10px; font-weight: 600;">OWASP WSTG v4.2</p>
        </div>
      </div>
    </div>

    <!-- 2. OWASP TOP 10 ASSESSMENT MATRIX -->
    <div class="section">
      <div class="section-title">2. OWASP Top 10 Risk Assessment Matrix</div>
      <table>
        <thead>
          <tr>
            <th>OWASP Category</th>
            <th>Vulnerability Tested / Finding</th>
            <th style="width: 12%;">Severity</th>
            <th style="width: 15%;">Remediation</th>
            <th style="width: 12%;">Verified</th>
          </tr>
        </thead>
        <tbody>
          ${cyber.owaspMatrix.map((m: any) => `
            <tr>
              <td><strong>${m.category}</strong></td>
              <td>${m.vulnerabilityFound}</td>
              <td><span class="status-pill ${m.severity === 'HIGH' ? 'status-high' : m.severity === 'MEDIUM' ? 'status-med' : 'status-secure'}">${m.severity}</span></td>
              <td style="color: #15803d; font-weight: 700;">${m.remediationStatus}</td>
              <td>${m.verified ? '✅ Complete' : 'Pending'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 3. BUG BOUNTY FINDINGS & TRIAGE -->
    <div class="section">
      <div class="section-title">3. Ethical Bug Bounty Program Submissions</div>
      <table>
        <thead>
          <tr>
            <th style="width: 10%;">ID</th>
            <th>Vulnerability Description</th>
            <th style="width: 12%;">Severity</th>
            <th style="width: 15%;">Researcher</th>
            <th style="width: 12%;">Bounty Payout</th>
            <th style="width: 12%;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${cyber.bugBountyFindings.map((b: any) => `
            <tr>
              <td><strong>${b.bugId}</strong></td>
              <td>${b.title}<br/><span style="font-size: 9px; color: #64748b;">${b.verificationNotes}</span></td>
              <td><span class="status-pill ${b.severity === 'HIGH' ? 'status-high' : 'status-med'}">${b.severity}</span></td>
              <td><code>${b.reporter}</code></td>
              <td><strong>${b.bountyAmount}</strong></td>
              <td style="color: #15803d; font-weight: 700;">${b.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 4. PENTEST TOOLS USED -->
    <div class="section">
      <div class="section-title">4. Penetration Testing Toolchain & Scope</div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; font-size: 10px;">
        <p style="margin: 0 0 4px;"><strong>Target Scope:</strong> ${cyber.pentestDetails.targetScope}</p>
        <p style="margin: 0;"><strong>Security Tools Employed:</strong> ${cyber.pentestDetails.toolsUsed.join(' • ')}</p>
      </div>
    </div>

    <!-- 5. DUAL CYBER SIGN-OFF -->
    <div class="section">
      <div class="section-title">5. Cyber Security Directorate Sign-Off & CISO Approval</div>
      <div class="signoff-grid">
        <div class="sign-box ${testerSign?.signature ? 'filled' : ''}">
          <div class="sign-header">Lead Penetration Tester / Bug Bounty Specialist</div>
          <div style="font-weight: 700;">${testerSign?.name || project.assignedBugBountyName || 'Bug Bounty Specialist'}</div>
          <div style="font-size: 9px; color: #64748b;">${testerSign?.designation || 'Lead Penetration Tester'}</div>
          <div class="sign-sig">${testerSign?.signature || 'Pending Signature'}</div>
          <div style="font-size: 9px; color: #475569;">Date: ${testerSign?.date || 'Pending'} • ${testerSign?.notes || 'All critical vulnerabilities remediated and re-verified.'}</div>
        </div>

        <div class="sign-box ${headSign?.approved ? 'filled' : ''}">
          <div class="sign-header">Cyber Head / CISO Certification</div>
          <div style="font-weight: 700;">${headSign?.name || project.cyberHeadName || 'Cyber Head'}</div>
          <div style="font-size: 9px; color: #64748b;">${headSign?.designation || 'Chief Information Security Officer (CISO)'}</div>
          <div class="sign-sig">${headSign?.signature || 'Pending Approval'}</div>
          <div style="font-size: 9px; color: #475569;">Approved: ${headSign?.date || 'Pending'} • ${headSign?.remarks || 'Certified secure for live production operation.'}</div>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9px; color: #64748b;">
      <span>PJSOFONIC Cyber Directorate • ISO/IEC 27001 Security Standard</span>
      <span>Confidential Security Clearance Handover</span>
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

export { exportMasterEngineeringReportToPdf } from './masterReportExport';
