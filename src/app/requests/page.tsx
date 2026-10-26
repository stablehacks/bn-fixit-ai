'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent } from '@/components/ui/card';
import { UrgencyBadge, Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaintenanceRequest, IssueCategory, UrgencyLevel } from '@/lib/types';
import { formatDate, formatTimeAgo } from '@/lib/utils';

export default function RequestsPage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        const res = await fetch('/api/maintenance-requests');
        const json = await res.json();
        if (json.success) {
          setRequests(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const filtered = requests.filter(req => {
    const text = (req.unit_number + ' ' + req.description + ' ' + (req.tenant_name || '')).toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || req.category === categoryFilter;
    const matchesUrg = urgencyFilter === 'all' || req.urgency === urgencyFilter;
    return matchesSearch && matchesCat && matchesUrg;
  });

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Requests</h1>
            <p className="text-sm text-slate-500 mt-1">
              Ingest, triage, and convert tenant maintenance reports into verified work orders.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/requests/new">
              <Button size="sm" variant="primary">
                <Plus className="w-4 h-4 mr-1.5" />
                New Request Intake
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by unit, tenant, issue..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="heating_and_cooling">Heating & Cooling</option>
              <option value="appliances">Appliances</option>
              <option value="structural">Structural</option>
              <option value="pest_control">Pest Control</option>
              <option value="general_maintenance">General Maintenance</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Urgency</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Request List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-sm text-slate-400">Loading requests...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-sm text-slate-500">
                No maintenance requests match the current search filters.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map(req => (
                  <div
                    key={req.id}
                    className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                          Unit {req.unit_number}
                        </span>
                        <UrgencyBadge urgency={req.urgency} />
                        <Badge variant="neutral" className="capitalize text-[11px]">
                          {req.category.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          Reported {formatTimeAgo(req.reported_at)} ({formatDate(req.reported_at)})
                        </span>
                        {req.ai_triage && (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            AI Triaged
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900 mb-0.5">
                        {req.ai_triage?.issue_summary || req.description}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {req.description}
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                        <span>Tenant: <strong className="text-slate-600 font-medium">{req.tenant_name || req.created_by}</strong></span>
                        {req.tenant_phone && <span>Phone: <span className="text-slate-600">{req.tenant_phone}</span></span>}
                        {req.ai_triage?.recommended_contractor && (
                          <span className="text-emerald-700 font-medium">
                            Matched: {req.ai_triage.recommended_contractor.company}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/requests/${req.id}`}>
                        <Button size="sm" variant={req.ai_triage ? 'outline' : 'primary'} className="text-xs">
                          {req.ai_triage ? 'Review Triage' : 'Run AI Triage'}
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
