import { NextResponse } from 'next/server';
import { saveProjectToSupabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const projectCode = body.projectCode || body.code || (body.crmProjectId ? `PJ-${body.crmProjectId}` : `CRM-${Date.now()}`);
    const title = body.title || body.projectName || 'Approved CRM Customer Project';

    const projectData = {
      crmProjectId: body.crmProjectId,
      projectCode,
      projectName: title,
      customerName: body.customerName || (body.handoverDocument?.clientSignoff?.name) || 'CRM Valued Client',
      customerEmail: body.customerEmail || (body.handoverDocument?.clientSignoff?.email) || 'client@crm.com',
      departmentScope: body.departmentScope || 'Software Engineering',
      requirements: body.requirements || body.handoverDocument?.scope || title,
      status: body.status || 'APPROVED',
      stage: 'ADMIN_CREATED',
      approvalStatus: 'APPROVED',
      handoverDocument: body.handoverDocument,
      agencySignoff: body.agencySignoff,
      clientSignoff: body.clientSignoff || body.handoverDocument?.clientSignoff,
      handoverPdfUrl: body.handoverPdfUrl || (body.crmProjectId ? `/api/v1/projects/${body.crmProjectId}/handover-pdf` : undefined),
      handoverPdfByCodeUrl: body.handoverPdfByCodeUrl || `/api/v1/projects/code/${projectCode}/handover-pdf`,
      handoverDocApiUrl: body.handoverDocApiUrl || `/api/v1/projects/code/${projectCode}/handover-document`,
      createdAt: new Date().toISOString(),
    };

    // Forward to Express Backend
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
      await fetch(`${backendUrl}/projects/crm-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (err) {
      console.warn('Backend webhook forwarding notice:', err);
    }

    // Forward to Supabase
    try {
      await saveProjectToSupabase(projectData as any);
    } catch (err) {
      console.warn('Supabase sync notice:', err);
    }

    return NextResponse.json({
      success: true,
      event: body.event || 'PROJECT_APPROVED',
      source: body.source || 'PJSOFONIC_CRM',
      message: 'CRM Project Handover webhook received and synchronized',
      project: projectData,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
