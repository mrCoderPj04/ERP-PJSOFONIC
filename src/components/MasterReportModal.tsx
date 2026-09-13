'use client';

import React from 'react';
import {
  CrmCustomerProject,
  MasterEngineeringReport,
} from '../lib/crm';
import { Modal, Badge } from './ui';
import {
  Printer,
  FileText,
  CheckCircle2,
  Code2,
  Server,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Award,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MasterReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CrmCustomerProject | null;
  currentUser: any;
  activeTab: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  setActiveTab: (tab: 'A' | 'B' | 'C' | 'D' | 'E' | 'F') => void;
  draft: MasterEngineeringReport | null;
  onSaveSection: (partKey: 'partA_FullStack' | 'partB_DevOps' | 'partC_AiEngineering' | 'partD_Quality' | 'partE_BugBounty' | 'partF_Closure') => void;
  signName: string;
  setSignName: (v: string) => void;
  signRole: string;
  setSignRole: (v: string) => void;
  signSignature: string;
  setSignSignature: (v: string) => void;
  onExportPdf: () => void;
  isAdmin: boolean;
  isManager: boolean;
  isQualityHead: boolean;
  isCyberHead: boolean;
}

export function MasterReportModal({
  isOpen,
  onClose,
  project,
  currentUser,
  activeTab,
  setActiveTab,
  draft,
  onSaveSection,
  signName,
  setSignName,
  signRole,
  setSignRole,
  signSignature,
  setSignSignature,
  onExportPdf,
  isAdmin,
  isManager,
  isQualityHead,
  isCyberHead,
}: MasterReportModalProps) {
  if (!project || !draft) return null;

  const {
    docInfo,
    partA_FullStack,
    partB_DevOps,
    partC_AiEngineering,
    partD_Quality,
    partE_BugBounty,
    partF_Closure,
  } = draft;

  const tabs: Array<{
    id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
    label: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
    isSigned: boolean;
  }> = [
    {
      id: 'A',
      label: 'Part A: Full Stack',
      sub: 'Sec 1 - 5',
      icon: <Code2 className="w-4 h-4" />,
      color: 'text-cyan-400',
      isSigned: Boolean(partA_FullStack.engineerSignoff?.signature),
    },
    {
      id: 'B',
      label: 'Part B: DevOps',
      sub: 'Sec 6 - 9',
      icon: <Server className="w-4 h-4" />,
      color: 'text-emerald-400',
      isSigned: Boolean(partB_DevOps.devopsSignoff?.signature),
    },
    {
      id: 'C',
      label: 'Part C: AI Eng.',
      sub: 'Sec 10 - 13',
      icon: <Cpu className="w-4 h-4" />,
      color: 'text-purple-400',
      isSigned: Boolean(partC_AiEngineering.aiSignoff?.signature),
    },
    {
      id: 'D',
      label: 'Part D: Quality',
      sub: 'Sec 14 - 17',
      icon: <ShieldAlert className="w-4 h-4" />,
      color: 'text-rose-400',
      isSigned: Boolean(partD_Quality.qaLeadSignoff?.signature || partD_Quality.qualityHeadSignoff?.approved),
    },
    {
      id: 'E',
      label: 'Part E: Security',
      sub: 'Sec 18 - 20',
      icon: <Lock className="w-4 h-4" />,
      color: 'text-violet-400',
      isSigned: Boolean(partE_BugBounty.securityLeadSignoff?.signature || partE_BugBounty.cyberHeadSignoff?.approved),
    },
    {
      id: 'F',
      label: 'Part F: Closure',
      sub: 'Sec 21 - 24',
      icon: <Crown className="w-4 h-4" />,
      color: 'text-amber-400',
      isSigned: Boolean(partF_Closure.closureDeclaration?.finalClosureDate),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`13-Page Master Engineering Report — ${project.projectCode}`}
      maxWidth="5xl"
    >
      <div className="space-y-5 text-xs text-gray-300 max-h-[82vh] overflow-y-auto pr-1">
        {/* Top Header Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px] border border-indigo-500/30">
                {docInfo.reportId || 'MRE-' + project.projectCode}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                {docInfo.projectStatus || 'Certified Production'}
              </span>
            </div>
            <h3 className="text-base font-black text-white mt-1">
              {project.projectName}
            </h3>
            <p className="text-gray-400 text-xs">
              Client: {project.customerName} • Classification: {docInfo.classification} • Target: Multi-Cloud Production
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onExportPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg"
              title="Generate and print complete 13-Page corporate Master Engineering Dossier PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Export 13-Page Master PDF</span>
            </button>
          </div>
        </div>

        {/* 6 Parts Tab Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`p-2.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                  isActive
                    ? 'bg-gray-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-gray-950/70 border-gray-800 hover:border-gray-700 hover:bg-gray-900/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`${t.color}`}>{t.icon}</span>
                  {t.isSigned ? (
                    <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                      ✓ Signed
                    </span>
                  ) : (
                    <span className="text-[9px] text-gray-500">Pending</span>
                  )}
                </div>
                <div className="mt-2">
                  <span className="font-bold text-white block text-[11px] truncate">{t.label}</span>
                  <span className="text-[10px] text-gray-400">{t.sub}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* TAB A: FULL STACK ENGINEERING */}
        {activeTab === 'A' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-cyan-300 text-sm">PART A — Project &amp; Full Stack Engineering</h4>
                <p className="text-gray-400 text-xs">Sections 1 to 5: Executive Summary, Scope Matrix, Full Stack Scope, System Architecture &amp; ERP/EMS Integration.</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold text-[10px]">
                Pages 3 &amp; 4 of Dossier
              </span>
            </div>

            {/* Sec 1: Executive Summary */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">1. Executive Summary Overview</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Outcome</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{partA_FullStack.executiveSummary.projectOutcome}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Delivery</span>
                  <div className="font-bold text-white mt-0.5">{partA_FullStack.executiveSummary.overallDelivery}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Budget Adherence</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{partA_FullStack.executiveSummary.budgetAdherence}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Timeline</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{partA_FullStack.executiveSummary.timelineAdherence}</div>
                </div>
              </div>
              <p className="text-xs text-gray-300 bg-gray-900/60 p-3 rounded-lg border border-gray-800">
                {partA_FullStack.executiveSummary.overviewText}
              </p>
            </div>

            {/* Sec 2: Scope & Deliverables Matrix */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">2. Scope &amp; Deliverables Matrix (Tasks 1 to 12)</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-1.5 px-2">Task</th>
                      <th className="py-1.5 px-2">Requirement Item</th>
                      <th className="py-1.5 px-2">Work Product Deliverable</th>
                      <th className="py-1.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-gray-300">
                    {partA_FullStack.scopeDeliverables.map((d) => (
                      <tr key={d.taskNo}>
                        <td className="py-1.5 px-2 font-bold text-cyan-400">Task {d.taskNo}</td>
                        <td className="py-1.5 px-2">{d.requirement}</td>
                        <td className="py-1.5 px-2 text-gray-400">{d.deliverable}</td>
                        <td className="py-1.5 px-2 text-emerald-400 font-bold">✓ {d.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sec 4: Architecture & 5: ERP/EMS Integration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider">4. System Architecture Layers</h5>
                <div className="space-y-1.5 font-mono text-[10px]">
                  {partA_FullStack.systemArchitecture.map((s, idx) => (
                    <div key={idx} className="p-2 rounded bg-gray-900 border border-gray-800 flex justify-between">
                      <span className="font-bold text-cyan-300">{s.layer}</span>
                      <span className="text-gray-300">{s.technology}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider">5. ERP &amp; EMS Deep Integration</h5>
                <div className="space-y-1.5 font-mono text-[10px]">
                  {partA_FullStack.integrations.map((i, idx) => (
                    <div key={idx} className="p-2 rounded bg-gray-900 border border-gray-800 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-indigo-300 block">{i.integration}</span>
                        <span className="text-gray-500 text-[9px]">{i.method}</span>
                      </div>
                      <span className="text-emerald-400 font-bold">✓ {i.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Part A Sign-Off Box */}
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 space-y-3">
              <h5 className="font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Digital Sign-Off: Full Stack Lead / Engineer
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder="Full Stack Engineer Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={signRole}
                    onChange={(e) => setSignRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder="Full Stack Engineer"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Digital Signature</label>
                  <input
                    type="text"
                    value={signSignature}
                    onChange={(e) => setSignSignature(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-cyan-500/40 text-cyan-300 font-mono text-xs"
                    placeholder="e.g. John Doe / EMS-ENG-01"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onSaveSection('partA_FullStack')}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save &amp; Sign Off Part A</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: DEVOPS ENGINEERING */}
        {activeTab === 'B' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-300 text-sm">PART B — DevOps &amp; Production Engineering</h4>
                <p className="text-gray-400 text-xs">Sections 6 to 9: DevOps Components, 8 Environments, CI/CD Monitoring, Rollback &amp; Handover Checklist.</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                Pages 5 &amp; 6 of Dossier
              </span>
            </div>

            {/* Sec 6: DevOps Report */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">6. DevOps Engineering Components</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[10px]">
                {partB_DevOps.devopsReport.map((d, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-emerald-300">{d.component}</span>
                      <span className="text-emerald-400 font-bold">✓ {d.status}</span>
                    </div>
                    <p className="text-gray-400 text-[9px] font-sans">{d.implementation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sec 7: 8 Environment Endpoints */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">7. Environment &amp; Deployment Endpoints (8 Environments)</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-1.5 px-2">Environment</th>
                      <th className="py-1.5 px-2">Host / URL Endpoint</th>
                      <th className="py-1.5 px-2">Status</th>
                      <th className="py-1.5 px-2">Deployment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-gray-300">
                    {partB_DevOps.environments.map((e, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2 font-bold text-emerald-400">{e.environment}</td>
                        <td className="py-1.5 px-2 text-cyan-300">{e.endpoint}</td>
                        <td className="py-1.5 px-2 text-emerald-400 font-bold">✓ {e.status}</td>
                        <td className="py-1.5 px-2 text-gray-500">{e.deploymentDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sec 9: Production Handover Checklist */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">9. Production Handover Checklist (8 Items)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {partB_DevOps.handoverItems.map((h, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-between">
                    <span className="text-gray-300">{idx + 1}. {h.item}</span>
                    <span className="text-emerald-400 font-bold text-[10px]">✓ {h.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Part B Sign-Off Box */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
              <h5 className="font-bold text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Digital Sign-Off: DevOps &amp; Production Engineer
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder="DevOps Engineer Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={signRole}
                    onChange={(e) => setSignRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder="DevOps Engineer"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Digital Signature</label>
                  <input
                    type="text"
                    value={signSignature}
                    onChange={(e) => setSignSignature(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-emerald-500/40 text-emerald-300 font-mono text-xs"
                    placeholder="e.g. Lead DevOps / Verified"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onSaveSection('partB_DevOps')}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save &amp; Sign Off Part B</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: AI ENGINEERING */}
        {activeTab === 'C' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-purple-300 text-sm">PART C — AI Engineering &amp; Autonomous Agents</h4>
                <p className="text-gray-400 text-xs">Sections 10 to 13: NLP Services, 3 Autonomous Agents, n8n 8-Stage Pipeline &amp; AI Benchmarks.</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold text-[10px]">
                Pages 7 &amp; 8 of Dossier
              </span>
            </div>

            {/* Sec 11: 3 AI Agents */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">11. Autonomous Agent Architectures (3 Production Agents)</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {partC_AiEngineering.aiAgents.map((ag, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-900 border border-purple-500/30 space-y-2">
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                      <Cpu className="w-4 h-4" />
                      <span>{ag.agentService}</span>
                    </div>
                    <p className="text-gray-300 text-xs">{ag.responsibility}</p>
                    <div className="pt-2 border-t border-gray-800 text-[10px] space-y-1 font-mono text-gray-400">
                      <div>Input: <span className="text-cyan-300">{ag.inputs}</span></div>
                      <div>Output: <span className="text-emerald-300">{ag.outputs}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sec 12: n8n 8-Stage Workflows */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">12. n8n Enterprise Workflow Automation (8 Stages)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {partC_AiEngineering.n8nWorkflows.map((w, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 space-y-1">
                    <span className="font-bold text-purple-300 block">{w.stage}</span>
                    <p className="text-gray-400 text-[11px]">{w.action}</p>
                    <span className="text-[10px] text-emerald-400 font-mono block">Gate: {w.validation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sec 13: AI Testing Benchmarks */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">13. AI Benchmarks &amp; Guardrails Validation</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {partC_AiEngineering.evaluations.map((e, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">{e.area}</span>
                    <div className="font-bold text-emerald-400 mt-0.5">{e.actual}</div>
                    <span className="text-[9px] text-gray-500">Target: {e.target}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Part C Sign-Off Box */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/40 space-y-3">
              <h5 className="font-bold text-purple-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" /> Digital Sign-Off: AI &amp; Machine Learning Engineer
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder="AI Engineer Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={signRole}
                    onChange={(e) => setSignRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder="AI Engineer"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Digital Signature</label>
                  <input
                    type="text"
                    value={signSignature}
                    onChange={(e) => setSignSignature(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-purple-500/40 text-purple-300 font-mono text-xs"
                    placeholder="e.g. AI Lead / Certified"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onSaveSection('partC_AiEngineering')}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save &amp; Sign Off Part C</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB D: QUALITY ENGINEERING */}
        {activeTab === 'D' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-rose-300 text-sm">PART D — Quality Assurance &amp; Testing</h4>
                <p className="text-gray-400 text-xs">Sections 14 to 17: 7 Test Disciplines, Module Coverage, Defect Severity Matrix &amp; Quality Release Gate.</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
                Pages 9 &amp; 10 of Dossier
              </span>
            </div>

            {/* Sec 14: Quality Disciplines */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">14. Quality Engineering Coverage (7 Disciplines)</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400">
                      <th className="py-1.5 px-2">Testing Discipline</th>
                      <th className="py-1.5 px-2">Planned</th>
                      <th className="py-1.5 px-2">Executed</th>
                      <th className="py-1.5 px-2">Passed</th>
                      <th className="py-1.5 px-2">Coverage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900 text-gray-300">
                    {partD_Quality.testingAreas.map((t, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 px-2 font-bold text-white">{t.area}</td>
                        <td className="py-1.5 px-2">{t.planned}</td>
                        <td className="py-1.5 px-2">{t.executed}</td>
                        <td className="py-1.5 px-2 text-emerald-400 font-bold">{t.passed}</td>
                        <td className="py-1.5 px-2 text-cyan-400 font-bold">{t.coverage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sec 17: Defect Severity */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">17. Defect Severity &amp; Remediation Matrix</h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {partD_Quality.defectSeverity.map((ds, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-center">
                    <span className="text-[10px] text-gray-400 font-bold block">{ds.severity}</span>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">{ds.closed} / {ds.total}</div>
                    <span className="text-[9px] text-gray-500 font-bold block">0 OPEN</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Part D Sign-Off Box */}
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 space-y-3">
              <h5 className="font-bold text-rose-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-400" /> Digital Sign-Off: Quality Assurance Lead / Quality Head
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder="Quality Lead / Head Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={signRole}
                    onChange={(e) => setSignRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder={isQualityHead ? 'Quality Head' : 'Quality Assurance Lead'}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Digital Signature</label>
                  <input
                    type="text"
                    value={signSignature}
                    onChange={(e) => setSignSignature(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-rose-500/40 text-rose-300 font-mono text-xs"
                    placeholder="e.g. QA Lead / Certified"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onSaveSection('partD_Quality')}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save &amp; Sign Off Part D</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB E: BUG BOUNTY & SECURITY */}
        {activeTab === 'E' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-violet-300 text-sm">PART E — Bug Bounty &amp; Security Assurance</h4>
                <p className="text-gray-400 text-xs">Sections 18 to 20: 8 Security Assessment Disciplines, Vulnerability Triage &amp; SEC-001..003 Remediation.</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-300 border border-violet-500/30 font-bold text-[10px]">
                Page 11 of Dossier
              </span>
            </div>

            {/* Sec 18: Security Validation */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">18. Security Assessment &amp; Validation Disciplines (8 Disciplines)</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                {partE_BugBounty.securityAreas.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">{s.area}</span>
                      <span className="text-gray-500 text-[10px]">{s.validation}</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-[10px]">✓ {s.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sec 20: Remediation Tracking */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">20. Vulnerability Remediation Tracking (SEC-001 to SEC-003)</h5>
              <div className="space-y-2">
                {partE_BugBounty.remediationFindings.map((r) => (
                  <div key={r.findingId} className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-400">{r.findingId}</span>
                        <span className="font-bold text-white">{r.finding}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                          {r.risk}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">Remediation: {r.remediation}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold text-xs">✓ {r.status}</span>
                      <span className="text-gray-500 text-[10px] block">Retest: {r.retestDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Part E Sign-Off Box */}
            <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-500/40 space-y-3">
              <h5 className="font-bold text-violet-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-violet-400" /> Digital Sign-Off: Bug Bounty Specialist / Cyber Head CISO
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder="Security Lead Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={signRole}
                    onChange={(e) => setSignRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder={isCyberHead ? 'Chief Information Security Officer (CISO)' : 'Bug Bounty Specialist'}
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Digital Signature</label>
                  <input
                    type="text"
                    value={signSignature}
                    onChange={(e) => setSignSignature(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-violet-500/40 text-violet-300 font-mono text-xs"
                    placeholder="e.g. CISO / Certified Secure"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onSaveSection('partE_BugBounty')}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save &amp; Sign Off Part E</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB F: PERFORMANCE & CLOSURE */}
        {activeTab === 'F' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-amber-300 text-sm">PART F — Performance, Lessons Learned &amp; Final Project Closure</h4>
                <p className="text-gray-400 text-xs">Sections 21 to 24: Performance Benchmarks, Final Project Metrics, Lessons Learned, 5-Tier Closure Signatures &amp; Revision Log.</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                Pages 12 &amp; 13 of Dossier
              </span>
            </div>

            {/* Sec 21: Performance & 22: Final Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider">21. Performance &amp; SLA Reliability</h5>
                <div className="space-y-1.5 text-[11px]">
                  {partF_Closure.performanceReliability.map((p, idx) => (
                    <div key={idx} className="p-2 rounded bg-gray-900 border border-gray-800 flex justify-between">
                      <span className="text-gray-300">{p.metric}</span>
                      <span className="font-bold text-emerald-400">{p.actual} (SLA: {p.target})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider">22. Final Project Metrics</h5>
                <div className="space-y-1.5 text-[11px]">
                  {partF_Closure.finalMetrics.map((fm, idx) => (
                    <div key={idx} className="p-2 rounded bg-gray-900 border border-gray-800 flex justify-between">
                      <span className="text-gray-300">{fm.metric}</span>
                      <span className="font-bold text-cyan-400">{fm.actual}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5-Tier Formal Signatures Display */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">24. Multi-Tier Executive Leadership Signatures</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold block">1. Manager</span>
                  <div className="font-mono text-cyan-400 font-bold text-xs mt-1">{project.managerName || 'Assigned'}</div>
                  <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">✓ Certified</span>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold block">2. Production Head</span>
                  <div className="font-mono text-purple-400 font-bold text-xs mt-1">{project.productionHeadName || 'Assigned'}</div>
                  <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">✓ Certified</span>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold block">3. Quality Head</span>
                  <div className="font-mono text-rose-400 font-bold text-xs mt-1">{project.qualityHeadName || 'Assigned'}</div>
                  <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">✓ Certified</span>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800">
                  <span className="text-[10px] text-gray-500 font-bold block">4. Cyber Head</span>
                  <div className="font-mono text-violet-400 font-bold text-xs mt-1">{project.cyberHeadName || 'Assigned'}</div>
                  <span className="text-[9px] text-emerald-400 font-bold block mt-0.5">✓ Certified</span>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/40">
                  <span className="text-[10px] text-indigo-400 font-bold block">5. Directorate Admin</span>
                  <div className="font-mono text-white font-bold text-xs mt-1">Executive Sign-Off</div>
                  <span className="text-[9px] text-indigo-300 font-bold block mt-0.5">Final Authority</span>
                </div>
              </div>
            </div>

            {/* Part F Sign-Off Box */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 space-y-3">
              <h5 className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" /> Digital Sign-Off: Project Manager / Directorate Final Acceptance
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Signatory Name</label>
                  <input
                    type="text"
                    value={signName}
                    onChange={(e) => setSignName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder="Project Manager / Directorate Name"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={signRole}
                    onChange={(e) => setSignRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-gray-800 text-white text-xs"
                    placeholder="Project Manager / Executive Directorate"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] font-bold mb-1">Digital Signature</label>
                  <input
                    type="text"
                    value={signSignature}
                    onChange={(e) => setSignSignature(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-950 border border-amber-500/40 text-amber-300 font-mono text-xs"
                    placeholder="e.g. Project Manager / Approved"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => onSaveSection('partF_Closure')}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save &amp; Sign Off Part F (Project Closure)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold"
          >
            Close Dossier
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Generate &amp; Print 13-Page Master PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
