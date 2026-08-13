'use client';

import React, { useState } from 'react';
import { TrendingUp, Plus, DollarSign, Send, CheckCircle } from 'lucide-react';
import { EmptyState, Modal } from '../../components/ui';

export default function CrmPage() {
  const [leads, setLeads] = useState<any[]>([]); // Clean install empty state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const newLead = {
      id: `lead-${Date.now()}`,
      title,
      value: parseFloat(value) || 25000,
      status: 'QUALIFIED',
    };
    setLeads([newLead, ...leads]);
    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-400" /> CRM & Sales Pipeline Hub
          </h1>
          <p className="text-xs text-gray-400 mt-1">Leads → Opportunities → Proposals → Quotations → Project Conversions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Sales Lead
        </button>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No Sales Pipeline Leads Logged"
          description="Track incoming agency inquiries, client proposals, software quotations, and sales follow-ups."
          actionLabel="Create Sales Lead"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {leads.map((l) => (
            <div key={l.id} className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-2">
              <h3 className="text-sm font-bold text-white">{l.title}</h3>
              <p className="text-lg font-black text-emerald-400">${l.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Sales Opportunity Lead">
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Opportunity Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fintech Mobile App Redesign Proposal"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Estimated Deal Value ($) *</label>
            <input
              type="number"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 45000"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              Save Sales Lead
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
