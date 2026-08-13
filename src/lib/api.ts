export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pjsofonic-erp-backend.onrender.com/api';

/**
 * Client-side API caller to communicate with dedicated Express Backend API Server
 */
export async function apiFetch<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BACKEND_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });
    return (await res.json()) as T;
  } catch (err: any) {
    console.error(`API Fetch Error [${url}]:`, err);
    throw err;
  }
}
