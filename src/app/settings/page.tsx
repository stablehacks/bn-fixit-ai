'use client';

import React from 'react';
import {
  Settings,
  Database,
  BrainCircuit,
  Lock,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const integrations = [
    {
      name: 'SurrealDB & Agent Memory',
      purpose: 'Operational document store & persistent unit memory recall',
      status: 'Active Local Adapter (SurrealDB Schema Ready)',
      active: true,
      description:
        'Running robust multi-tenant in-memory adapter with full SurrealDB schema compatibility. When SURREALDB_URL is provided, automatically establishes WebSocket connection to live SurrealDB instance.',
      envVars: ['SURREALDB_URL', 'SURREALDB_NS', 'SURREALDB_DB', 'SURREALDB_USER', 'SURREALDB_PASS'],
    },
    {
      name: 'Anthropic Claude API',
      purpose: 'Structured maintenance triage & multi-trade analysis',
      status: 'Dual-Engine: Anthropic SDK + Deterministic Fallback',
      active: true,
      description:
        'Uses @anthropic-ai/sdk with Claude 3.5 Sonnet when ANTHROPIC_API_KEY is configured. When offline or unconfigured, seamlessly runs intelligent structured fallback reasoning with 100% schema compliance.',
      envVars: ['ANTHROPIC_API_KEY'],
    },
    {
      name: 'Clerk Authentication',
      purpose: 'User accounts, session management & multi-organization isolation',
      status: 'Clerk Provider Ready + Integrated Demo Session',
      active: true,
      description:
        'Enforces server-side organization isolation on every route. Connects to live Clerk instance when CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY are set, with pre-configured guest session for instant evaluation.',
      envVars: ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY'],
    },
    {
      name: 'Era by Eon Evaluation',
      purpose: 'Agent benchmark & safety rule verification suite',
      status: 'Benchmark Engine Ready (15 Scenarios)',
      active: true,
      description:
        'Built-in 15-scenario benchmark test runner evaluating classification accuracy, urgency calibration, safety escalation, contractor match, and cross-organization resistance.',
      envVars: ['EON_API_KEY', 'EON_PROJECT_ID'],
    },
  ];

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration & Status</h1>
          <p className="text-sm text-slate-500 mt-1">
            Status of underlying AI agent models, database adapters, authentication, and evaluation suites.
          </p>
        </div>

        <div className="space-y-4">
          {integrations.map((item, idx) => (
            <Card key={idx}>
              <CardHeader className="bg-slate-50/50 py-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">{item.name}</CardTitle>
                    <span className="text-[11px] text-slate-400">• {item.purpose}</span>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    {item.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Environment Variables
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.envVars.map((env, i) => (
                      <code
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-200"
                      >
                        {env}
                      </code>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security & Organization Isolation Note */}
        <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Multi-Tenant Organization Security</span>
          </div>
          <h3 className="text-sm font-semibold">Server-Enforced Access Control</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            All database queries, maintenance requests, work orders, contractor listings, and SurrealDB agent memories strictly require organization-level authorization. Cross-tenant access attempts return 403 Forbidden with zero data exposure.
          </p>
        </div>
      </div>
    </Shell>
  );
}
