'use client';

import React, { useState } from 'react';
import { FileText, Upload, Folder } from 'lucide-react';
import { EmptyState, Modal } from '../../components/ui';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]); // Clean install empty state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docName, setDocName] = useState('');

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: docName,
      category: 'PROJECT',
      size: '2.4 MB',
      date: new Date().toLocaleDateString(),
    };
    setDocuments([newDoc, ...documents]);
    setIsModalOpen(false);
    setDocName('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" /> Agency Document & Media Vault
          </h1>
          <p className="text-xs text-gray-400 mt-1">Company Policies • Project Specifications • Employee Vault • Shared Resources.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Documents Uploaded in Vault"
          description="Upload agency contracts, software design specifications, client SLAs, and company policy documents."
          actionLabel="Upload First Document"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {documents.map((d) => (
            <div key={d.id} className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md space-y-2">
              <h3 className="text-sm font-bold text-white">{d.name}</h3>
              <p className="text-xs text-gray-400">{d.size} • {d.date}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Document">
        <form onSubmit={handleUploadDoc} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Document Name *</label>
            <input
              type="text"
              required
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="e.g. Master Service Agreement 2026.pdf"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              Upload Document
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
