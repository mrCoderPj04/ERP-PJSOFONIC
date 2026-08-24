'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Download,
  Calendar,
  Layers,
  Trash2,
  Filter,
  CheckSquare,
  Sparkles,
  User,
  Crown,
  Code2,
} from 'lucide-react';
import { EmptyState, Modal, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import {
  getTimesheetTodos,
  saveTimesheetTodo,
  toggleTimesheetTodoStatus,
  deleteTimesheetTodo,
  TimesheetTodo,
} from '../../lib/erpStore';
import { fetchCrmCustomerProjects, CrmCustomerProject } from '../../lib/crm';
import { exportTimesheetReportToExcel } from '../../lib/exportUtils';
import { addSystemNotification } from '../../lib/notificationStore';

export default function TimesheetPage() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TimesheetTodo[]>([]);
  const [projects, setProjects] = useState<CrmCustomerProject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [hours, setHours] = useState('4');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notification, setNotification] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'TODO' | 'DONE'>('ALL');

  // Role checks
  const userRole = user?.role || 'EMPLOYEE';
  const userDesig = (user?.designation || '').toLowerCase();
  const userDept = (user?.department || '').toLowerCase();
  const isAdmin = userRole === 'ADMIN' || userDesig.includes('admin') || userDept.includes('admin');
  const isTeamLead = userRole === 'TEAM_LEAD' || (!isAdmin && (userDesig.includes('lead') || userDesig.includes('manager') || userDesig.includes('tl')));
  const isFullStack = !isAdmin && !isTeamLead;

  const loadTimesheetData = async () => {
    const list = getTimesheetTodos();
    setTodos(list);
    try {
      const prjList = await fetchCrmCustomerProjects();
      setProjects(prjList);
      if (prjList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(prjList[0].id);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadTimesheetData();
  }, []);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const selProject = projects.find((p) => p.id === selectedProjectId);
    const newEntry: Partial<TimesheetTodo> = {
      userId: user?.id || 'ems-user',
      userName: user?.fullName || 'Full Stack Engineer',
      employeeId: user?.employeeId || 'EMS-001',
      department: user?.department || 'Software Engineering',
      projectId: selectedProjectId,
      projectName: selProject ? selProject.projectName : 'Core Engineering Platform',
      taskTitle: taskTitle || 'Implementation Task',
      description,
      hours: parseFloat(hours) || 4,
      date,
      completed: false,
    };

    const updated = saveTimesheetTodo(newEntry);
    setTodos(updated);

    // Dispatch System Notifications
    addSystemNotification({
      type: 'TIMESHEET_CREATED',
      title: 'Timesheet Entry Logged',
      message: `${user?.fullName} created timesheet: "${taskTitle || 'Task'}" (${parseFloat(hours) || 4} hrs)`,
      senderId: user?.id || user?.employeeId,
      senderName: user?.fullName || 'Full Stack Engineer',
      recipientRole: 'TEAM_LEAD',
      link: '/timesheet',
    });
    addSystemNotification({
      type: 'TIMESHEET_CREATED',
      title: 'Timesheet Logged',
      message: `You created timesheet: "${taskTitle || 'Task'}" (${parseFloat(hours) || 4} hrs)`,
      senderId: user?.id || user?.employeeId,
      senderName: user?.fullName || 'Full Stack Engineer',
      recipientId: user?.id || user?.employeeId,
      link: '/timesheet',
    });

    setIsModalOpen(false);
    setTaskTitle('');
    setDescription('');
    setHours('4');
    setNotification('New Timesheet TODO item created successfully!');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggle = (id: string) => {
    const updated = toggleTimesheetTodoStatus(id);
    setTodos(updated);
    const target = updated.find((t) => t.id === id);
    if (target) {
      if (target.completed) {
        addSystemNotification({
          type: 'TIMESHEET_DONE',
          title: 'Timesheet Task Completed',
          message: `${user?.fullName} completed timesheet task "${target.taskTitle}"`,
          senderId: user?.id || user?.employeeId,
          senderName: user?.fullName || 'Full Stack Engineer',
          recipientRole: 'TEAM_LEAD',
          link: '/timesheet',
        });
        addSystemNotification({
          type: 'TIMESHEET_DONE',
          title: 'Task Marked Done',
          message: `You marked "${target.taskTitle}" as Done`,
          senderId: user?.id || user?.employeeId,
          senderName: user?.fullName || 'Full Stack Engineer',
          recipientId: user?.id || user?.employeeId,
          link: '/timesheet',
        });
      }

      setNotification(
        target.completed
          ? `TODO "${target.taskTitle}" marked as DONE!`
          : `TODO "${target.taskTitle}" reopened to TODO.`
      );
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDelete = (id: string) => {
    const updated = deleteTimesheetTodo(id);
    setTodos(updated);
  };

  const handleDownloadExcel = () => {
    exportTimesheetReportToExcel(todos, isTeamLead ? user?.fullName : 'Company');
  };

  // Filter items for Full Stack (their own) vs Team Leader / Admin (all or team)
  const displayedTodos = (isFullStack
    ? todos.filter((t) => t.userId === user?.id || t.employeeId === user?.employeeId || t.userName.toLowerCase().includes((user?.fullName || '').toLowerCase()))
    : todos
  ).filter((t) => {
    if (filterStatus === 'TODO') return !t.completed;
    if (filterStatus === 'DONE') return t.completed;
    return true;
  });

  const totalLoggedHours = displayedTodos.reduce((sum, t) => sum + (t.hours || 0), 0);
  const completedCount = displayedTodos.filter((t) => t.completed).length;
  const pendingCount = displayedTodos.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase flex items-center gap-1">
              {isFullStack ? (
                <>
                  <Code2 className="w-3 h-3 inline" /> Full Stack Timesheet & TODO List
                </>
              ) : isTeamLead ? (
                <>
                  <Crown className="w-3 h-3 text-amber-400 inline" /> Team Leader Timesheet & Excel Reporting Hub
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3 h-3 inline" /> Executive Timesheet Management
                </>
              )}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-400" /> Daily Timesheet & Engineering TODO Desk
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {isFullStack
              ? 'Full Stack Developer view: Track daily tasks as a TODO list and mark them Done when completed.'
              : 'Team Leader view: Audit timesheet hours and download clean, formatted Excel reports (.xlsx) with one click.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Working Download Excel Option for Team Leader and Admin */}
          {(isTeamLead || isAdmin) && (
            <button
              onClick={handleDownloadExcel}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Report as Excel (.xlsx)</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Add TODO / Log Hours
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-gray-400 block">Total Logged Hours</span>
            <span className="text-2xl font-black text-indigo-400">{totalLoggedHours.toFixed(1)} hrs</span>
          </div>
          <Clock className="w-8 h-8 text-indigo-500/30" />
        </div>

        <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-emerald-400 block">Completed (Done) TODOs</span>
            <span className="text-2xl font-black text-emerald-400">{completedCount}</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-amber-400 block">Pending TODOs</span>
            <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
          </div>
          <Circle className="w-8 h-8 text-amber-500/30" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
            }`}
          >
            All Items ({displayedTodos.length})
          </button>

          <button
            onClick={() => setFilterStatus('TODO')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'TODO'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
            }`}
          >
            Pending TODOs ({pendingCount})
          </button>

          <button
            onClick={() => setFilterStatus('DONE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'DONE'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
            }`}
          >
            Completed / Done ({completedCount})
          </button>
        </div>
      </div>

      {/* Main Content: Full Stack TODO Checklist vs Team Table */}
      {displayedTodos.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title={isFullStack ? 'No TODO Items In Your Timesheet' : 'No Timesheet Logs Submitted'}
          description={
            isFullStack
              ? 'Click "Add TODO / Log Hours" to add daily tasks, log your hours, and mark them Done as you work.'
              : 'When team members log timesheet tasks, their detailed logs and exportable Excel reports will appear here.'
          }
          actionLabel="Add First TODO"
          onAction={() => setIsModalOpen(true)}
        />
      ) : isFullStack ? (
        /* FULL STACK INTERACTIVE TODO LIST */
        <div className="space-y-3">
          {displayedTodos.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                item.completed
                  ? 'bg-gray-950/40 border-emerald-900/40 opacity-75'
                  : 'bg-gray-900/80 border-gray-800 hover:border-indigo-500/40 shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(item.id);
                  }}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all mt-0.5 shrink-0 ${
                    item.completed
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/30'
                      : 'border-gray-700 bg-gray-950 hover:border-indigo-400 text-transparent'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                </button>

                <div className="space-y-1">
                  <h3
                    className={`text-sm font-bold transition-all ${
                      item.completed ? 'line-through text-gray-500' : 'text-white'
                    }`}
                  >
                    {item.taskTitle}
                  </h3>

                  {item.description && (
                    <p className="text-xs text-gray-400">{item.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 pt-1">
                    <span className="text-indigo-400 font-semibold flex items-center gap-1">
                      <Layers className="w-3 h-3" /> {item.projectName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-500" /> {item.date}
                    </span>
                    <span>•</span>
                    <span className="font-mono font-bold text-emerald-400">{item.hours} hrs</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {item.completed ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> DONE
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                    <Circle className="w-3 h-3" /> TODO
                  </span>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TEAM LEADER & ADMIN TABLE VIEW WITH EXCEL DOWNLOAD */
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Team Timesheet Log & Execution Status
            </h3>
            <button
              onClick={handleDownloadExcel}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" /> Download Excel (.xlsx)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Employee (EMS)</th>
                  <th className="py-3.5 px-6">Project Name</th>
                  <th className="py-3.5 px-6">Task Description / TODO</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Logged Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {displayedTodos.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white font-mono">{e.date}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-white">{e.userName}</p>
                      <p className="text-[10px] text-indigo-400 font-mono">[{e.employeeId}] - {e.department}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-300 font-semibold">{e.projectName}</td>
                    <td className="py-4 px-6 text-gray-300">
                      <p className="font-medium text-white">{e.taskTitle}</p>
                      {e.description && <p className="text-[11px] text-gray-500 truncate max-w-xs">{e.description}</p>}
                    </td>
                    <td className="py-4 px-6">
                      {e.completed ? (
                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          ✓ DONE
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          ○ TODO
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400 text-sm">
                      {e.hours} hrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Timesheet TODO Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Timesheet & Add TODO Item">
        <form onSubmit={handleAddTodo} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Project *</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.projectCode}] {p.projectName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Task / TODO Title *</label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement user authentication & tokens"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Worked Hours *</label>
              <input
                type="number"
                step="0.5"
                required
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g. 4"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Details & Deliverable Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of code implemented, PR links or deliverables..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              Save TODO & Log Hours
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
