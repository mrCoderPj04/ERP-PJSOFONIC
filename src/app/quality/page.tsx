'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Play,
  Check,
  Search,
  Sparkles,
  Building,
  RefreshCw,
  FileText,
  UserCheck,
} from 'lucide-react';
import { getErpTasks, verifyQualityTask, ErpTask } from '@/lib/erpStore';
import { useAuth } from '@/context/AuthContext';
import { EmptyState, Badge, Modal } from '../../components/ui';

export default function QualityPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ErpTask[]>([]);
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<ErpTask | null>(null);
  const [feedback, setFeedback] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const loadQualityQueue = () => {
    const allTasks = getErpTasks();
    // Filter tasks that have been submitted for quality testing or approved
    const queue = allTasks.filter(
      (t) => t.status === 'WORK_SUBMITTED' || t.status === 'QUALITY_APPROVED' || t.qualityStatus === 'IN PROCESS' || t.qualityStatus === 'DONE'
    );
    setTasks(queue);
  };

  useEffect(() => {
    loadQualityQueue();
  }, []);

  const handleQualityVerify = (taskId: string, newQualityStatus: 'IN PROCESS' | 'DONE') => {
    const testerName = user?.fullName || 'Quality Auditor / AGM Quality';
    const updated = verifyQualityTask(taskId, newQualityStatus, testerName, feedback);
    setTasks(
      updated.filter(
        (t) => t.status === 'WORK_SUBMITTED' || t.status === 'QUALITY_APPROVED' || t.qualityStatus === 'IN PROCESS' || t.qualityStatus === 'DONE'
      )
    );

    setNotification(
      newQualityStatus === 'DONE'
        ? 'Quality testing verified & marked DONE successfully!'
        : 'Quality task status updated to IN PROCESS.'
    );
    setTimeout(() => setNotification(null), 4000);
    setSelectedTaskForReview(null);
    setFeedback('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-xs font-bold uppercase">
              Condition 2: Quality & AGM Quality Testing Queue
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" /> Quality & AGM Quality Testing Department
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            When tasks transition from IN_PROGRESS → SUBMITTED, they automatically route directly here to Quality / AGM Quality staff for test verification.
          </p>
        </div>

        <button
          onClick={loadQualityQueue}
          className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs border border-gray-700 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Quality Queue</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Testing Workflow Rules Card */}
      <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 text-xs flex items-center justify-between">
        <div>
          <h4 className="font-bold text-white mb-0.5">Strict Testing Status Rules</h4>
          <p className="text-gray-300 text-[11px]">
            Quality items are managed under strict verification statuses: <strong className="text-amber-400 font-mono font-bold">IN PROCESS</strong> and <strong className="text-emerald-400 font-mono font-bold">DONE</strong>.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-bold border border-rose-500/20">
          Quality & AGM Quality Dept
        </span>
      </div>

      {/* Quality Testing Queue Table */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Submitted Tasks Pending Quality Testing"
          description="When engineers complete assigned tasks and click 'Submit Work to Quality' on the Tasks page, they will automatically appear in this queue for Quality & AGM Quality verification."
        />
      ) : (
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quality Testing Real-Time Queue</h3>
            <span className="text-xs text-gray-400">Total Items: <strong className="text-white">{tasks.length}</strong></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-6">Task / Project Title</th>
                  <th className="py-3.5 px-6">Developer Name (EMS)</th>
                  <th className="py-3.5 px-6">Submitted Work Notes</th>
                  <th className="py-3.5 px-6">Testing Status</th>
                  <th className="py-3.5 px-6 text-right">Testing Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {tasks.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <div>{item.title}</div>
                      <span className="text-[10px] text-indigo-400 font-mono font-semibold">{item.projectName}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      <p className="font-bold text-white">{item.assigneeName}</p>
                      <p className="text-[10px] text-gray-500">{item.assigneeDept}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-300 max-w-xs truncate">
                      {item.submittedWork ? (
                        <span className="italic bg-gray-950 px-2 py-1 rounded border border-gray-800 block truncate">
                          "{item.submittedWork}"
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Work submitted</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={item.qualityStatus === 'DONE' ? 'success' : 'warning'}>
                        {item.qualityStatus || 'IN PROCESS'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedTaskForReview(item)}
                        className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold mr-1"
                      >
                        Inspect Submission
                      </button>

                      {item.qualityStatus !== 'DONE' ? (
                        <button
                          onClick={() => handleQualityVerify(item.id, 'DONE')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Quality Testing DONE
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQualityVerify(item.id, 'IN PROCESS')}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-amber-400 text-xs font-semibold"
                        >
                          Reopen to IN PROCESS
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Submission Modal */}
      <Modal
        isOpen={!!selectedTaskForReview}
        onClose={() => setSelectedTaskForReview(null)}
        title="Quality & AGM Quality Code / Work Inspection"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <p className="text-gray-400">Task Title: <strong className="text-white">{selectedTaskForReview?.title}</strong></p>
            <p className="text-gray-400">Project: <strong className="text-indigo-400">{selectedTaskForReview?.projectName}</strong></p>
            <p className="text-gray-400">Engineer: <strong className="text-emerald-400">{selectedTaskForReview?.assigneeName}</strong> ({selectedTaskForReview?.assigneeDept})</p>
            {selectedTaskForReview?.submittedAt && (
              <p className="text-gray-500 text-[10px]">Submitted At: {new Date(selectedTaskForReview.submittedAt).toLocaleString()}</p>
            )}
          </div>

          <div>
            <h5 className="font-bold text-gray-300 uppercase mb-1">Engineer Submission Notes:</h5>
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-200 leading-relaxed font-mono">
              {selectedTaskForReview?.submittedWork || 'No detailed submission notes provided.'}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">Quality Verification Feedback / Review Notes</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add testing feedback or QA approval notes..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              onClick={() => setSelectedTaskForReview(null)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 font-semibold"
            >
              Close
            </button>

            <button
              onClick={() => selectedTaskForReview && handleQualityVerify(selectedTaskForReview.id, 'DONE')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve & Mark Quality DONE
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
