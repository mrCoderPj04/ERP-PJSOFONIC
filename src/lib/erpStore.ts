export interface ErpTask {
  id: string;
  projectId?: string;
  projectCode?: string;
  projectName: string;
  milestoneName?: string;
  title: string;
  description?: string;
  assigneeId: string;
  assigneeName: string;
  assigneeEmail?: string;
  assigneeDept: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'TODO' | 'IN_PROGRESS' | 'WORK_SUBMITTED' | 'QUALITY_APPROVED' | 'QUALITY_REJECTED';
  submittedWork?: string;
  submittedAt?: string;
  qualityStatus?: 'IN PROCESS' | 'DONE';
  qualityFeedback?: string;
  qualityVerifiedBy?: string;
  dueDate: string;
  createdAt: string;
}

const STORAGE_KEY = 'pj_erp_tasks_store';

export function getErpTasks(): ErpTask[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse ERP tasks from storage', e);
    return [];
  }
}

export function saveErpTask(task: ErpTask): ErpTask[] {
  const existing = getErpTasks();
  const index = existing.findIndex((t) => t.id === task.id);
  let updated: ErpTask[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = task;
  } else {
    updated = [task, ...existing];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save task to storage', e);
  }
  return updated;
}

export function submitWorkForTask(taskId: string, submissionText: string): ErpTask[] {
  const existing = getErpTasks();
  const updated = existing.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        status: 'WORK_SUBMITTED' as const,
        submittedWork: submissionText,
        submittedAt: new Date().toISOString(),
        qualityStatus: 'IN PROCESS' as const,
      };
    }
    return t;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to submit work for task', e);
  }
  return updated;
}

export function verifyQualityTask(
  taskId: string,
  newQualityStatus: 'IN PROCESS' | 'DONE',
  testerName: string,
  feedback?: string
): ErpTask[] {
  const existing = getErpTasks();
  const updated = existing.map((t) => {
    if (t.id === taskId) {
      const isDone = newQualityStatus === 'DONE';
      return {
        ...t,
        qualityStatus: newQualityStatus,
        status: isDone ? ('QUALITY_APPROVED' as const) : ('WORK_SUBMITTED' as const),
        qualityVerifiedBy: testerName,
        qualityFeedback: feedback || t.qualityFeedback,
      };
    }
    return t;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update quality status', e);
  }
  return updated;
}

export function deleteErpTask(taskId: string): ErpTask[] {
  const existing = getErpTasks();
  const updated = existing.filter((t) => t.id !== taskId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete task', e);
  }
  return updated;
}
