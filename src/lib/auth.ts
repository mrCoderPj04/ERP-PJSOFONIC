import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pjsofonic_erp_super_secure_jwt_secret_2026_key'
);

export interface UserSession {
  id: string;
  emsEmployeeId: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  designation?: string;
  erpStatus: 'ACTIVE' | 'BLOCKED';
}

/**
 * Mock EMS Service Verification Adapter
 * Connects directly to PJSOFONIC EMS Identity provider to verify employee status.
 */
export async function verifyEmsEmployeeIdentity(emsEmployeeId: string) {
  if (!emsEmployeeId || emsEmployeeId.trim() === '') {
    return { valid: false, error: 'EMS Employee ID is required.' };
  }

  // EMS check rule: If ID ends with '-INACTIVE' or contains 'INACTIVE', simulate inactive status
  if (emsEmployeeId.toUpperCase().includes('INACTIVE')) {
    return {
      valid: false,
      error: 'ACCESS DENIED: Employee account is marked INACTIVE in PJSOFONIC EMS.',
    };
  }

  return {
    valid: true,
    emsEmployeeId: emsEmployeeId.toUpperCase(),
    status: 'ACTIVE',
  };
}

export async function createSessionToken(user: UserSession): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}
