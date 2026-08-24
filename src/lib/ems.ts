import { safeString } from './safeString';

export const EMS_API_BASE = 'https://erp-backend-1-02lc.onrender.com/api';

export interface EmsUser {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  role: 'ADMIN' | 'TEAM_LEAD' | 'EMPLOYEE' | 'QA' | 'FINANCE';
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
}

/**
 * Authenticates user credentials directly against PJSOFONIC EMS Backend
 * and retrieves complete real-time profile details from EMS database.
 */
export async function authenticateWithEms(employeeIdOrEmail: string, password: string) {
  try {
    const isEmail = employeeIdOrEmail.includes('@');
    const payload = isEmail
      ? { email: employeeIdOrEmail, password }
      : { employeeId: employeeIdOrEmail.toUpperCase(), password };

    const res = await fetch(`${EMS_API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error || data.message || 'EMS Authentication failed. User not registered in EMS.',
      };
    }

    // Flexible extraction supporting nested and flat responses
    const rawUser =
      data.user ||
      data.employee ||
      data.data?.user ||
      data.data?.employee ||
      data.data ||
      data.result ||
      data.profile ||
      (data.employeeId || data.email || data.fullName || data.name || data.code ? data : {});

    // Live query EMS employee directory to fetch complete registered profile details
    let emsMatch: any = null;
    try {
      const empRes = await fetch(`${EMS_API_BASE}/employees`);
      if (empRes.ok) {
        const empData = await empRes.json();
        const list: any[] = Array.isArray(empData)
          ? empData
          : empData.employees || empData.data || empData.result || [];
        const searchKey = employeeIdOrEmail.toLowerCase().trim();
        emsMatch = list.find((e) => {
          const eId = safeString(e.employeeId || e.code || e.id).toLowerCase();
          const eEmail = safeString(e.email).toLowerCase();
          return eId === searchKey || eEmail === searchKey || (searchKey.length > 2 && eId.includes(searchKey));
        });
      }
    } catch (e) {
      console.warn('Could not query EMS employee list for extra details:', e);
    }

    const merged = emsMatch ? { ...emsMatch, ...rawUser } : rawUser;

    const empId = safeString(merged.employeeId || merged.code || rawUser.employeeId || (isEmail ? 'EMS-001' : employeeIdOrEmail.toUpperCase()));
    const email = safeString(merged.email || rawUser.email || (isEmail ? employeeIdOrEmail : `${employeeIdOrEmail.toLowerCase()}@pjsofonic.com`));
    const name = safeString(merged.fullName || merged.name || merged.username || rawUser.fullName || rawUser.name || (isEmail ? employeeIdOrEmail.split('@')[0] : `Employee ${empId}`));
    const dept = safeString(merged.department || merged.dept || rawUser.department || 'Software Engineering');
    const desig = safeString(merged.designation || merged.title || rawUser.designation || 'Software Engineer');
    const contact = safeString(merged.phone || merged.contact || merged.mobile || rawUser.phone || '');
    const avatar = safeString(merged.avatarUrl || merged.profilePicture || merged.image || rawUser.avatarUrl || '');

    const normalizedUser: EmsUser = {
      id: safeString(merged.id || merged._id || rawUser.id || `ems-${empId}`),
      employeeId: empId,
      fullName: name,
      email: email,
      phone: contact,
      department: dept,
      designation: desig,
      role: determineErpRole(desig, merged.role || rawUser.role, dept),
      status: safeString(merged.status || rawUser.status) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      avatarUrl: avatar,
    };

    // 3. Synchronize with PJSOFONIC CRM Backend
    try {
      const crmPayload = isEmail
        ? { email: employeeIdOrEmail, password }
        : { login_id: employeeIdOrEmail.toUpperCase(), employeeId: employeeIdOrEmail.toUpperCase(), password };

      const crmRes = await fetch('https://pjsofonic-crm-backend.onrender.com/api/v1/auth/ems-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crmPayload),
      });

      if (crmRes.ok) {
        const crmData = await crmRes.json();
        if (crmData.access_token && typeof window !== 'undefined') {
          localStorage.setItem('pj_crm_token', crmData.access_token);
        }
      }
    } catch (crmErr) {
      console.warn('CRM Backend auth background sync notice:', crmErr);
    }

    return {
      success: true,
      token: data.token || data.accessToken || 'ems-live-token',
      user: normalizedUser,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Failed to connect to EMS Backend (${EMS_API_BASE}): ${err.message}`,
    };
  }
}

/**
 * Fetches live registered employee list directly from EMS Backend
 */
export async function fetchEmsEmployees(token?: string): Promise<EmsUser[]> {
  let fetchedList: any[] = [];
  try {
    const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('pj_ems_token') : null);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${EMS_API_BASE}/employees`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        fetchedList = data;
      } else if (Array.isArray(data.employees)) {
        fetchedList = data.employees;
      } else if (Array.isArray(data.data)) {
        fetchedList = data.data;
      } else if (Array.isArray(data.result)) {
        fetchedList = data.result;
      } else if (Array.isArray(data.users)) {
        fetchedList = data.users;
      } else if (Array.isArray(data.staff)) {
        fetchedList = data.staff;
      } else if (data.employeesByDepartment && typeof data.employeesByDepartment === 'object') {
        fetchedList = Object.values(data.employeesByDepartment).flat();
      }
      // Try Express Backend API fallback
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
      const localRes = await fetch(`${backendUrl}/employees`).catch(() => null);
      if (localRes && localRes.ok) {
        const localData = await localRes.json();
        if (Array.isArray(localData.employees)) {
          fetchedList = localData.employees;
        }
      }
    }
  } catch (err) {
    console.error('EMS Employee fetch notice:', err);
  }

  // Restore current logged-in user from localStorage
  let currentUser: EmsUser | null = null;
  try {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('pj_ems_user') : null;
    if (saved) {
      currentUser = JSON.parse(saved);
    }
  } catch (e) {}

  const normalized: EmsUser[] = fetchedList.map((emp: any, idx: number) => {
    const empId = safeString(emp.employeeId || emp.code || `EMS-10${idx + 1}`);
    const name = safeString(emp.fullName || emp.name || emp.username || `EMS Staff ${idx + 1}`);
    const email = safeString(emp.email || `employee${idx + 1}@pjsofonic.com`);
    const contact = safeString(emp.phone || emp.contact || emp.mobile || '');
    const dept = safeString(emp.department || emp.dept || 'Software Engineering');
    const desig = safeString(emp.designation || emp.title || 'Software Engineer');
    const avatar = safeString(emp.avatarUrl || emp.profilePicture || emp.image || '');

    return {
      id: safeString(emp.id || emp._id || `ems-${empId || idx}`),
      employeeId: empId,
      fullName: name,
      email: email,
      phone: contact,
      department: dept,
      designation: desig,
      role: determineErpRole(desig, emp.role, dept),
      status: safeString(emp.status) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      avatarUrl: avatar,
    };
  });

  // Ensure logged-in verified EMS employee is present in list
  if (currentUser && !normalized.some((e) => e.employeeId === currentUser?.employeeId || e.id === currentUser?.id)) {
    normalized.unshift(currentUser);
  }

  return normalized;
}

export function determineErpRole(designation?: any, role?: any, department?: any): 'ADMIN' | 'TEAM_LEAD' | 'EMPLOYEE' | 'QA' | 'FINANCE' {
  const d = safeString(designation).toUpperCase();
  const r = safeString(role).toUpperCase();
  const dept = safeString(department).toUpperCase();

  if (r === 'ADMIN' || d.includes('ADMIN') || d.includes('DIRECTOR')) return 'ADMIN';
  if (d.includes('LEAD') || d.includes('MANAGER') || d.includes('TL') || r.includes('LEAD')) return 'TEAM_LEAD';
  if (d.includes('QA') || d.includes('TEST') || d.includes('QUALITY') || dept.includes('QUALITY') || dept.includes('QA') || r === 'QA') return 'QA';
  if (d.includes('FINANCE') || d.includes('ACCOUNT') || dept.includes('FINANCE') || r === 'FINANCE') return 'FINANCE';
  return 'EMPLOYEE';
}
