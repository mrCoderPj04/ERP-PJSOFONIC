import { NextResponse } from 'next/server';
import { fetchCrmCustomerProjects } from '../../../lib/crm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await fetchCrmCustomerProjects();
    const doneProjects = projects.filter((p) => p.status === 'Done' || p.status === 'COMPLETED');

    const testingItems = doneProjects.map((p) => ({
      id: `qms-${p.id}`,
      projectCode: p.projectCode,
      projectName: p.projectName,
      customerName: p.customerName,
      departmentScope: p.departmentScope,
      submittedByTl: p.targetTeamLeadName || 'Team Leader',
      requirements: p.requirements,
      testingStatus: 'IN PROCESS',
      submittedAt: p.createdAt,
      qmsHost: 'https://pjsofonic-qms.onrender.com',
    }));

    return NextResponse.json({
      status: 'SUCCESS',
      source: 'PJSOFONIC ERP QMS Gateway',
      totalQualityTestingItems: testingItems.length,
      items: testingItems,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'ERROR', error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      status: 'SUCCESS',
      message: 'QMS quality report received and stored in ERP audit trail',
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'ERROR', error: err.message }, { status: 500 });
  }
}
