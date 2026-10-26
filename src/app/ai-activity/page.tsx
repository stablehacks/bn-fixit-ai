'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Clock,
  Database,
  Lock,
  Layers,
  FileCheck,
  Flame,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuditEvent, EvaluationSuiteReport, EvaluationResultItem } from '@/lib/types';
import { formatDate, formatTimeAgo } from '@/lib/utils';

export default function AIActivityPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'evaluation'>('evaluation');
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(true);

  // Evaluation state
  const [evalReport, setEvalReport] = useState<EvaluationSuiteReport | null>(null);
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAudit() {
      try {
        setLoadingAudit(true);
        const res = await fetch('/api/audit-events');
        const json = await res.json();
        if (json.success) {
          setAuditEvents(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAudit(false);
      }
    }
    loadAudit();
  }, []);

  const handleRunEvaluation = async () => {
    try {
      setIsRunningEval(true);
      setEvalError(null);
      const res = await fetch('/api/agent/evaluate', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Evaluation suite run failed.');
      }
      setEvalReport(json.data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setEvalError(e.message || 'Evaluation run error');
    } finally {
      setIsRunningEval(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header & Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AI Activity & Agent Evaluation
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Comprehensive audit trail & automated Era by Eon agent verification benchmark suite.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'evaluation'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Evaluation Suite (Era by Eon)
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Audit Trail Log
            </button>
          </div>
        </div>

        {/* TAB 1: Evaluation Suite (Feature I) */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            {/* Eon Integration Header Card */}
            <Card className="bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 text-white border-slate-800">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Era by Eon Integration
                      </span>
                      <span className="text-xs text-slate-300">15 Synthetic Test Scenarios</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">
                      FixIt AI Agent Benchmark Suite
                    </h2>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                      Measures issue classification, urgency calibration, deterministic emergency overrides, contractor recommendation validity, SurrealDB memory retrieval relevance, cross-organization data isolation, and output schema compliance.
                    </p>
                  </div>

                  <Button
                    size="md"
                    variant="primary"
                    onClick={handleRunEvaluation}
                    isLoading={isRunningEval}
                    className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run 15-Scenario Benchmark
                  </Button>
                </div>
              </CardContent>
            </Card>

            {evalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                {evalError}
              </div>
            )}

            {/* Benchmark Summary if Report Generated */}
            {evalReport ? (
              <div className="space-y-6">
                {/* Metric Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <span className="text-xs font-medium text-slate-500 block">Total Scenarios</span>
                      <span className="text-2xl font-bold text-slate-900 mt-1 block">
                        {evalReport.total_scenarios}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Synthetic edge cases</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-emerald-50/30 border-emerald-200">
                    <CardContent className="p-4">
                      <span className="text-xs font-semibold text-emerald-800 block">Passed Tests</span>
                      <span className="text-2xl font-bold text-emerald-950 mt-1 block">
                        {evalReport.passed_scenarios} / {evalReport.total_scenarios}
                      </span>
                      <p className="text-[11px] text-emerald-700/80 mt-0.5">Satisfied all criteria</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <span className="text-xs font-medium text-slate-500 block">Benchmark Score</span>
                      <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                        {evalReport.pass_rate}%
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Pass rate</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <span className="text-xs font-medium text-slate-500 block">Execution Time</span>
                      <span className="text-2xl font-bold text-slate-900 mt-1 block">
                        {evalReport.results.reduce((acc, r) => acc + r.latency_ms, 0)} ms
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Aggregate runtime</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Scenario Results Breakdown Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Scenario Verification Breakdown</CardTitle>
                    <CardDescription>
                      Evaluated on classification, urgency, safety, contractor match, memory recall, and org security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Scenario ID & Title</th>
                            <th className="py-3 px-4">Classification</th>
                            <th className="py-3 px-4">Safety Guard</th>
                            <th className="py-3 px-4">Contractor</th>
                            <th className="py-3 px-4">Memory Recall</th>
                            <th className="py-3 px-4">Org Auth</th>
                            <th className="py-3 px-4">Latency</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {evalReport.results.map((res: EvaluationResultItem) => (
                            <tr key={res.scenario_id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-4">
                                {res.passed ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> PASS
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                    <XCircle className="w-3.5 h-3.5 text-rose-600" /> FAIL
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-900 max-w-xs">
                                <div>{res.title}</div>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {res.scenario_id}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={res.category_correct ? 'text-emerald-700' : 'text-rose-600 font-bold'}>
                                  {res.category_correct ? '✓ Valid' : '✗ Category Err'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={res.safety_escalated_correctly ? 'text-emerald-700' : 'text-rose-600 font-bold'}>
                                  {res.safety_escalated_correctly ? '✓ Enforced' : '✗ Missed'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={res.contractor_matched_correctly ? 'text-emerald-700' : 'text-rose-600 font-bold'}>
                                  {res.contractor_matched_correctly ? '✓ Matched' : '✗ No Trade'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={res.memory_relevance_correct ? 'text-emerald-700' : 'text-rose-600 font-bold'}>
                                  {res.memory_relevance_correct ? '✓ Verified' : '✗ Bleed'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={res.authorization_protected ? 'text-emerald-700' : 'text-rose-600 font-bold'}>
                                  {res.authorization_protected ? '✓ Isolated' : '✗ Leak'}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                                {res.latency_ms} ms
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-dashed border-2 border-slate-200">
                <CardContent className="p-12 text-center space-y-3">
                  <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">
                    Ready to Run Evaluation Benchmark
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click &ldquo;Run 15-Scenario Benchmark&rdquo; to execute the repeatable evaluation suite across all 15 operational scenarios.
                  </p>
                  <Button size="sm" variant="primary" onClick={handleRunEvaluation} isLoading={isRunningEval}>
                    <Play className="w-3.5 h-3.5 mr-1.5" /> Launch Benchmark
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: Operational Audit Trail (Feature H) */}
        {activeTab === 'audit' && (
          <Card>
            <CardHeader>
              <CardTitle>Application Audit Trail</CardTitle>
              <CardDescription>
                Chronological immutable record of human decisions, AI classifications, and state transitions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loadingAudit ? (
                <div className="p-12 text-center text-xs text-slate-400">Loading audit log...</div>
              ) : auditEvents.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">No events logged yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {auditEvents.map(event => (
                    <div key={event.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
                            {event.event_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            actor: {event.actor_id}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            target: {event.entity_type} [{event.entity_id}]
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {event.metadata && typeof event.metadata === 'object'
                            ? JSON.stringify(event.metadata)
                            : 'Standard operational event'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-slate-500 font-medium block">
                          {formatDate(event.created_at)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatTimeAgo(event.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
}
