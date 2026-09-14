import { NextResponse } from 'next/server';

const EMS_BACKEND_URL = process.env.EMS_BACKEND_URL || 'https://ems-backend-z3bv.onrender.com/api';
const LOCAL_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authHeader) headers['Authorization'] = authHeader;

    // 1. Fetch real-time employees from EMS Backend with spin-up retry loop
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(`${EMS_BACKEND_URL}/employees`, {
          headers,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }

        if (res.status >= 500 && attempt < 5) {
          await sleep(3000);
          continue;
        }
      } catch (e: any) {
        if (attempt < 5) {
          await sleep(3000);
          continue;
        }
      }
      break;
    }

    // 2. Fetch from ERP Express backend
    try {
      const beController = new AbortController();
      const beTimeout = setTimeout(() => beController.abort(), 6000);
      const beRes = await fetch(`${LOCAL_BACKEND_URL}/employees`, {
        headers,
        signal: beController.signal,
      });
      clearTimeout(beTimeout);

      if (beRes.ok) {
        const beData = await beRes.json();
        return NextResponse.json(beData);
      }
    } catch (e: any) {}

    return NextResponse.json({ employees: [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
