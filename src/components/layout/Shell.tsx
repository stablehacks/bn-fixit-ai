import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Page Container */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 pt-16 p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
