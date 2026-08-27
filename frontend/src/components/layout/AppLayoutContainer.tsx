'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function AppLayoutContainer({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="bg-[#07090e] bg-ambient-glow text-gray-100 font-sans antialiased min-h-screen flex flex-col w-full">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleMobile={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 ml-0 md:ml-64 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
