import { safeString } from './safeString';

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
  status: 'TODO' | 'IN_PROGRESS' | 'working' | 'Done' | 'WORK_SUBMITTED' | 'QUALITY_APPROVED' | 'QUALITY_REJECTED';
  submittedWork?: string;
  submittedAt?: string;
  qualityStatus?: 'IN PROCESS' | 'DONE';
  qualityFeedback?: string;
  qualityVerifiedBy?: string;
  dueDate: string;
  createdAt: string;
}

export interface TimesheetTodo {
  id: string;
  userId: string;
  userName: string;
  employeeId: string;
  department: string;
  projectId?: string;
  projectName: string;
  taskTitle: string;
  description?: string;
  hours: number;
  date: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

const STORAGE_KEY = 'pj_erp_tasks_store';
const TIMESHEET_STORAGE_KEY = 'pj_erp_timesheets_store';

export function getErpTasks(): ErpTask[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((t: any) => ({
      id: safeString(t.id || `task-${Date.now()}`),
      projectId: t.projectId ? safeString(t.projectId) : undefined,
      projectCode: t.projectCode ? safeString(t.projectCode) : undefined,
      projectName: safeString(t.projectName || 'CRM Technical Project'),
      milestoneName: t.milestoneName ? safeString(t.milestoneName) : undefined,
      title: safeString(t.title || 'Technical Milestone Task'),
      description: t.description ? safeString(t.description) : undefined,
      assigneeId: safeString(t.assigneeId || 'ems-assignee'),
      assigneeName: safeString(t.assigneeName || 'Full Stack Engineer'),
      assigneeEmail: t.assigneeEmail ? safeString(t.assigneeEmail) : undefined,
      assigneeDept: safeString(t.assigneeDept || 'Software Engineering'),
      priority: t.priority || 'HIGH',
      status: t.status || 'IN_PROGRESS',
      submittedWork: t.submittedWork ? safeString(t.submittedWork) : undefined,
      submittedAt: t.submittedAt ? safeString(t.submittedAt) : undefined,
      qualityStatus: t.qualityStatus,
      qualityFeedback: t.qualityFeedback ? safeString(t.qualityFeedback) : undefined,
      qualityVerifiedBy: t.qualityVerifiedBy ? safeString(t.qualityVerifiedBy) : undefined,
      dueDate: safeString(t.dueDate || new Date().toISOString().split('T')[0]),
      createdAt: safeString(t.createdAt || new Date().toISOString()),
    }));
  } catch (e) {
    console.error('Failed to parse ERP tasks from storage', e);
    return [];
  }
}

export function saveErpTask(task: ErpTask): ErpTask[] {
  const existing = getErpTasks();
  const sanitized: ErpTask = {
    ...task,
    id: safeString(task.id),
    projectName: safeString(task.projectName),
    title: safeString(task.title),
    assigneeId: safeString(task.assigneeId),
    assigneeName: safeString(task.assigneeName),
    assigneeDept: safeString(task.assigneeDept),
    dueDate: safeString(task.dueDate),
    createdAt: safeString(task.createdAt || new Date().toISOString()),
  };
  const index = existing.findIndex((t) => t.id === sanitized.id);
  let updated: ErpTask[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = sanitized;
  } else {
    updated = [sanitized, ...existing];
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
        submittedWork: safeString(submissionText),
        submittedAt: new Date().toISOString(),
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
        qualityVerifiedBy: safeString(testerName),
        qualityFeedback: feedback ? safeString(feedback) : t.qualityFeedback,
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

// ==========================================
// TIMESHEET & TODO LIST STORE
// ==========================================

export function getTimesheetTodos(): TimesheetTodo[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(TIMESHEET_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: any) => ({
      id: safeString(item.id || `ts-${Date.now()}`),
      userId: safeString(item.userId || 'ems-user'),
      userName: safeString(item.userName || 'Full Stack Engineer'),
      employeeId: safeString(item.employeeId || 'EMS-001'),
      department: safeString(item.department || 'Software Engineering'),
      projectId: item.projectId ? safeString(item.projectId) : undefined,
      projectName: safeString(item.projectName || 'Core ERP Platform'),
      taskTitle: safeString(item.taskTitle || 'Milestone Task'),
      description: item.description ? safeString(item.description) : undefined,
      hours: Number(item.hours) || 1,
      date: safeString(item.date || new Date().toLocaleDateString()),
      completed: Boolean(item.completed),
      completedAt: item.completedAt ? safeString(item.completedAt) : undefined,
      createdAt: safeString(item.createdAt || new Date().toISOString()),
    }));
  } catch (e) {
    console.error('Failed to parse timesheet todos from storage', e);
    return [];
  }
}

export function saveTimesheetTodo(entry: Partial<TimesheetTodo>): TimesheetTodo[] {
  const existing = getTimesheetTodos();
  const newEntry: TimesheetTodo = {
    id: safeString(entry.id || `ts-${Date.now()}`),
    userId: safeString(entry.userId || 'ems-user'),
    userName: safeString(entry.userName || 'Full Stack Engineer'),
    employeeId: safeString(entry.employeeId || 'EMS-001'),
    department: safeString(entry.department || 'Software Engineering'),
    projectId: entry.projectId ? safeString(entry.projectId) : undefined,
    projectName: safeString(entry.projectName || 'ERP Platform'),
    taskTitle: safeString(entry.taskTitle || 'Daily Engineering Task'),
    description: entry.description ? safeString(entry.description) : undefined,
    hours: Number(entry.hours) || 1,
    date: safeString(entry.date || new Date().toLocaleDateString()),
    completed: Boolean(entry.completed),
    completedAt: entry.completed ? (entry.completedAt || new Date().toISOString()) : undefined,
    createdAt: safeString(entry.createdAt || new Date().toISOString()),
  };

  const index = existing.findIndex((t) => t.id === newEntry.id);
  let updated: TimesheetTodo[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = newEntry;
  } else {
    updated = [newEntry, ...existing];
  }

  try {
    localStorage.setItem(TIMESHEET_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save timesheet todo', e);
  }
  return updated;
}

export function toggleTimesheetTodoStatus(todoId: string): TimesheetTodo[] {
  const existing = getTimesheetTodos();
  const updated = existing.map((t) => {
    if (t.id === todoId) {
      const nextCompleted = !t.completed;
      return {
        ...t,
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : undefined,
      };
    }
    return t;
  });

  try {
    localStorage.setItem(TIMESHEET_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to toggle timesheet status', e);
  }
  return updated;
}

export function deleteTimesheetTodo(todoId: string): TimesheetTodo[] {
  const existing = getTimesheetTodos();
  const updated = existing.filter((t) => t.id !== todoId);
  try {
    localStorage.setItem(TIMESHEET_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete timesheet todo', e);
  }
  return updated;
}
