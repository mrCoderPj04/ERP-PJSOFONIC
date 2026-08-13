'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  UserCheck,
  Building,
  Sparkles,
  RefreshCw,
  Send,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { fetchEmsEmployees, EmsUser } from '@/lib/ems';
import { getErpTasks, saveErpTask, submitWorkForTask, ErpTask } from '@/lib/erpStore';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ErpTask[]>([]);
  const [registeredStaff, setRegisteredStaff] = useState<EmsUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [dueDate, setDueDate] = useState('');

  // Submit Work Modal State (Condition 2 Flow)
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState<ErpTask | null>(null);
  const [workSubmissionText, setWorkSubmissionText] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const staff = await fetchEmsEmployees();
    setRegisteredStaff(staff);
    setTasks(getErpTasks());
    if (staff.length > 0) {
      setAssigneeId(staff[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUser = registeredStaff.find((s) => s.id === assigneeId) || registeredStaff[0];

    const newTask: ErpTask = {
      id: `task-${Date.now()}`,
      title,
      projectName: projectName || 'Core Platform Project',
      assigneeId: assignedUser ? assignedUser.id : 'ems-01',
      assigneeName: assignedUser ? assignedUser.fullName : (user?.fullName || 'EMS Engineer'),
      assigneeEmail: assignedUser ? assignedUser.email : user?.email,
      assigneeDept: assignedUser ? assignedUser.department : (user?.department || 'Software Engineering'),
      priority,
      status: 'TODO',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    const updated = saveErpTask(newTask);
    setTasks(updated);
    setIsCreateModalOpen(false);
    setTitle('');
    setProjectName('');
    setNotification(`Task "${title}" created and assigned to ${newTask.assigneeName}`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleMoveStatus = (taskId: string, nextStatus: ErpTask['status']) => {
    const existing = getErpTasks();
    const updated = existing.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t));
    localStorage.setItem('pj_erp_tasks_store', JSON.stringify(updated));
    setTasks(updated);
  };

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForSubmit || !workSubmissionText.trim()) return;

    // Condition 2: Work Submitted -> Auto Route to Quality & AGM Quality Dept Queue
    const updated = submitWorkForTask(selectedTaskForSubmit.id, workSubmissionText);
    setTasks(updated);

    setNotification(
      `Work submitted successfully for "${selectedTaskForSubmit.title}"! Auto-routed to Quality & AGM Quality Testing Queue.`
    );
    setTimeout(() => setNotification(null), 5000);

    setSelectedTaskForSubmit(null);
    setWorkSubmissionText('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase">
              Real-Time Task Execution Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-400" /> Engineering Tasks & Work Submissions
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Assigned tasks execution flow: TODO → IN_PROGRESS → WORK_SUBMITTED (Auto-routes to Quality & AGM Quality Testing).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs border border-gray-700 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync EMS Staff</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Create New Task
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Workflow Guidance Card */}
      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/30 text-xs flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-white mb-0.5">Condition 2: Quality & AGM Quality Testing Auto-Routing Rule</h4>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            When you complete a task and click <strong className="text-amber-400">"Submit Work for Quality Testing"</strong>, the task status changes to <strong className="text-indigo-400 font-mono font-bold">WORK_SUBMITTED</strong> and it auto-routes directly into the <strong className="text-rose-400">Quality & AGM Quality Testing Queue</strong> for verification.
          </p>
        </div>
      </div>

      {/* Tasks Table / List */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No Active Tasks in Pipeline"
          description="Create a task above or break down an approved CRM customer project from the Projects page to populate tasks."
          actionLabel="Create First Task"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Task Execution List</h3>
            <span className="text-xs text-gray-400">Total Tasks: <strong className="text-white">{tasks.length}</strong></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-6">Task Title & Project</th>
                  <th className="py-3.5 px-6">Assigned Engineer (EMS)</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions / Submission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="py-4 px-6">
                      <h4 className="font-bold text-white text-sm">{task.title}</h4>
                      <span className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Layers className="w-3 h-3" /> {task.projectName}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-gray-200">{task.assigneeName}</p>
                      <p className="text-[10px] text-gray-500">{task.assigneeDept}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                          task.priority === 'CRITICAL'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : task.priority === 'HIGH'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge
                        variant={
                          task.status === 'QUALITY_APPROVED'
                            ? 'success'
                            : task.status === 'WORK_SUBMITTED'
                            ? 'danger'
                            : task.status === 'IN_PROGRESS'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {task.status === 'WORK_SUBMITTED' ? 'IN QUALITY QUEUE' : task.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {task.status === 'TODO' && (
                        <button
                          onClick={() => handleMoveStatus(task.id, 'IN_PROGRESS')}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all"
                        >
                          Start Work (IN_PROGRESS)
                        </button>
                      )}

                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => setSelectedTaskForSubmit(task)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Work to Quality →
                        </button>
                      )}

                      {task.status === 'WORK_SUBMITTED' && (
                        <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold inline-flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Pending Quality Testing
                        </span>
                      )}

                      {task.status === 'QUALITY_APPROVED' && (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Quality Approved & Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Engineering Task"
        maxWidth="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build Auth Middleware for EMS API"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. PJSOFONIC ERP Core System"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Assign EMS Registered Staff</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {registeredStaff.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    [{staff.employeeId}] {staff.fullName} - {staff.department} ({staff.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg"
            >
              Create & Assign Task
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Work Modal (Condition 2) */}
      <Modal
        isOpen={!!selectedTaskForSubmit}
        onClose={() => setSelectedTaskForSubmit(null)}
        title="Submit Completed Work to Quality & AGM Quality Testing Queue"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitWork} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-1">
            <p className="text-gray-400">Task Title: <strong className="text-white">{selectedTaskForSubmit?.title}</strong></p>
            <p className="text-gray-400">Assigned Engineer: <strong className="text-indigo-400">{selectedTaskForSubmit?.assigneeName}</strong></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">
              Work Submission Notes & Implementation Details *
            </label>
            <textarea
              required
              rows={4}
              value={workSubmissionText}
              onChange={(e) => setWorkSubmissionText(e.target.value)}
              placeholder="Provide PR links, test evidence, or implementation summary for the Quality & AGM Quality Testing team..."
              className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/30 text-[11px] text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Submitting will route this task directly under Quality & AGM Quality Testing for verification.</span>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setSelectedTaskForSubmit(null)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit to Quality Testing
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
