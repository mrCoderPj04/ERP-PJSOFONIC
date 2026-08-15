import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Try local Express backend if running
    const expressRes = await fetch('http://localhost:5000/api/crm/projects', { cache: 'no-store' });
    if (expressRes.ok) {
      const data = await expressRes.json();
      return NextResponse.json(data);
    }
  } catch (e) {}

  try {
    // 2. Try remote CRM API
    const remoteRes = await fetch('https://pjsofonic-crm-backend.onrender.com/api/v1/projects', { cache: 'no-store' });
    if (remoteRes.ok) {
      const data = await remoteRes.json();
      return NextResponse.json(data);
    }
  } catch (e) {}

  return NextResponse.json({ projects: [] });
}
