'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { usePathname, useRouter } from 'next/navigation';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !isLoginPage && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, loading, isAuthenticated, isLoginPage, router]);

  // Prevent hydration mismatch between Server and Client
  if (!mounted || loading) {
    if (isLoginPage) {
      return <div className="w-full min-h-screen bg-gray-950">{children}</div>;
    }
    return (
      <div className="w-full min-h-screen bg-gray-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-mono">Verifying EMS Authentication Gateway...</p>
      </div>
    );
  }

  if (isLoginPage) {
    return <div className="w-full min-h-screen bg-gray-950">{children}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-gray-950 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-mono">Redirecting to EMS Sign In...</p>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-950">
      <Sidebar
        role={user?.role || 'EMPLOYEE'}
        emsEmployeeId={user?.employeeId || 'EMS-USER'}
        department={user?.department || 'Software Engineering'}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userRole={user?.role || 'EMPLOYEE'}
          userName={user?.fullName || 'EMS Employee'}
          emsEmployeeId={user?.employeeId || 'EMS-USER'}
          avatarUrl={user?.avatarUrl}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
