import { NextResponse } from 'next/server';
import { fetchSupabaseProjects } from '../../../../lib/supabase';

export async function GET(req: Request) {
  const map = new Map<string, any>();
  const authHeader = req.headers.get('authorization') || '';

  // 1. Try Express backend
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const expressRes = await fetch(`${backendUrl}/crm/projects`, { headers, cache: 'no-store' });
    if (expressRes.ok) {
      const data = await expressRes.json();
      const list = data.projects || (Array.isArray(data) ? data : []);
      list.forEach((p: any) => {
        const code = p.projectCode || p.code || p.project_code || `CRM-${p.id}`;
        map.set(code, p);
      });
    }
  } catch (e) {}

  // 2. Try remote CRM API directly
  try {
    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const remoteRes = await fetch('https://pjsofonic-crm-backend.onrender.com/api/v1/projects', {
      headers,
      cache: 'no-store',
    });
    if (remoteRes.ok) {
      const data = await remoteRes.json();
      const list = Array.isArray(data) ? data : data.projects || data.data || [];
      list.forEach((p: any) => {
        const code = p.projectCode || p.code || p.project_code || `CRM-${p.id || p._id}`;
        if (!map.has(code)) {
          const isDone = p.status === 'COMPLETED' || p.stage === 'COMPLETED';
          map.set(code, {
            id: p.id ? String(p.id) : (p._id || `crm-${Date.now()}`),
            projectCode: code,
            projectName: p.title || p.projectName || p.name || 'CRM Customer Project',
            customerName: (p.customer && (p.customer.name || p.customer.company)) || p.company_name || p.customerName || p.clientName || 'CRM Client',
            customerEmail: (p.customer && p.customer.email) || p.customerEmail || p.email || 'client@crm.com',
            departmentScope: p.project_type || p.departmentScope || p.department || 'Software Engineering',
            targetTeamLeadId: p.target_team_lead_id || p.targetTeamLeadId,
            targetTeamLeadName: p.target_team_lead_name || p.targetTeamLeadName,
            requirements: p.overview || p.requirements_html || p.requirements || p.description || 'Customer scope from CRM.',
            budget: Number(p.budget || p.estimated_cost || p.estimatedCost) || 15000,
            status: isDone ? 'COMPLETED' : (p.status === 'APPROVED' ? 'IN_PROGRESS' : p.status || 'working'),
            stage: isDone ? 'COMPLETED' : (p.stage || 'ASSIGNED_TO_TL'),
            approvalStatus: 'APPROVED',
            createdAt: p.created_at || p.createdAt || new Date().toISOString(),
          });
        }
      });
    }
  } catch (e) {}

  // 3. Try Supabase project_erp schema
  try {
    const supaData = await fetchSupabaseProjects();
    if (Array.isArray(supaData) && supaData.length > 0) {
      supaData.forEach((p: any) => {
        const code = p.project_code || p.projectCode || p.code || `CRM-${p.id}`;
        if (!map.has(code)) {
          const isDone = p.status === 'COMPLETED';
          map.set(code, {
            id: p.id ? String(p.id) : `supa-${Date.now()}`,
            projectCode: code,
            projectName: p.project_name || p.projectName || p.name || 'CRM Approved Project',
            customerName: p.customer_name || p.customerName || p.clientName || 'Valued CRM Client',
            customerEmail: p.customer_email || p.customerEmail || p.email || 'client@crm.com',
            departmentScope: p.department_scope || p.departmentScope || p.department || 'Software Engineering',
            targetTeamLeadId: p.target_team_lead_id || p.targetTeamLeadId,
            targetTeamLeadName: p.target_team_lead_name || p.targetTeamLeadName,
            requirements: p.requirements || p.description || 'Approved project scope from CRM.',
            budget: Number(p.budget) || 25000,
            status: isDone ? 'COMPLETED' : (p.status || 'working'),
            stage: isDone ? 'COMPLETED' : 'ASSIGNED_TO_TL',
            approvalStatus: 'APPROVED',
            createdAt: p.created_at || p.createdAt || new Date().toISOString(),
          });
        }
      });
    }
  } catch (e) {}

  const results = Array.from(map.values());
  return NextResponse.json({ totalProjects: results.length, projects: results });
}
