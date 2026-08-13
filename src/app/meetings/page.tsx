'use client';

import React, { useState } from 'react';
import { Video, Plus, Calendar, Clock } from 'lucide-react';
import { EmptyState, Modal } from '../../components/ui';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]); // Clean install empty state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const newMeeting = {
      id: `mtg-${Date.now()}`,
      title,
      time: '11:00 AM - 12:00 PM',
      link: 'https://meet.google.com/pjsofonic-sync',
    };
    setMeetings([newMeeting, ...meetings]);
    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-indigo-400" /> Agency Meetings & Sync Scheduler
          </h1>
          <p className="text-xs text-gray-400 mt-1">Upcoming Meetings → Virtual Rooms → Meeting Notes & Action Items.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      {meetings.length === 0 ? (
        <EmptyState
          icon={Video}
          title="No Scheduled Meetings"
          description="Schedule client kickoffs, daily project scrums, code reviews, and management alignment sessions."
          actionLabel="Schedule First Meeting"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {meetings.map((m) => (
            <div key={m.id} className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-2">
              <h3 className="text-base font-bold text-white">{m.title}</h3>
              <p className="text-xs text-indigo-400 font-mono">{m.time}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Agency Meeting">
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Meeting Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily Sprint Scrum Sync"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              Schedule & Notify
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
