export const QMS_API_BASE = 'https://pjsofonic-qms.onrender.com';

export interface QmsTestingPayload {
  id?: string;
  projectCode: string;
  projectName: string;
  customerName: string;
  departmentScope: string;
  submittedByTl?: string;
  requirements?: string;
  testingStatus: 'IN PROCESS' | 'DONE' | 'TESTING_PENDING';
  qualityFeedback?: string;
  submittedAt?: string;
}

const QMS_STORAGE_KEY = 'pj_qms_testing_queue';

export function getStoredQmsData(): QmsTestingPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(QMS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Syncs projects marked 'Done' by Team Leader directly to QMS backend Testing Queue
 * Endpoint: https://pjsofonic-qms.onrender.com/api/qms/projects
 */
export async function syncWithQMS(qmsPayload: QmsTestingPayload): Promise<boolean> {
  const existing = getStoredQmsData();
  const updatedList = [qmsPayload, ...existing.filter((item) => item.projectCode !== qmsPayload.projectCode)];

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(QMS_STORAGE_KEY, JSON.stringify(updatedList));
    }
  } catch (e) {}

  try {
    const res = await fetch(`${QMS_API_BASE}/api/qms/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectCode: qmsPayload.projectCode,
        projectName: qmsPayload.projectName,
        customerName: qmsPayload.customerName,
        departmentScope: qmsPayload.departmentScope,
        submittedByTl: qmsPayload.submittedByTl,
        testingStatus: qmsPayload.testingStatus,
        requirements: qmsPayload.requirements,
        submittedAt: qmsPayload.submittedAt || new Date().toISOString(),
      }),
    });

    if (res.ok) {
      console.log(`[QMS Sync Success] Synced ${qmsPayload.projectName} to ${QMS_API_BASE}`);
      return true;
    }
  } catch (err) {
    console.warn(`[QMS Sync Remote Warning] ${QMS_API_BASE} unavailable, local fallback saved.`, err);
  }

  return true;
}

/**
 * Fetches Quality Department testing items from QMS backend or local store
 */
export async function fetchQmsTestingItems(): Promise<QmsTestingPayload[]> {
  try {
    const res = await fetch(`${QMS_API_BASE}/api/qms/projects`);
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.projects || data.items || data.data || [];
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (err) {
    console.warn('Fetch from QMS failed, returning stored local fallback.');
  }

  return getStoredQmsData();
}
