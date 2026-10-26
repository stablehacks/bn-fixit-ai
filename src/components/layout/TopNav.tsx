'use client';

import React, { useState } from 'react';
import {
  Building,
  Bell,
  Search,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/button';

export const TopNav: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        setResetMessage('Demo data refreshed!');
        setTimeout(() => {
          setResetMessage(null);
          window.location.reload();
        }, 1000);
      }
    } catch {
      setResetMessage('Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 pl-64 fixed inset-x-0 top-0 z-20 flex items-center justify-between px-8">
      {/* Left: Organization context & search */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800">
          <Building className="w-3.5 h-3.5 text-emerald-600" />
          <span>Oakridge Property Management</span>
          <span className="text-[10px] text-emerald-700 font-bold px-1.5 py-0.2 bg-emerald-100 rounded">
            64 Units
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-80 hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests, work orders, units..."
            className="w-full bg-slate-50 border border-slate-200/80 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, User profile */}
      <div className="flex items-center gap-3">
        {resetMessage && (
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> {resetMessage}
          </span>
        )}

        {/* Reseed Button for Judges */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          isLoading={isResetting}
          title="Reset sample portfolio to initial state"
          className="text-xs text-slate-600 hover:text-slate-900 border-dashed"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-400" />
          Reset Demo Data
        </Button>

        {/* Gas / Hazard Alert quick pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">Triage Guard:</span>
          <span className="font-bold text-amber-700">Deterministic</span>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 mx-1" />

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Alex Morgan</p>
            <p className="text-[10px] text-slate-500">Property Manager</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/30">
            AM
          </div>
        </div>
      </div>
    </header>
  );
};
