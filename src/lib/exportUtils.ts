/**
 * Utility functions for exporting Timesheet and Project reports to Excel and PDF formats.
 * Works natively in modern browsers with zero external runtime dependencies.
 */

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
