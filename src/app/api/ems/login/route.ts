import { NextResponse } from 'next/server';

const EMS_BACKEND_URL = process.env.EMS_BACKEND_URL || 'https://ems-backend-z3bv.onrender.com/api';
const LOCAL_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { employeeId, email, password } = body;
    const identifier = employeeId || email;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Employee ID or email and password are required' },
        { status: 400 }
      );
    }

    const payload = email
      ? { email, password }
      : { employeeId: employeeId?.toUpperCase(), password };

    // 1. Connect to direct live EMS Backend with automatic spin-up polling loop
    // Render free tier containers sleep after 15 min and return 503 while booting up (takes ~15-25s).
    // Instead of failing immediately, we poll until Render finishes spinning up and answers!
    const maxAttempts = 8;
    let emsRes: Response | null = null;
    let lastError = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        emsRes = await fetch(`${EMS_BACKEND_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // Success: Live EMS authenticated the real employee
        if (emsRes && emsRes.ok) {
          const data = await emsRes.json();
          return NextResponse.json(data);
        }

        // Credentials explicitly rejected by live EMS
        if (emsRes && (emsRes.status === 401 || emsRes.status === 403)) {
          const data = await emsRes.json().catch(() => ({}));
          return NextResponse.json(
            { error: data.error || data.message || 'Access Denied: Invalid Credentials in EMS.' },
            { status: emsRes.status }
          );
        }

        // Render is spinning up (500, 502, 503, 504): Wait and retry
        if (emsRes && emsRes.status >= 500 && attempt < maxAttempts) {
          console.log(`[EMS Spin-up] Render instance is waking up (HTTP ${emsRes.status}). Polling attempt ${attempt}/${maxAttempts}...`);
          await sleep(3500);
          continue;
        }
      } catch (err: any) {
        lastError = err?.message || 'Connection timeout';
        console.warn(`[EMS Connect] Attempt ${attempt}/${maxAttempts} notice: ${lastError}`);
        if (attempt < maxAttempts) {
          await sleep(3500);
          continue;
        }
      }
      break;
    }

    // 2. Also try Express ERP Backend if available
    try {
      const beController = new AbortController();
      const beTimeout = setTimeout(() => beController.abort(), 6000);
      const beRes = await fetch(`${LOCAL_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: beController.signal,
      });
      clearTimeout(beTimeout);

      if (beRes && beRes.ok) {
        const beData = await beRes.json();
        return NextResponse.json(beData);
      }
    } catch (e) {}

    // 3. If Render was still booting after all attempts
    if (emsRes && emsRes.status >= 500) {
      return NextResponse.json(
        {
          error: 'The EMS Render cloud instance is taking a little longer than usual to boot up. Please click Sign In once more—the server is now warm.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Unable to reach EMS Backend (${EMS_BACKEND_URL}): ${lastError || 'Server unreachable'}. Please verify server is deployed and online.` },
      { status: 502 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
