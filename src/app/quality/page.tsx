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
  ExternalLink,
  Shield,
} from 'lucide-react';
import { getErpTasks, verifyQualityTask, ErpTask } from '../../lib/erpStore';
import { fetchQmsTestingItems, syncWithQMS, QmsTestingPayload } from '../../lib/qms';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, Badge, Modal } from '../../components/ui';

import { fetchCrmCustomerProjects } from '../../lib/crm';

export default function QualityPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ErpTask[]>([]);
  const [qmsItems, setQmsItems] = useState<QmsTestingPayload[]>([]);
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<ErpTask | null>(null);
  const [feedback, setFeedback] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadQualityQueue = async () => {
    setLoading(true);
    const [crmProjects, allTasks, qItems] = await Promise.all([
      fetchCrmCustomerProjects(),
      getErpTasks(),
      fetchQmsTestingItems(),
    ]);

    // STRICT CONDITION: Only projects marked 'Done' by the Team Leader route to Quality Testing!
    const queue = allTasks.filter((t) => {
      const isParentDone = crmProjects.some(
        (p) => (p.id === t.projectId || p.projectCode === t.projectCode) && (p.status === 'Done' || p.status === 'COMPLETED')
      );
      const isExplicitQuality = t.id.startsWith('quality-task-');
      return (isParentDone || isExplicitQuality) && (t.status === 'WORK_SUBMITTED' || t.status === 'QUALITY_APPROVED' || t.qualityStatus === 'IN PROCESS' || t.qualityStatus === 'DONE');
    });

    setTasks(queue);
    setQmsItems(qItems);
    setLoading(false);
  };

  useEffect(() => {
    loadQualityQueue();
  }, []);

  const handleQualityVerify = async (taskId: string, newQualityStatus: 'IN PROCESS' | 'DONE') => {
    const testerName = user?.fullName || 'Quality Auditor / AGM Quality';
    const updated = verifyQualityTask(taskId, newQualityStatus, testerName, feedback);
    
    setTasks(
      updated.filter(
        (t) => t.status === 'WORK_SUBMITTED' || t.status === 'QUALITY_APPROVED' || t.qualityStatus === 'IN PROCESS' || t.qualityStatus === 'DONE'
      )
    );

    const targetTask = updated.find((t) => t.id === taskId);
    if (targetTask) {
      await syncWithQMS({
        projectCode: targetTask.projectCode || 'PRJ-QA',
        projectName: targetTask.projectName,
        customerName: 'Valued Client',
        departmentScope: targetTask.assigneeDept || 'Quality Assurance & QA',
        submittedByTl: testerName,
        requirements: targetTask.submittedWork || targetTask.title,
        testingStatus: newQualityStatus,
        qualityFeedback: feedback,
        submittedAt: new Date().toISOString(),
      });
    }

    setNotification(
      newQualityStatus === 'DONE'
        ? 'Quality testing verified & marked DONE! Synced to QMS Backend (https://pjsofonic-qms.onrender.com).'
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
            <span className="px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-xs font-bold uppercase flex items-center gap-1">
              <Shield className="w-3 h-3 inline" /> Quality Department & QMS Testing Hub
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" /> Quality Department Testing Queue
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            When Team Leader marks project status as DONE, it automatically transfers here to Quality Department for verification & QMS sync.
          </p>
        </div>

        <button
          onClick={loadQualityQueue}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs border border-gray-700 transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync QMS Testing Queue</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* QMS Backend Host Indicator */}
      <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase text-rose-400 tracking-wider block">QMS Host Live Sync</span>
          <span className="font-bold text-white text-xs">https://pjsofonic-qms.onrender.com</span>
          <p className="text-gray-300 text-[11px] mt-0.5">
            Team Leader completed projects & Quality verification statuses sync live with the QMS backend.
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-rose-400 shrink-0" />
      </div>

      {/* Quality Testing Queue Table */}
      {tasks.length === 0 && qmsItems.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Projects Pending Quality Testing"
          description="When Team Leaders set project status to 'Done' on the Projects page, projects automatically route directly into this Quality Department testing queue."
          actionLabel="Sync Live QMS Backend"
          onAction={loadQualityQueue}
        />
      ) : (
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" /> Quality Testing Real-Time Queue
            </h3>
            <span className="text-xs text-gray-400">Total Testing Items: <strong className="text-white">{tasks.length + qmsItems.length}</strong></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-6">Project / Task Title</th>
                  <th className="py-3.5 px-6">Assigned Team / TL</th>
                  <th className="py-3.5 px-6">Testing Requirements / Notes</th>
                  <th className="py-3.5 px-6">Quality Status</th>
                  <th className="py-3.5 px-6 text-right">Quality Action</th>
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
                        <span className="text-gray-500 italic">TL submitted work</span>
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
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Quality DONE
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

                {/* Additional Items Synced from QMS */}
                {qmsItems.map((qItem, idx) => (
                  <tr key={qItem.id || `qms-${idx}`} className="hover:bg-gray-900/40 transition-colors bg-rose-950/10">
                    <td className="py-4 px-6 font-bold text-white">
                      <div>{qItem.projectName}</div>
                      <span className="text-[10px] text-rose-400 font-mono font-semibold">{qItem.projectCode}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      <p className="font-bold text-white">{qItem.submittedByTl || 'Team Leader'}</p>
                      <p className="text-[10px] text-gray-500">{qItem.departmentScope}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-300 max-w-xs truncate">
                      <span className="italic bg-gray-950 px-2 py-1 rounded border border-gray-800 block truncate">
                        "{qItem.requirements || 'Project scope sent to Quality testing'}"
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={qItem.testingStatus === 'DONE' ? 'success' : 'warning'}>
                        {qItem.testingStatus || 'IN PROCESS'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        QMS SYNCED
                      </span>
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
        title="Quality Department Inspection & Review"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
            <p className="text-gray-400">Task / Project: <strong className="text-white">{selectedTaskForReview?.projectName}</strong></p>
            <p className="text-gray-400">Team Leader / Assignee: <strong className="text-emerald-400">{selectedTaskForReview?.assigneeName}</strong> ({selectedTaskForReview?.assigneeDept})</p>
          </div>

          <div>
            <h5 className="font-bold text-gray-300 uppercase mb-1">Testing Requirements & Submission Scope:</h5>
            <div className="p-3.5 rounded-xl bg-gray-950 border border-gray-800 text-gray-200 leading-relaxed font-mono">
              {selectedTaskForReview?.submittedWork || 'Team Leader marked project status as DONE.'}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-300 uppercase mb-1">Quality Auditor Feedback / Review Notes</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add Quality department testing feedback or audit notes..."
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
