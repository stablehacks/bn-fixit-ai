'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ClipboardList,
  Wrench,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  ArrowUpRight,
  Building,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UrgencyBadge, WorkOrderStatusBadge, Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaintenanceRequest, WorkOrder, AuditEvent } from '@/lib/types';
import { formatDate, formatTimeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [reqRes, woRes, auditRes] = await Promise.all([
          fetch('/api/maintenance-requests'),
          fetch('/api/work-orders'),
          fetch('/api/audit-events'),
        ]);

        const [reqJson, woJson, auditJson] = await Promise.all([
          reqRes.json(),
          woRes.json(),
          auditRes.json(),
        ]);

        if (reqJson.success) setRequests(reqJson.data);
        if (woJson.success) setWorkOrders(woJson.data);
        if (auditJson.success) setAuditEvents(auditJson.data);
      } catch (err: unknown) {
        setError('Failed to load dashboard metrics. Check server status.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Compute metrics from actual data
  const totalOpenRequests = requests.filter(r => r.status !== 'resolved' && r.status !== 'cancelled').length;
  const urgentRequests = requests.filter(r => (r.urgency === 'high' || r.urgency === 'emergency') && r.status !== 'resolved');
  const awaitingApprovalOrders = workOrders.filter(w => w.status === 'Awaiting Approval');
  const inProgressOrders = workOrders.filter(w => w.status === 'In Progress' || w.status === 'Scheduled');
  const recentlyCompletedOrders = workOrders.filter(w => w.status === 'Completed');
  const emergencyItem = requests.find(r => r.urgency === 'emergency');

  return (
    <Shell>
      <div className="space-y-6">
        {/* Welcome & Quick Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operations Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time portfolio maintenance oversight & AI triage agent orchestration.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/requests/new">
              <Button size="sm" variant="primary">
                <ClipboardList className="w-4 h-4 mr-1.5" />
                Submit Request
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="sm" variant="outline" className="border-emerald-600 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50">
                <Sparkles className="w-4 h-4 mr-1.5 text-emerald-600" />
                Demo Scenarios
              </Button>
            </Link>
          </div>
        </div>

        {/* Emergency Alert Banner if Active Gas or Electrical Hazard exists */}
        {emergencyItem && (
          <div className="bg-red-50 border-2 border-red-500/80 rounded-xl p-4 shadow-sm flex items-start gap-4 animate-pulse">
            <div className="p-2.5 bg-red-600 text-white rounded-lg">
              <Flame className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 bg-red-600 text-white rounded">
                  Critical Safety Alert
                </span>
                <span className="text-xs text-red-700 font-semibold">Immediate Human Protocol Required</span>
              </div>
              <h3 className="text-base font-bold text-red-950 mt-1">
                Unit {emergencyItem.unit_number}: {emergencyItem.ai_triage?.issue_summary || emergencyItem.description}
              </h3>
              <p className="text-xs text-red-800 mt-0.5">
                {emergencyItem.ai_triage?.emergency_guidance || 'Suspected hazardous condition detected. Routine contractor scheduling held.'}
              </p>
            </div>
            <Link href={`/requests/${emergencyItem.id}`}>
              <Button size="sm" variant="danger">
                Review Protocol
              </Button>
            </Link>
          </div>
        )}

        {/* 6 Key Operational Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Card 1: Open Requests */}
          <Card className="hover:border-slate-300 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">Open Requests</span>
                <ClipboardList className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loading ? '...' : totalOpenRequests}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Active tenant reports</p>
            </CardContent>
          </Card>

          {/* Card 2: Urgent Attention */}
          <Card className="hover:border-amber-300 transition-all bg-amber-50/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-xs font-semibold">Urgent / High</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-900">
                {loading ? '...' : urgentRequests.length}
              </div>
              <p className="text-[11px] text-amber-700/80 mt-1">Requires fast response</p>
            </CardContent>
          </Card>

          {/* Card 3: Awaiting Approval */}
          <Card className="hover:border-emerald-300 transition-all bg-emerald-50/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-2">
                <span className="text-xs font-semibold">Awaiting Approval</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-950">
                {loading ? '...' : awaitingApprovalOrders.length}
              </div>
              <p className="text-[11px] text-emerald-700/80 mt-1">Human sign-off needed</p>
            </CardContent>
          </Card>

          {/* Card 4: Repairs In Progress */}
          <Card className="hover:border-slate-300 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">In Progress</span>
                <Wrench className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loading ? '...' : inProgressOrders.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Dispatched to trades</p>
            </CardContent>
          </Card>

          {/* Card 5: Recently Completed */}
          <Card className="hover:border-slate-300 transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-medium">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {loading ? '...' : recentlyCompletedOrders.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Stored to Agent Memory</p>
            </CardContent>
          </Card>

          {/* Card 6: AI Agent Actions */}
          <Card className="hover:border-slate-300 transition-all bg-slate-900 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-slate-300 mb-2">
                <span className="text-xs font-medium text-emerald-400">Agent Actions</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {loading ? '...' : auditEvents.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Audit trail logged</p>
            </CardContent>
          </Card>
        </div>

        {/* Two-Column Operations Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 spans): Urgent Requests & Work Orders Awaiting Approval */}
          <div className="lg:col-span-2 space-y-6">
            {/* Urgent Maintenance Requests */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Urgent Maintenance Queue</CardTitle>
                  <CardDescription>
                    Highest priority reports evaluated by AI triage and safety rules
                  </CardDescription>
                </div>
                <Link href="/requests" className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1">
                  View all ({requests.length}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-400">Loading requests...</div>
                ) : urgentRequests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No open urgent requests. Portfolio operating smoothly!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {urgentRequests.map(req => (
                      <div key={req.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                              Unit {req.unit_number}
                            </span>
                            <UrgencyBadge urgency={req.urgency} />
                            <span className="text-xs text-slate-400">
                              Reported {formatTimeAgo(req.reported_at)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {req.ai_triage?.issue_summary || req.description}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            Category: {req.category.replace('_', ' ')} • Reported by: {req.tenant_name || req.created_by}
                          </p>
                        </div>
                        <Link href={`/requests/${req.id}`}>
                          <Button size="sm" variant="outline" className="text-xs shrink-0">
                            View Triage
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Work Orders Awaiting Human Approval */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Work Orders Awaiting Approval</CardTitle>
                  <CardDescription>
                    AI proposed drafts requiring explicit property manager sign-off
                  </CardDescription>
                </div>
                <Link href="/work-orders" className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1">
                  All work orders <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-400">Loading work orders...</div>
                ) : awaitingApprovalOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    No work orders currently awaiting approval.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {awaitingApprovalOrders.map(wo => (
                      <div key={wo.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {wo.id}
                            </span>
                            <WorkOrderStatusBadge status={wo.status} />
                            <UrgencyBadge urgency={wo.priority} />
                          </div>
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {wo.issue_summary}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            Assigned to: {wo.contractor_id || 'Pending assignment'} • {wo.assigned_manager}
                          </p>
                        </div>
                        <Link href="/work-orders">
                          <Button size="sm" variant="primary" className="text-xs shrink-0">
                            Review & Approve
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1 span): Recent AI Agent Activity Stream */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <CardTitle>AI Agent Activity</CardTitle>
                </div>
                <Link href="/ai-activity" className="text-xs text-emerald-700 font-medium hover:underline">
                  Audit log
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-xs text-slate-400">Loading audit activity...</div>
                ) : auditEvents.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">No recent AI activity recorded.</div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                    {auditEvents.slice(0, 7).map(event => (
                      <div key={event.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-semibold text-slate-700 uppercase tracking-wider">
                            {event.event_type.replace(/_/g, ' ')}
                          </span>
                          <span>{formatTimeAgo(event.created_at)}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-800">
                          {event.metadata && typeof event.metadata === 'object' && 'reason' in event.metadata
                            ? String(event.metadata.reason)
                            : event.metadata && 'contractor' in event.metadata
                            ? `Recommended ${event.metadata.contractor}`
                            : `Entity ${event.entity_type} [${event.entity_id}] processed by ${event.actor_id}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                          <span className="px-1.5 py-0.2 bg-slate-100 rounded font-mono">
                            actor: {event.actor_type}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>{event.entity_id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Demo Portfolio Guide Box */}
            <div className="rounded-xl p-5 bg-gradient-to-br from-slate-900 to-navy-900 text-white shadow-sm border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>FixIt AI Judge Exploration</span>
              </div>
              <h4 className="text-sm font-semibold text-white">Experience AI Reasoning Live</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Run preloaded scenarios (routine cabinet, active plumbing, emergency gas leak) or verify persistent SurrealDB memory for Unit 204.
              </p>
              <div className="mt-4">
                <Link href="/demo">
                  <Button size="sm" variant="primary" className="w-full text-xs bg-emerald-500 hover:bg-emerald-600">
                    Launch Interactive Demo Suite
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
