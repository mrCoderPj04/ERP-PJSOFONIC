'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  TrendingUp,
  FileText,
  CreditCard,
  PieChart,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';

export default function FinancePage() {
  const [invoices, setInvoices] = useState<any[]>([]); // Clean install empty state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // New Invoice Form
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [amount, setAmount] = useState('');

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv = {
      id: `inv-${Date.now()}`,
      number: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName,
      projectName,
      amount: parseFloat(amount) || 5000,
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };
    setInvoices([newInv, ...invoices]);
    setIsInvoiceModalOpen(false);
    setClientName('');
    setAmount('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase">
              Financial Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" /> Agency Finance & Billing Hub
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Client → Project → Quotation → Invoice → Payment → Revenue & Expense Profit/Loss Audit.
          </p>
        </div>

        <button
          onClick={() => setIsInvoiceModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Financial Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Invoiced Revenue</span>
          <p className="text-3xl font-black text-emerald-400 mt-2">
            ${invoices.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Expenses</span>
          <p className="text-3xl font-black text-rose-400 mt-2">$0.00</p>
        </div>
        <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Profit Margin</span>
          <p className="text-3xl font-black text-indigo-400 mt-2">100%</p>
        </div>
      </div>

      {/* Invoices List or Empty State */}
      {invoices.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No Financial Records or Invoices"
          description="Track client quotations, project billing, revenue streams, and software development expense allocations."
          actionLabel="Generate First Invoice"
          onAction={() => setIsInvoiceModalOpen(true)}
        />
      ) : (
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Issued Invoices</h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-bold uppercase text-[10px]">
                <th className="py-3.5 px-6">Invoice Number</th>
                <th className="py-3.5 px-6">Client Name</th>
                <th className="py-3.5 px-6">Project</th>
                <th className="py-3.5 px-6">Total Amount</th>
                <th className="py-3.5 px-6">Due Date</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-900/40">
                  <td className="py-4 px-6 font-mono font-bold text-indigo-400">{inv.number}</td>
                  <td className="py-4 px-6 font-bold text-white">{inv.clientName}</td>
                  <td className="py-4 px-6 text-gray-300">{inv.projectName}</td>
                  <td className="py-4 px-6 font-bold text-emerald-400">${inv.amount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-gray-400">{inv.dueDate}</td>
                  <td className="py-4 px-6 text-right">
                    <Badge variant="warning">{inv.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Generate Client Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Client Name *</label>
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. NeoBank Global Corp"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Mobile App Milestone 1"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Invoice Amount ($) *</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 12500"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg">
              Create & Issue Invoice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
