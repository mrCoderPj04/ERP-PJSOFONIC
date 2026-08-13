'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Plus, Clock } from 'lucide-react';
import { EmptyState, Modal } from '../../components/ui';

export default function TimesheetPage() {
  const [entries, setEntries] = useState<any[]>([]); // Clean install empty state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [hours, setHours] = useState('');

  const handleAddTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: `ts-${Date.now()}`,
      projectName: projectName || 'Core Platform',
      hours: parseFloat(hours) || 4,
      date: new Date().toLocaleDateString(),
    };
    setEntries([newEntry, ...entries]);
    setIsModalOpen(false);
    setHours('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-400" /> Daily Project & Task Timesheets
          </h1>
          <p className="text-xs text-gray-400 mt-1">Log task hours, billable project client time, and productivity breakdowns.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Log Task Hours
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No Timesheet Logs Submitted"
          description="Log daily project execution hours against assigned tasks for manager review and billable time auditing."
          actionLabel="Log Timesheet Hours"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Project Name</th>
                <th className="py-3.5 px-6 text-right">Logged Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-900/40">
                  <td className="py-4 px-6 font-bold text-white">{e.date}</td>
                  <td className="py-4 px-6 text-gray-300">{e.projectName}</td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-indigo-400">{e.hours} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Daily Task Hours">
        <form onSubmit={handleAddTimesheet} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. NeoBank Banking Portal"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Worked Hours *</label>
            <input
              type="number"
              step="0.5"
              required
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 6.5"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              Log Hours
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
