'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Building,
  UserCheck,
  Search,
  Filter,
  UserX,
  Sparkles,
  RefreshCw,
  Crown,
} from 'lucide-react';
import { fetchEmsEmployees, EmsUser } from '@/lib/ems';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const loadLiveEmsEmployees = async () => {
    setLoading(true);
    const data = await fetchEmsEmployees();
    setEmployees(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLiveEmsEmployees();
  }, []);

  const departments = Array.from(new Set(employees.map((e) => e.department))).filter(Boolean);

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    const name = emp.fullName || (emp as any).name || '';
    const empId = emp.employeeId || '';
    const dept = emp.department || '';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-900/60 p-6 rounded-2xl border border-gray-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase">
              EMS Backend API Integration
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" /> Department-Divided Employee Directory
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Live registered employees fetched from EMS API (https://erp-backend-1-02lc.onrender.com/api) divided by Department & Team Leaders.
          </p>
        </div>

        <button
          onClick={loadLiveEmsEmployees}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs border border-gray-700 transition-all active:scale-95 flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Live EMS API</span>
        </button>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        <button
          onClick={() => setSelectedDept('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedDept === 'ALL'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30'
              : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
          }`}
        >
          All Departments ({employees.length})
        </button>

        {departments.map((dept) => {
          const count = employees.filter((e) => e.department === dept).length;
          return (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedDept === dept
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 border border-indigo-500/30'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              <span>{dept}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-300 text-[10px]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Directory Table / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-gray-900/40 border border-gray-800">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-gray-400 font-medium">Fetching registered employees from EMS Backend API...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Registered Employees in this Department"
          description="Only employees registered in https://erp-backend-1-02lc.onrender.com/api are displayed here. Register employees in EMS to assign them to ERP departments."
          actionLabel="Sync Live EMS API"
          onAction={loadLiveEmsEmployees}
        />
      ) : (
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="w-72 relative">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ID, name, designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-gray-400">
              Department View: <strong className="text-indigo-400 font-bold">{selectedDept}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/60 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-6">EMS ID</th>
                  <th className="py-3.5 px-6">Employee Name & Email</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Designation & Role</th>
                  <th className="py-3.5 px-6 text-right">EMS Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-indigo-400">
                      {emp.employeeId}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-white flex items-center gap-1.5">
                        <span>{emp.fullName}</span>
                        {emp.role === 'TEAM_LEAD' && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-400" /> Team Leader (TL)
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-500">{emp.email}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-200">
                      {emp.department}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-300 font-medium">{emp.designation}</p>
                      <Badge size="sm" variant={emp.role === 'TEAM_LEAD' ? 'warning' : 'purple'}>
                        {emp.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {emp.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> EMS ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold text-[11px]">
                          <UserX className="w-3 h-3" /> ACCESS BLOCKED
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
