'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, DollarSign, Building2, Mail, Layers, CheckCircle2, Shield, UserCheck, Send } from 'lucide-react';
import { EmptyState, Modal, Badge } from '../../components/ui';
import { saveCrmProject, fetchCrmCustomerProjects, CrmCustomerProject } from '../../lib/crm';
import { fetchEmsEmployees, EmsUser } from '../../lib/ems';

export default function CrmPage() {
  const [projects, setProjects] = useState<CrmCustomerProject[]>([]);
  const [teamLeaders, setTeamLeaders] = useState<EmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [departmentScope, setDepartmentScope] = useState('Software Engineering');
  const [targetTlId, setTargetTlId] = useState('');
  const [requirements, setRequirements] = useState('');
  const [value, setValue] = useState('');

  const checkIsTeamLeader = (emp: EmsUser): boolean => {
    const d = (emp.designation || '').toUpperCase();
    const dept = (emp.department || '').toUpperCase();
    const r = (emp.role || '').toUpperCase();

    return (
      r === 'TEAM_LEAD' ||
      r.includes('LEAD') ||
      r.includes('TL') ||
      r.includes('MANAGER') ||
      d.includes('LEAD') ||
      d.includes('LEADER') ||
      d.includes('TL') ||
      d.includes('MANAGER') ||
      d.includes('HEAD') ||
      dept.includes('LEAD') ||
      dept.includes('LEADER') ||
      dept.includes('TL') ||
      dept.includes('TEAM LEAD') ||
      dept.includes('TEAM LEADER') ||
      dept.includes('MANAGEMENT')
    );
  };

  const loadData = async () => {
    setLoading(true);
    const [crmData, empData] = await Promise.all([
      fetchCrmCustomerProjects(),
      fetchEmsEmployees(),
    ]);
    setProjects(crmData);
    const tls = empData.filter((e) => checkIsTeamLeader(e));
    setTeamLeaders(tls.length > 0 ? tls : empData);
    if (tls.length > 0 && !targetTlId) {
      setTargetTlId(tls[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTl = teamLeaders.find((t) => t.id === targetTlId) || teamLeaders[0];

    const newProj = {
      projectName: title,
      customerName: customerName || 'Valued CRM Client',
      customerEmail: customerEmail || 'client@crm.com',
      departmentScope: departmentScope || selectedTl?.department || 'Software Engineering',
      targetTeamLeadId: selectedTl?.id,
      targetTeamLeadName: selectedTl ? `${selectedTl.fullName} (${selectedTl.department})` : 'Department Team Leader',
      requirements: requirements || 'Approved project scope submitted in CRM Admin Hub.',
      budget: parseFloat(value) || 25000,
      status: 'ACTIVE' as const,
    };

    saveCrmProject(newProj);
    loadData();
    setIsModalOpen(false);

    // Reset Form
    setTitle('');
    setCustomerName('');
    setCustomerEmail('');
    setRequirements('');
    setValue('');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3 h-3 inline" /> CRM Admin Control Panel
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-400" /> CRM Admin Project Hub → ERP Team Leader Dispatch
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Projects created & updated by CRM Admin auto-dispatch to Team Leader profiles in ERP for execution.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Admin Create/Update Project
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-gray-900/40 border border-gray-800">
          <div className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs text-gray-400">Loading real-time active CRM projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No Active CRM Projects Created by Admin"
          description="Create real active projects here in CRM Admin Hub. They will auto-fetch directly on the Team Leader's profile in ERP."
          actionLabel="Admin Create Active CRM Project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div key={p.id} className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                    {p.projectCode}
                  </span>
                  <Badge variant="success">ADMIN ACTIVE</Badge>
                </div>
                <h3 className="text-base font-bold text-white">{p.projectName}</h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-500 shrink-0" /> Client: {p.customerName}
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-gray-950/80 border border-gray-800 text-xs space-y-1">
                  <div className="flex justify-between text-gray-400">
                    <span>Department Scope:</span>
                    <span className="text-indigo-400 font-semibold">{p.departmentScope}</span>
                  </div>
                  {p.targetTeamLeadName && (
                    <div className="flex justify-between text-gray-400">
                      <span>Target TL:</span>
                      <span className="text-amber-400 font-bold">{p.targetTeamLeadName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Budget ($):</span>
                    <span className="text-emerald-400 font-bold">${p.budget.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-2.5 line-clamp-2 italic bg-gray-950/40 p-2 rounded-lg">
                  "{p.requirements}"
                </p>
              </div>

              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Send className="w-3 h-3 text-indigo-400" /> Dispatched to ERP TL Profile
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="CRM Admin - Create/Update Active Project for Team Leader">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fintech Payment Gateway Architecture"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Client Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Apex Global Corp"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Client Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. client@apex.com"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Target Department Scope</label>
              <select
                value={departmentScope}
                onChange={(e) => setDepartmentScope(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Software Engineering">Software Engineering</option>
                <option value="Mobile Engineering">Mobile Engineering</option>
                <option value="Quality Assurance & QA">Quality Assurance & QA</option>
                <option value="UI/UX Product Design">UI/UX Product Design</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Target ERP Team Leader</label>
              <select
                value={targetTlId}
                onChange={(e) => setTargetTlId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {teamLeaders.map((tl) => (
                  <option key={tl.id} value={tl.id}>
                    {tl.fullName} - {tl.department} ({tl.designation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Project Budget ($) *</label>
            <input
              type="number"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 45000"
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Requirements & Scope for Team Leader</label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Detail the active project scope for ERP Team Leader breakdown..."
              className="w-full px-4 py-2.5 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg">
              Dispatch to Team Leader Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


