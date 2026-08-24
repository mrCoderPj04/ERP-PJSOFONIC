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
 * (https://erp-backend-1-02lc.onrender.com/api/auth/login)
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
        error: data.error || data.message || 'Access Denied: Account not registered in EMS.',
      };
    }

    const token = data.token || data.accessToken || 'ems-live-token';

    // Extract user profile from EMS response
    const rawUser =
      data.user ||
      data.employee ||
      data.data?.user ||
      data.data?.employee ||
      data.data ||
      data.result ||
      data.profile ||
      (data.employeeId || data.email || data.fullName || data.name || data.code ? data : {});

    // Query EMS /api/employees to enrich profile if possible
    let emsMatch: any = null;
    try {
      const empRes = await fetch(`${EMS_API_BASE}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (empRes.ok) {
        const empData = await empRes.json();
        const list: any[] = Array.isArray(empData)
          ? empData
          : empData.employees || empData.data || empData.result || [];
        const searchKey = employeeIdOrEmail.toLowerCase().trim();
        emsMatch = list.find((e) => {
          const eId = safeString(e.employeeId || e.code || e.id).toLowerCase();
          const eEmail = safeString(e.email).toLowerCase();
          return eId === searchKey || eEmail === searchKey || eId.includes(searchKey);
        });

        // Save real-time fetched employees list into storage
        if (list.length > 0 && typeof window !== 'undefined') {
          const normalizedList = list.map((emp: any, idx: number) => {
            const eId = safeString(emp.employeeId || emp.code || emp.id || `EMS-100${idx + 1}`);
            const name = safeString(emp.fullName || emp.name || emp.username || `Employee ${eId}`);
            const email = safeString(emp.email || `${eId.toLowerCase()}@pjsofonic.com`);
            const dept = safeString(emp.department || emp.dept || 'Software Engineering');
            const desig = safeString(emp.designation || emp.title || 'Software Engineer');

            return {
              id: safeString(emp.id || emp._id || `ems-${eId}`),
              employeeId: eId,
              fullName: name,
              email: email,
              phone: safeString(emp.phone || emp.contact || ''),
              department: dept,
              designation: desig,
              role: determineErpRole(desig, emp.role, dept),
              status: safeString(emp.status) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
              avatarUrl: safeString(emp.avatarUrl || emp.profilePicture || ''),
            };
          });
          localStorage.setItem('pj_ems_realtime_employees', JSON.stringify(normalizedList));
        }
      }
    } catch (e) {}

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

    if (typeof window !== 'undefined') {
      localStorage.setItem('pj_ems_user', JSON.stringify(normalizedUser));
      localStorage.setItem('pj_ems_token', token);
    }

    return {
      success: true,
      token,
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
 * Fetches all registered employees in real-time directly from EMS Backend API
 * (https://erp-backend-1-02lc.onrender.com/api/employees)
 */
export async function fetchEmsEmployees(token?: string): Promise<EmsUser[]> {
  const employeeMap = new Map<string, EmsUser>();
  let authToken = token;

  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('pj_ems_token') || undefined;
  }

  // 1. Fetch live registered employees from EMS Backend API
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${EMS_API_BASE}/employees`, { headers });
    if (res.ok) {
      const data = await res.json();
      const list: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data.employees)
        ? data.employees
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.result)
        ? data.result
        : Array.isArray(data.users)
        ? data.users
        : [];

      list.forEach((emp: any, idx: number) => {
        const empId = safeString(emp.employeeId || emp.code || emp.id || `EMS-${idx + 1}`).toUpperCase();
        const name = safeString(emp.fullName || emp.name || emp.username || `Employee ${empId}`);
        const email = safeString(emp.email || `${empId.toLowerCase()}@pjsofonic.com`);
        const dept = safeString(emp.department || emp.dept || 'Software Engineering');
        const desig = safeString(emp.designation || emp.title || 'Software Engineer');

        if (empId) {
          employeeMap.set(empId, {
            id: safeString(emp.id || emp._id || `ems-${empId}`),
            employeeId: empId,
            fullName: name,
            email: email,
            phone: safeString(emp.phone || emp.contact || ''),
            department: dept,
            designation: desig,
            role: determineErpRole(desig, emp.role, dept),
            status: safeString(emp.status) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            avatarUrl: safeString(emp.avatarUrl || emp.profilePicture || ''),
          });
        }
      });
    }
  } catch (err) {
    console.warn('EMS backend API fetch notice:', err);
  }

  // 2. Fetch from Express Backend API (/api/employees)
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001/api';
    const localRes = await fetch(`${backendUrl}/employees`).catch(() => null);
    if (localRes && localRes.ok) {
      const localData = await localRes.json();
      const list: any[] = Array.isArray(localData.employees) ? localData.employees : [];
      list.forEach((emp: any, idx: number) => {
        const empId = safeString(emp.employeeId || emp.code || `EMS-${idx + 1}`).toUpperCase();
        if (empId && !employeeMap.has(empId)) {
          employeeMap.set(empId, {
            id: safeString(emp.id || `ems-${empId}`),
            employeeId: empId,
            fullName: safeString(emp.fullName || emp.name || `Employee ${empId}`),
            email: safeString(emp.email || `${empId.toLowerCase()}@pjsofonic.com`),
            phone: safeString(emp.phone || emp.contact || ''),
            department: safeString(emp.department || emp.dept || 'Software Engineering'),
            designation: safeString(emp.designation || emp.title || 'Software Engineer'),
            role: determineErpRole(emp.designation, emp.role, emp.department),
            status: safeString(emp.status) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            avatarUrl: safeString(emp.avatarUrl || ''),
          });
        }
      });
    }
  } catch (e) {}

  // 3. Ingest cached real-time employees from storage if network was cold
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('pj_ems_realtime_employees');
      if (cached) {
        const parsed: EmsUser[] = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          parsed.forEach((emp) => {
            if (emp.employeeId && !employeeMap.has(emp.employeeId.toUpperCase())) {
              employeeMap.set(emp.employeeId.toUpperCase(), emp);
            }
          });
        }
      }
    } catch (e) {}

    // 4. Ensure current logged-in user is in directory
    try {
      const savedUser = localStorage.getItem('pj_ems_user');
      if (savedUser) {
        const current: EmsUser = JSON.parse(savedUser);
        if (current && current.employeeId) {
          employeeMap.set(current.employeeId.toUpperCase(), current);
        }
      }
    } catch (e) {}
  }

  const allEmployees = Array.from(employeeMap.values());

  // Cache latest real-time employees
  if (typeof window !== 'undefined' && allEmployees.length > 0) {
    try {
      localStorage.setItem('pj_ems_realtime_employees', JSON.stringify(allEmployees));
    } catch (e) {}
  }

  return allEmployees;
}

export function determineErpRole(designation?: any, role?: any, department?: any): 'ADMIN' | 'TEAM_LEAD' | 'EMPLOYEE' | 'QA' | 'FINANCE' {
  const d = safeString(designation).toUpperCase();
  const r = safeString(role).toUpperCase();
  const dept = safeString(department).toUpperCase();

  if (r === 'ADMIN' || d.includes('ADMIN') || d.includes('DIRECTOR') || dept.includes('ADMIN')) return 'ADMIN';
  if (d.includes('LEAD') || d.includes('MANAGER') || d.includes('TL') || r.includes('LEAD') || r === 'TEAM_LEAD') return 'TEAM_LEAD';
  if (d.includes('QA') || d.includes('TEST') || d.includes('QUALITY') || dept.includes('QUALITY') || dept.includes('QA') || r === 'QA') return 'QA';
  if (d.includes('FINANCE') || d.includes('ACCOUNT') || dept.includes('FINANCE') || r === 'FINANCE') return 'FINANCE';
  return 'EMPLOYEE';
}
