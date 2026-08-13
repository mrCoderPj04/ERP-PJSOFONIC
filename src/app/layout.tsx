import React from 'react';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { MainLayoutWrapper } from '../components/layout/MainLayoutWrapper';

export const metadata = {
  title: 'PJSOFONIC ERP',
  description: 'Enterprise Software Agency Operating System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 flex min-h-screen">
        <AuthProvider>
          <MainLayoutWrapper>{children}</MainLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
