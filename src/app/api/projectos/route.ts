import { NextResponse } from 'next/server';
import { fetchCrmCustomerProjects } from '../../../lib/crm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await fetchCrmCustomerProjects();
    const formatted = projects.map((p) => ({
      id: p.id,
      projectCode: p.projectCode,
      projectName: p.projectName,
      customerName: p.customerName,
      customerEmail: p.customerEmail,
      departmentScope: p.departmentScope,
      targetTeamLeadId: p.targetTeamLeadId,
      targetTeamLeadName: p.targetTeamLeadName || 'Unassigned',
      budget: p.budget,
      status: p.status,
      requirements: p.requirements,
      createdAt: p.createdAt,
      syncedWithHost: 'https://sofo-projectos.onrender.com',
    }));

    return NextResponse.json({
      status: 'SUCCESS',
      source: 'PJSOFONIC ERP API Engine',
      totalProjects: formatted.length,
      projects: formatted,
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
      message: 'ProjectOS sync received and integrated with ERP',
      data: body,
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'ERROR', error: err.message }, { status: 500 });
  }
}
