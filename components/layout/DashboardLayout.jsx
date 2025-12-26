'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppBar from './AppBar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <AppBar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 md:pl-64">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}