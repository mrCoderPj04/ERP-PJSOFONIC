import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ffauweryjzpnskdaqcyp.supabase.co';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_bLkboY3aqcA-LRqg7VROgw_IjxTh84f';
const supabaseSchema = process.env.NEXT_PUBLIC_SUPABASE_SCHEMA || 'project_erp';

/**
 * Primary Supabase Client (project_erp schema)
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: supabaseSchema,
  },
  auth: {
    persistSession: false,
  },
});

/**
 * Fallback Supabase Client (public schema)
 */
export const supabasePublic = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});

export interface SupabaseProject {
  id?: string;
  project_code?: string;
  project_name?: string;
  customer_name?: string;
  customer_email?: string;
  department_scope?: string;
  target_team_lead_id?: string;
  target_team_lead_name?: string;
  requirements?: string;
  budget?: number;
  status?: string;
  approval_status?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch approved / active projects from Supabase (project_erp with public fallback)
 */
export async function fetchSupabaseProjects(): Promise<any[]> {
  try {
    // 1. Try project_erp schema
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }

    // 2. Try public schema projects table
    const { data: pubData, error: pubErr } = await supabasePublic
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!pubErr && pubData && pubData.length > 0) {
      return pubData;
    }

    // 3. Try crm_projects table
    const { data: crmData, error: crmErr } = await supabasePublic
      .from('crm_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!crmErr && crmData && crmData.length > 0) {
      return crmData;
    }

    return [];
  } catch (err) {
    return [];
  }
}

/**
 * Insert or sync project into Supabase (project_erp with public fallback)
 */
export async function saveProjectToSupabase(project: any) {
  try {
    const payload = {
      project_code: project.projectCode || project.project_code,
      project_name: project.projectName || project.project_name,
      customer_name: project.customerName || project.customer_name,
      customer_email: project.customerEmail || project.customer_email,
      department_scope: project.departmentScope || project.department_scope,
      target_team_lead_id: project.targetTeamLeadId || project.target_team_lead_id,
      target_team_lead_name: project.targetTeamLeadName || project.target_team_lead_name,
      requirements: project.requirements,
      budget: project.budget,
      status: project.status || 'ACTIVE',
      approval_status: 'APPROVED',
      updated_at: new Date().toISOString(),
    };

    // Try project_erp schema first
    const { data, error } = await supabase.from('projects').upsert(payload).select();
    if (error) {
      // Fallback to public schema
      await supabasePublic.from('projects').upsert(payload).select();
    }
    return data;
  } catch (e) {
    // Graceful fallback
  }
}
