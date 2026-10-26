'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Building2,
  Users,
  Activity,
  Settings,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Maintenance Requests', href: '/requests', icon: ClipboardList },
    { name: 'Work Orders', href: '/work-orders', icon: Wrench },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'Contractors', href: '/contractors', icon: Users },
    { name: 'AI Activity & Eon', href: '/ai-activity', icon: Activity },
    { name: 'Interactive Demo Mode', href: '/demo', icon: Sparkles, badge: 'Judge Hub' },
    { name: 'Settings & Status', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <BrainCircuit className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-white tracking-tight">FixIt AI</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
              MVP
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Maintenance Ops Agent</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Operations
        </div>
        {navigation.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Trust & Safety Indicator */}
      <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Safety Guardrails Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Deterministic hazard escalation & human-in-the-loop approval enforced.
        </p>
      </div>

      {/* Bottom Profile Summary */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
          AM
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-200 truncate">Alex Morgan</p>
          <p className="text-[11px] text-slate-400 truncate">Senior Property Manager</p>
        </div>
      </div>
    </aside>
  );
};
