'use client';

import React, { useState } from 'react';
import { Building2, Plus, Mail, Phone, Globe, FolderKanban } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]); // Clean install empty state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient = {
      id: `client-${Date.now()}`,
      companyName,
      contactName,
      email,
      projectsCount: 1,
      status: 'ACTIVE',
    };
    setClients([newClient, ...clients]);
    setIsModalOpen(false);
    setCompanyName('');
    setEmail('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-sky-400" /> Client Directory & Profiles
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage corporate clients, project requirements, contracts, and communication history.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Client
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Client Directory Records Found"
          description="Register client profiles to link agency projects, issue milestone quotations, and send automated billing invoices."
          actionLabel="Add First Client Profile"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((c) => (
            <div key={c.id} className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-3">
              <h3 className="text-base font-bold text-white">{c.companyName}</h3>
              <p className="text-xs text-gray-400">Contact: {c.contactName}</p>
              <p className="text-xs text-indigo-400">{c.email}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Client">
        <form onSubmit={handleCreateClient} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. NeoBank Global"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Contact Person</label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@neobank.com"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-lg">
              Save Client Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
