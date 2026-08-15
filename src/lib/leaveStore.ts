export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail?: string;
  department: string;
  designation?: string;
  leaveType: 'CASUAL' | 'SICK' | 'ANNUAL' | 'MATERNITY' | 'EMERGENCY';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

const LEAVE_STORAGE_KEY = 'pj_leave_requests_store';

export function getLeaveRequests(): LeaveRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(LEAVE_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load leave requests', e);
    return [];
  }
}

export function saveLeaveRequest(request: Partial<LeaveRequest>): LeaveRequest[] {
  const existing = getLeaveRequests();
  const newLeave: LeaveRequest = {
    id: request.id || `leave-${Date.now()}`,
    employeeId: request.employeeId || 'EMS-001',
    employeeName: request.employeeName || 'EMS Staff Member',
    employeeEmail: request.employeeEmail || '',
    department: request.department || 'Software Engineering',
    designation: request.designation || 'Software Engineer',
    leaveType: request.leaveType || 'CASUAL',
    startDate: request.startDate || new Date().toISOString().split('T')[0],
    endDate: request.endDate || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    reason: request.reason || 'Personal leave request.',
    status: 'PENDING',
    appliedAt: request.appliedAt || new Date().toISOString(),
  };

  const updated = [newLeave, ...existing];
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to save leave request', e);
  }
  return updated;
}

export function updateLeaveStatus(
  leaveId: string,
  newStatus: 'APPROVED' | 'REJECTED',
  approverName: string
): LeaveRequest[] {
  const existing = getLeaveRequests();
  const updated = existing.map((leave) => {
    if (leave.id === leaveId) {
      return {
        ...leave,
        status: newStatus,
        approvedBy: approverName,
        approvedAt: new Date().toISOString(),
      };
    }
    return leave;
  });

  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to update leave status', e);
  }

  return updated;
}
