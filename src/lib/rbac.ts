export type ModuleType =
  | 'DASHBOARD'
  | 'PROJECTS'
  | 'TASKS'
  | 'EMPLOYEES'
  | 'CLIENTS'
  | 'CRM'
  | 'ATTENDANCE'
  | 'LEAVE'
  | 'TIMESHEET'
  | 'MEETINGS'
  | 'COMMUNICATION'
  | 'DOCUMENTS'
  | 'FINANCE'
  | 'QUALITY'
  | 'REPORTS'
  | 'NOTIFICATIONS'
  | 'PROFILE'
  | 'SETTINGS';

export type ActionType =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'APPROVE'
  | 'EXPORT'
  | 'ASSIGN';

export interface RoleConfig {
  name: string;
  description: string;
  permissions: Array<{ module: ModuleType; actions: ActionType[] }>;
}

export const DEFAULT_ROLES: RoleConfig[] = [
  {
    name: 'SUPER_ADMIN',
    description: 'Complete system control across all ERP modules and settings',
    permissions: [
      { module: 'DASHBOARD', actions: ['VIEW', 'EXPORT'] },
      { module: 'PROJECTS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'ASSIGN'] },
      { module: 'TASKS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'ASSIGN'] },
      { module: 'EMPLOYEES', actions: ['VIEW', 'EDIT', 'ASSIGN'] },
      { module: 'CLIENTS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'] },
      { module: 'CRM', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT'] },
      { module: 'ATTENDANCE', actions: ['VIEW', 'EDIT', 'APPROVE', 'EXPORT'] },
      { module: 'LEAVE', actions: ['VIEW', 'APPROVE', 'EXPORT'] },
      { module: 'TIMESHEET', actions: ['VIEW', 'APPROVE', 'EXPORT'] },
      { module: 'MEETINGS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
      { module: 'COMMUNICATION', actions: ['VIEW', 'CREATE', 'DELETE'] },
      { module: 'DOCUMENTS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
      { module: 'FINANCE', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT'] },
      { module: 'QUALITY', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'ASSIGN'] },
      { module: 'REPORTS', actions: ['VIEW', 'EXPORT'] },
      { module: 'NOTIFICATIONS', actions: ['VIEW'] },
      { module: 'PROFILE', actions: ['VIEW', 'EDIT'] },
      { module: 'SETTINGS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
    ],
  },
  {
    name: 'ADMIN',
    description: 'Full operational administration excluding core system configuration',
    permissions: [
      { module: 'DASHBOARD', actions: ['VIEW', 'EXPORT'] },
      { module: 'PROJECTS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'ASSIGN'] },
      { module: 'TASKS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE', 'EXPORT', 'ASSIGN'] },
      { module: 'EMPLOYEES', actions: ['VIEW', 'EDIT', 'ASSIGN'] },
      { module: 'CLIENTS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'EXPORT'] },
      { module: 'CRM', actions: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'EXPORT'] },
      { module: 'ATTENDANCE', actions: ['VIEW', 'EDIT', 'APPROVE', 'EXPORT'] },
      { module: 'LEAVE', actions: ['VIEW', 'APPROVE', 'EXPORT'] },
      { module: 'TIMESHEET', actions: ['VIEW', 'APPROVE', 'EXPORT'] },
      { module: 'MEETINGS', actions: ['VIEW', 'CREATE', 'EDIT'] },
      { module: 'COMMUNICATION', actions: ['VIEW', 'CREATE'] },
      { module: 'DOCUMENTS', actions: ['VIEW', 'CREATE', 'EDIT', 'DELETE'] },
      { module: 'FINANCE', actions: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'EXPORT'] },
      { module: 'QUALITY', actions: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'ASSIGN'] },
      { module: 'REPORTS', actions: ['VIEW', 'EXPORT'] },
      { module: 'NOTIFICATIONS', actions: ['VIEW'] },
      { module: 'PROFILE', actions: ['VIEW', 'EDIT'] },
      { module: 'SETTINGS', actions: ['VIEW'] },
    ],
  },
  {
    name: 'PROJECT_MANAGER',
    description: 'Manages assigned projects, milestones, tasks, team allocation & reviews',
    permissions: [
      { module: 'DASHBOARD', actions: ['VIEW'] },
      { module: 'PROJECTS', actions: ['VIEW', 'EDIT', 'ASSIGN'] },
      { module: 'TASKS', actions: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'ASSIGN'] },
      { module: 'EMPLOYEES', actions: ['VIEW'] },
      { module: 'CLIENTS', actions: ['VIEW'] },
      { module: 'ATTENDANCE', actions: ['VIEW'] },
      { module: 'LEAVE', actions: ['VIEW', 'APPROVE'] },
      { module: 'TIMESHEET', actions: ['VIEW', 'APPROVE'] },
      { module: 'MEETINGS', actions: ['VIEW', 'CREATE', 'EDIT'] },
      { module: 'COMMUNICATION', actions: ['VIEW', 'CREATE'] },
      { module: 'DOCUMENTS', actions: ['VIEW', 'CREATE'] },
      { module: 'QUALITY', actions: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'ASSIGN'] },
      { module: 'REPORTS', actions: ['VIEW', 'EXPORT'] },
      { module: 'NOTIFICATIONS', actions: ['VIEW'] },
      { module: 'PROFILE', actions: ['VIEW', 'EDIT'] },
    ],
  },
  {
    name: 'QA',
    description: 'Focuses on testing, bug verification, quality standards and code review',
    permissions: [
      { module: 'DASHBOARD', actions: ['VIEW'] },
      { module: 'PROJECTS', actions: ['VIEW'] },
      { module: 'TASKS', actions: ['VIEW', 'EDIT', 'APPROVE'] },
      { module: 'QUALITY', actions: ['VIEW', 'CREATE', 'EDIT', 'APPROVE', 'ASSIGN'] },
      { module: 'COMMUNICATION', actions: ['VIEW', 'CREATE'] },
      { module: 'DOCUMENTS', actions: ['VIEW', 'CREATE'] },
      { module: 'NOTIFICATIONS', actions: ['VIEW'] },
      { module: 'PROFILE', actions: ['VIEW', 'EDIT'] },
    ],
  },
  {
    name: 'EMPLOYEE',
    description: 'Standard team member responsible for execution, task submission & time logging',
    permissions: [
      { module: 'DASHBOARD', actions: ['VIEW'] },
      { module: 'PROJECTS', actions: ['VIEW'] },
      { module: 'TASKS', actions: ['VIEW', 'EDIT'] },
      { module: 'ATTENDANCE', actions: ['VIEW', 'CREATE'] },
      { module: 'LEAVE', actions: ['VIEW', 'CREATE'] },
      { module: 'TIMESHEET', actions: ['VIEW', 'CREATE'] },
      { module: 'MEETINGS', actions: ['VIEW', 'CREATE'] },
      { module: 'COMMUNICATION', actions: ['VIEW', 'CREATE'] },
      { module: 'DOCUMENTS', actions: ['VIEW'] },
      { module: 'QUALITY', actions: ['VIEW', 'CREATE'] },
      { module: 'NOTIFICATIONS', actions: ['VIEW'] },
      { module: 'PROFILE', actions: ['VIEW', 'EDIT'] },
    ],
  },
];
