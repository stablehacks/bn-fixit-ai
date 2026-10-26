'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building,
  User,
  Phone,
  Calendar,
  Sparkles,
  AlertTriangle,
  Flame,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Wrench,
  Clock,
  ArrowRight,
  History,
  FileText,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UrgencyBadge, WorkOrderStatusBadge, Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MaintenanceRequest, Property, AgentMemory, AITriageResult } from '@/lib/types';
import { formatDate, formatTimeAgo } from '@/lib/utils';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [request, setRequest] = useState<(MaintenanceRequest & { property?: Property; historical_memories?: AgentMemory[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTriaging, setIsTriaging] = useState(false);
  const [isCreatingWorkOrder, setIsCreatingWorkOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadRequest() {
      try {
        setLoading(true);
        const res = await fetch(`/api/maintenance-requests/${requestId}`);
        const json = await res.json();
        if (json.success) {
          setRequest(json.data);
        } else {
          setError(json.error || 'Request not found.');
        }
      } catch (err) {
        setError('Failed to load request details.');
      } finally {
        setLoading(false);
      }
    }
    loadRequest();
  }, [requestId]);

  // Run AI Triage
  const handleRunTriage = async () => {
    try {
      setIsTriaging(true);
      setError(null);
      setActionSuccess(null);

      const res = await fetch(`/api/maintenance-requests/${requestId}/triage`, {
        method: 'POST',
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Triage execution failed.');
      }

      // Refresh data
      setRequest(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          ...json.data.request,
          ai_triage: json.data.triage,
        };
      });

      setActionSuccess('AI Triage Agent completed analysis and contractor matching!');
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Error executing AI triage.');
    } finally {
      setIsTriaging(false);
    }
  };

  // Convert to Work Order
  const handleCreateWorkOrder = async () => {
    try {
      setIsCreatingWorkOrder(true);
      setError(null);
      const res = await fetch(`/api/maintenance-requests/${requestId}/work-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create work order.');
      }

      setActionSuccess('Work order draft created successfully! Navigating to Work Orders...');
      setTimeout(() => {
        router.push('/work-orders');
      }, 1000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Error generating work order.');
    } finally {
      setIsCreatingWorkOrder(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="p-16 text-center text-slate-400 text-sm">
          Loading maintenance request details...
        </div>
      </Shell>
    );
  }

  if (error && !request) {
    return (
      <Shell>
        <div className="p-8 max-w-lg mx-auto bg-rose-50 border border-rose-200 rounded-xl text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h2 className="text-base font-bold text-rose-900">Unable to Load Request</h2>
          <p className="text-xs text-rose-700">{error}</p>
          <Link href="/requests">
            <Button size="sm" variant="outline">
              Back to Requests
            </Button>
          </Link>
        </div>
      </Shell>
    );
  }

  if (!request) return null;

  const triage: AITriageResult | undefined = request.ai_triage;
  const isEmergency = triage?.is_emergency || request.urgency === 'emergency';

  return (
    <Shell>
      <div className="space-y-6">
        {/* Back Link & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/requests"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Requests
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Request {request.id}
              </h1>
              <UrgencyBadge urgency={request.urgency} />
              <Badge variant="neutral" className="text-xs capitalize">
                {request.category.replace(/_/g, ' ')}
              </Badge>
              <span className="text-xs text-slate-400">
                Reported {formatTimeAgo(request.reported_at)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRunTriage}
              isLoading={isTriaging}
              className="border-emerald-600 text-emerald-700 bg-emerald-50/40 hover:bg-emerald-100/50"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-emerald-600" />
              {triage ? 'Re-run AI Triage' : 'Run AI Triage Agent'}
            </Button>
            {triage && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleCreateWorkOrder}
                isLoading={isCreatingWorkOrder}
              >
                <Wrench className="w-4 h-4 mr-1.5" />
                Draft Work Order
              </Button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Prominent Emergency Warning Banner if Gas / Electrical Hazard */}
        {isEmergency && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-extrabold text-sm uppercase tracking-wide">
              <Flame className="w-5 h-5 text-red-600 animate-pulse" />
              <span>CRITICAL SAFETY OVERRIDE ACTIVE</span>
            </div>
            <p className="text-xs text-red-950 font-bold leading-relaxed">
              {triage?.emergency_guidance ||
                'Hazardous condition identified by deterministic safety guardrails. Routine contractor scheduling is suspended. Occupant safety protocols take immediate precedence.'}
            </p>
            <div className="flex items-center gap-3 text-xs text-red-800 font-medium pt-1">
              <span>• Direct occupants to call 911 / Gas Utility immediately if vapor or fire is suspected</span>
              <span>• Do NOT dispatch ordinary maintenance without emergency clear</span>
            </div>
          </div>
        )}

        {/* Two-Column Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN (5 cols): Human Reported Facts & Historical Memory */}
          <div className="lg:col-span-5 space-y-6">
            {/* Human Reported Problem Card */}
            <Card>
              <CardHeader className="bg-slate-50/50">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <CardTitle className="text-sm">Human Reported Details</CardTitle>
                  </div>
                  <Badge variant="neutral" className="text-[10px]">
                    Source: Resident / PM
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Location */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Property Location
                  </span>
                  <div className="flex items-start gap-2 text-xs text-slate-800">
                    <Building className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">
                        {request.property?.name || 'Oakridge Property'} — Unit {request.unit_number}
                      </p>
                      <p className="text-slate-500">{request.property?.address}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Problem Description
                  </span>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-normal">
                    {request.description}
                  </div>
                </div>

                {/* Tenant Contact */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Reported By</span>
                    <span className="font-medium text-slate-700">
                      {request.tenant_name || request.created_by}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Contact Phone</span>
                    <span className="font-medium text-slate-700">
                      {request.tenant_phone || 'None provided'}
                    </span>
                  </div>
                </div>

                {/* Photograph simulation */}
                {request.photo_url && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400 block mb-1">Attached Image</span>
                    <div className="p-3 bg-slate-100/60 rounded-md text-xs text-slate-600 flex items-center gap-2 border border-slate-200">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="font-mono text-[11px] truncate">{request.photo_url}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historical Maintenance Records (SurrealDB Agent Memory) */}
            <Card>
              <CardHeader className="bg-slate-50/50">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    <CardTitle className="text-sm">Historical Unit Memory</CardTitle>
                  </div>
                  <Badge variant="info" className="text-[10px]">
                    SurrealDB Agent Memory
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {!request.historical_memories || request.historical_memories.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No prior maintenance records found for Unit {request.unit_number}.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {request.historical_memories.map(mem => (
                      <div key={mem.id} className="p-4 hover:bg-slate-50/50 transition-colors space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            {mem.summary}
                          </span>
                          <span className="text-slate-400">{formatDate(mem.created_at)}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{mem.details}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
                          <span className="bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                            type: {mem.memory_type}
                          </span>
                          <span>source: {mem.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (7 cols): AI Agent Triage & Action Recommendation */}
          <div className="lg:col-span-7 space-y-6">
            {!triage ? (
              <Card className="border-dashed border-2 border-slate-300 bg-slate-50/40">
                <CardContent className="p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-base font-bold text-slate-900">AI Triage Not Run Yet</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Execute the AI triage agent to analyze reported symptoms, check deterministic safety guardrails, retrieve unit memory, and match an active contractor from the directory.
                    </p>
                  </div>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={handleRunTriage}
                    isLoading={isTriaging}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run AI Triage Agent Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* AI Triage Synthesis Card */}
                <Card className="border-emerald-500/30 shadow-xs">
                  <CardHeader className="bg-emerald-50/30 border-b border-emerald-100/60">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <CardTitle className="text-sm text-emerald-950">AI Triage Assessment</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Confidence:</span>
                        <Badge variant="success" className="font-mono text-[10px]">
                          {Math.round(triage.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    {/* Summary */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        AI Issue Summary
                      </span>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {triage.issue_summary}
                      </p>
                    </div>

                    {/* Reasoning with Citations */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900 block mb-0.5">
                        Agent Reasoning & Historical Fact Alignment:
                      </span>
                      {triage.reasoning_summary}
                    </div>

                    {/* Safety Flags if Any */}
                    {triage.safety_flags.length > 0 && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
                        <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Safety Considerations Identified:
                        </span>
                        <ul className="list-disc list-inside text-xs text-amber-800 space-y-0.5 pl-1">
                          {triage.safety_flags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Probing Missing Information Questions */}
                    {triage.missing_information.length > 0 && (
                      <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-1.5">
                        <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                          Recommended Follow-Up Questions (Missing Details):
                        </span>
                        <p className="text-[11px] text-blue-700">
                          The request is missing key operational variables. Ask occupant before dispatch:
                        </p>
                        <ul className="list-disc list-inside text-xs text-blue-950 space-y-1 pl-1">
                          {triage.missing_information.map((q, idx) => (
                            <li key={idx} className="font-medium">{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommended Actions */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Recommended Operations Workflow
                      </span>
                      <div className="space-y-1.5">
                        {triage.recommended_actions.map((act, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-800">
                            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Contractor Card (Backed by Real DB Record) */}
                <Card className="border-slate-200">
                  <CardHeader className="bg-slate-50/50">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-slate-700" />
                        <CardTitle className="text-sm">Matched Contractor</CardTitle>
                      </div>
                      <Badge variant="neutral" className="text-[10px]">
                        Database Directory Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    {!triage.recommended_contractor ? (
                      <div className="text-center py-4 text-xs text-slate-500">
                        {isEmergency
                          ? 'Emergency Protocol Active: Routine contractor scheduling is suspended. Refer to emergency dispatch protocols.'
                          : 'No active contractor in directory currently matches the required trade category.'}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {triage.recommended_contractor.contractor_name}
                            </h4>
                            <p className="text-xs text-emerald-700 font-medium">
                              {triage.recommended_contractor.company}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Service Area: {triage.recommended_contractor.service_area}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {triage.recommended_contractor.match_score}% Match Score
                            </span>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Response: {triage.recommended_contractor.estimated_response_time}
                            </p>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-xs text-slate-700 space-y-1">
                          <span className="font-semibold text-slate-800 text-[11px] block">
                            Why this contractor was selected:
                          </span>
                          <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                            {triage.recommended_contractor.match_reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Contractors are never automatically contacted. Manager sign-off required.</span>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleCreateWorkOrder}
                      isLoading={isCreatingWorkOrder}
                      className="text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Approve & Draft Work Order
                    </Button>
                  </CardFooter>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
