'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import erpLogo from '../../../logo/Erp.png';
import { ShieldAlert, KeyRound, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authenticateWithEms } from '../../lib/ems';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [employeeIdOrEmail, setEmployeeIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<'IDLE' | 'SUCCESS' | 'BLOCKED'>('IDLE');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      // Connect to Live EMS Backend API
      const authRes = await authenticateWithEms(employeeIdOrEmail, password);

      if (!authRes.success) {
        setStep('BLOCKED');
        setErrorMessage(authRes.error || 'Access Denied: Account not registered.');
        setLoading(false);
        return;
      }

      if (authRes.user) {
        login(authRes.user, authRes.token || 'ems-live-token');
      }

      setStep('SUCCESS');
      setTimeout(() => {
        router.push('/dashboard');
      }, 800);
    } catch (err: any) {
      setStep('BLOCKED');
      setErrorMessage(err.message || 'Authentication Server Error');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center p-4">
      {/* Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-indigo-500/30 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-4 p-2">
            <img
              src={typeof erpLogo === 'string' ? erpLogo : erpLogo.src}
              alt="PJSOFONIC ERP Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">PJSOFONIC ERP</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">Enterprise Software Agency Operating System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Employee ID or Email
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={employeeIdOrEmail}
                onChange={(e) => setEmployeeIdOrEmail(e.target.value)}
                placeholder="Enter Employee ID or Email"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Access Denied</p>
                <p className="text-[11px] text-rose-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : step === 'SUCCESS' ? (
              <span className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4" /> Authenticated! Redirecting...
              </span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
