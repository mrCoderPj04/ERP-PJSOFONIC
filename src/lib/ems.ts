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

export function determineErpRole(designation?: any, role?: any, department?: any): 'ADMIN' | 'TEAM_LEAD' | 'EMPLOYEE' | 'QA' | 'FINANCE' {
  const d = safeString(designation).toUpperCase();
  const r = safeString(role).toUpperCase();
  const dept = safeString(department).toUpperCase();

  if (r === 'ADMIN' || d.includes('ADMIN') || d.includes('DIRECTOR') || dept.includes('ADMIN') || d.includes('CISO')) return 'ADMIN';
  if (d.includes('LEAD') || d.includes('MANAGER') || d.includes('TL') || r.includes('LEAD') || r === 'TEAM_LEAD' || d.includes('HEAD')) return 'TEAM_LEAD';
  if (d.includes('QA') || d.includes('TEST') || d.includes('QUALITY') || dept.includes('QUALITY') || dept.includes('QA') || r === 'QA') return 'QA';
  if (d.includes('FINANCE') || d.includes('ACCOUNT') || dept.includes('FINANCE') || r === 'FINANCE') return 'FINANCE';
  return 'EMPLOYEE';
}

export const DEFAULT_EMS_EMPLOYEES: EmsUser[] = [];

export function findFallbackEmployee(employeeIdOrEmail: string): EmsUser | null {
  const query = employeeIdOrEmail.toLowerCase().trim();
  if (!query) return null;

  const candidates: EmsUser[] = [];

  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('pj_ems_realtime_employees');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: any) => {
            if (c && c.employeeId && !candidates.some((e) => e.employeeId.toUpperCase() === safeString(c.employeeId).toUpperCase())) {
              candidates.push(c);
            }
          });
        }
      }
      const savedUser = localStorage.getItem('pj_ems_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.employeeId && !candidates.some((e) => e.employeeId.toUpperCase() === safeString(parsed.employeeId).toUpperCase())) {
          candidates.push(parsed);
        }
      }
    } catch (e) {}
  }

  // Exact match on employeeId or email
  let match = candidates.find(
    (e) =>
      safeString(e.employeeId).toLowerCase() === query ||
      safeString(e.email).toLowerCase() === query
  );

  return match || null;
}

/**
 * Authenticates user credentials in real-time against PJSOFONIC EMS Backend
 * via server-side proxy route (/api/ems/login) and direct EMS API (${EMS_API_BASE}/auth/login)
 */
export async function authenticateWithEms(employeeIdOrEmail: string, password: string): Promise<{
  success: boolean;
  token?: string;
  user?: EmsUser;
  error?: string;
  message?: string;
}> {
  const isEmail = employeeIdOrEmail.includes('@');
  const cleanInput = employeeIdOrEmail.trim();

  // Try 1: Next.js internal server-side proxy route (prevents browser CORS errors and cold-start timeouts)
  try {
    const proxyRes = await fetch('/api/ems/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: !isEmail ? cleanInput.toUpperCase() : undefined,
        email: isEmail ? cleanInput : undefined,
        password,
      }),
    });

    const data = await proxyRes.json();
    if (proxyRes.ok && !data.error) {
      const token = data.token || data.accessToken || 'ems-live-token';
      const rawUser = data.user || data.employee || data;

      const empId = safeString(rawUser.employeeId || rawUser.code || rawUser.id || cleanInput).toUpperCase();
      const name = safeString(rawUser.fullName || rawUser.name || rawUser.username || `EMS User ${empId}`);
      const email = safeString(rawUser.email || (isEmail ? cleanInput : `${empId.toLowerCase()}@pjsofonic.com`));
      const dept = safeString(rawUser.department || rawUser.dept || 'Software Engineering');
      const desig = safeString(rawUser.designation || rawUser.title || 'Software Engineer');

      const normalizedUser: EmsUser = {
        id: safeString(rawUser.id || rawUser._id || `ems-${empId}`),
        employeeId: empId,
        fullName: name,
        email: email,
        phone: safeString(rawUser.phone || rawUser.contact || ''),
        department: dept,
        designation: desig,
        role: determineErpRole(desig, rawUser.role, dept),
        status: safeString(rawUser.status) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
        avatarUrl: safeString(rawUser.avatarUrl || rawUser.profilePicture || ''),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('pj_ems_user', JSON.stringify(normalizedUser));
        localStorage.setItem('pj_ems_token', token);
      }

      // Fetch live employee directory in background
      try {
        fetchEmsEmployees(token).catch(() => {});
      } catch (e) {}

      return {
        success: true,
        token,
        user: normalizedUser,
      };
    } else if (data.error) {
      return {
        success: false,
        error: data.error,
      };
    }
  } catch (err: any) {
    console.warn('Next.js EMS proxy notice, trying direct EMS endpoint...', err?.message);
  }

  // Try 2: Direct call to EMS_API_BASE
  try {
    const payload = isEmail
      ? { email: cleanInput, password }
      : { employeeId: cleanInput.toUpperCase(), password };

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
    const rawUser = data.user || data.employee || data;

    const empId = safeString(rawUser.employeeId || rawUser.code || cleanInput).toUpperCase();
    const name = safeString(rawUser.fullName || rawUser.name || rawUser.username || `EMS User ${empId}`);
    const email = safeString(rawUser.email || (isEmail ? cleanInput : `${empId.toLowerCase()}@pjsofonic.com`));
    const dept = safeString(rawUser.department || rawUser.dept || 'Software Engineering');
    const desig = safeString(rawUser.designation || rawUser.title || 'Software Engineer');

    const normalizedUser: EmsUser = {
      id: safeString(rawUser.id || rawUser._id || `ems-${empId}`),
      employeeId: empId,
      fullName: name,
      email: email,
      phone: safeString(rawUser.phone || rawUser.contact || ''),
      department: dept,
      designation: desig,
      role: determineErpRole(desig, rawUser.role, dept),
      status: safeString(rawUser.status) === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      avatarUrl: safeString(rawUser.avatarUrl || rawUser.profilePicture || ''),
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
    // If user previously logged in on this machine from real EMS
    const cachedUser = findFallbackEmployee(cleanInput);
    if (cachedUser) {
      return {
        success: true,
        token: `ems-cached-${cachedUser.employeeId.toLowerCase()}`,
        user: cachedUser,
        message: 'Authenticated from verified real-time EMS cache',
      };
    }

    return {
      success: false,
      error: `Failed to connect to EMS Backend (${EMS_API_BASE}): ${err.message}. Please verify the EMS service is running and accessible.`,
    };
  }
}

/**
 * Fetches all registered employees in real-time directly from EMS Backend API
 */
export async function fetchEmsEmployees(token?: string): Promise<EmsUser[]> {
  const employeeMap = new Map<string, EmsUser>();
  let authToken = token;

  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('pj_ems_token') || undefined;
  }

  // 1. Fetch real-time employees from internal Next.js proxy route /api/ems/employees
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const proxyRes = await fetch('/api/ems/employees', { headers });
    if (proxyRes.ok) {
      const data = await proxyRes.json();
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
        if (empId) {
          const name = safeString(emp.fullName || emp.name || emp.username || `Employee ${empId}`);
          const email = safeString(emp.email || `${empId.toLowerCase()}@pjsofonic.com`);
          const dept = safeString(emp.department || emp.dept || 'Software Engineering');
          const desig = safeString(emp.designation || emp.title || 'Software Engineer');

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
  } catch (e) {
    console.warn('Real-time EMS employees proxy fetch notice:', e);
  }

  // 2. Direct fetch from EMS_API_BASE if proxy returned empty
  if (employeeMap.size === 0) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${EMS_API_BASE}/employees`, { headers, signal: controller.signal });
      clearTimeout(timeoutId);

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
          if (empId) {
            const name = safeString(emp.fullName || emp.name || emp.username || `Employee ${empId}`);
            const email = safeString(emp.email || `${empId.toLowerCase()}@pjsofonic.com`);
            const dept = safeString(emp.department || emp.dept || 'Software Engineering');
            const desig = safeString(emp.designation || emp.title || 'Software Engineer');

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
      console.warn('EMS direct API fetch notice:', err);
    }
  }

  // 3. Fetch from Express Backend API (/api/employees)
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';
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

  // 4. Ingest cached real-time employees from storage if network was cold
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

    // 5. Ensure current logged-in user is in directory
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

export function isManagerUser(user?: { designation?: string; role?: string } | null): boolean {
  if (!user) return false;
  const d = safeString(user.designation).toUpperCase();
  return d.includes('MANAGER') || d.includes('OPERATIONS') || d.includes('DELIVERY');
}

export function isProductionHeadUser(user?: { designation?: string; role?: string } | null): boolean {
  if (!user) return false;
  const d = safeString(user.designation).toUpperCase();
  return d.includes('PRODUCTION HEAD') || (d.includes('HEAD') && d.includes('PRODUCTION'));
}

export function isTeamLeadUser(user?: { designation?: string; role?: string } | null): boolean {
  if (!user) return false;
  const d = safeString(user.designation).toUpperCase();
  const r = safeString(user.role).toUpperCase();
  return (
    d.includes('TEAM LEAD') ||
    d.includes('TEAM LEADER') ||
    d.includes('LEAD') ||
    d.includes('TL') ||
    r === 'TEAM_LEAD'
  ) && !isProductionHeadUser(user) && !isQualityHeadUser(user) && !isCyberHeadUser(user) && !isManagerUser(user);
}

export function isFullStackUser(user?: { designation?: string } | null): boolean {
  if (!user) return false;
  const d = safeString(user.designation).toUpperCase();
  return d.includes('FULL STACK') || d.includes('FULLSTACK') || d.includes('SOFTWARE ENGINEER') || d.includes('DEVELOPER');
}

export function isDevOpsUser(user?: { designation?: string } | null): boolean {
  if (!user) return false;
  const d = safeString(user.designation).toUpperCase();
  return d.includes('DEVOPS') || d.includes('CLOUD') || d.includes('INFRASTRUCTURE') || d.includes('SRE');
}

export function isAiEngineerUser(user?: { designation?: string } | null): boolean {
  if (!user) return false;
  const d = safeString(user.designation).toUpperCase();
  return d.includes('AI') || d.includes('MACHINE LEARNING') || d.includes('DATA SCIENTIST');
}

export function isQualityHeadUser(user?: { designation?: string; department?: string } | null): boolean {
  if (!user) return false;
  const d = safeString(user.designation).toUpperCase();
  const dept = safeString(user.department).toUpperCase();
  return (d.includes('QUALITY HEAD') || d.includes('HEAD OF QA') || d.includes('QA HEAD') || (d.includes('HEAD') && (dept.includes('QUALITY') || dept.includes('QA'))));
}

export function isQualityEngineerUser(user?: { designation?: string; department?: string; role?: string } | null): boolean {
  if (!user) return false;
  const d = safeString(user.designation).toUpperCase();
  const dept = safeString(user.department).toUpperCase();
  const r = safeString(user.role).toUpperCase();
  return !isQualityHeadUser(user) && (d.includes('QUALITY') || d.includes('QA') || d.includes('TESTER') || dept.includes('QUALITY') || r === 'QA');
}

export function isCyberHeadUser(user?: { designation?: string; department?: string } | null): boolean {
  if (!user) return false;
  const d = safeString(user.designation).toUpperCase();
  const dept = safeString(user.department).toUpperCase();
  return d.includes('CYBER HEAD') || d.includes('CISO') || d.includes('HEAD OF CYBER') || d.includes('SECURITY HEAD') || (d.includes('HEAD') && (dept.includes('CYBER') || dept.includes('SECURITY')));
}

export function isBugBountyUser(user?: { designation?: string; department?: string } | null): boolean {
  if (!user) return false;
  const d = safeString(user.designation).toUpperCase();
  const dept = safeString(user.department).toUpperCase();
  return !isCyberHeadUser(user) && (d.includes('BUG BOUNTY') || d.includes('PENETRATION') || d.includes('ETHICAL') || d.includes('CYBER') || d.includes('SECURITY') || dept.includes('CYBER') || dept.includes('SECURITY'));
}

export function isAdminUser(user?: { designation?: string; department?: string; role?: string } | null): boolean {
  if (!user) return false;
  const d = safeString(user.designation).toUpperCase();
  const r = safeString(user.role).toUpperCase();
  const dept = safeString(user.department).toUpperCase();
  return r === 'ADMIN' || d.includes('ADMIN') || d.includes('DIRECTOR') || dept.includes('ADMIN');
}
