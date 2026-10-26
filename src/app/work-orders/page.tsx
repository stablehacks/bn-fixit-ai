'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Building,
  Send,
  MessageSquare,
  FileCheck,
  Ban,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UrgencyBadge, WorkOrderStatusBadge, Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkOrder, WorkOrderStatus, Contractor, MaintenanceRequest, Property } from '@/lib/types';
import { formatDate, formatTimeAgo } from '@/lib/utils';

type EnrichedWorkOrder = WorkOrder & {
  maintenance_request?: MaintenanceRequest;
  contractor?: Contractor;
  property?: Property;
};

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<EnrichedWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalWo, setActiveModalWo] = useState<EnrichedWorkOrder | null>(null);
  const [targetStatus, setTargetStatus] = useState<WorkOrderStatus>('Approved');
  const [transitionNotes, setTransitionNotes] = useState('');
  const [simulateDispatch, setSimulateDispatch] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/work-orders');
      const json = await res.json();
      if (json.success) {
        setWorkOrders(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const openStatusModal = (wo: EnrichedWorkOrder, nextStatus: WorkOrderStatus) => {
    setActiveModalWo(wo);
    setTargetStatus(nextStatus);
    setTransitionNotes('');
    setSimulateDispatch(nextStatus === 'Approved' || nextStatus === 'Scheduled');
    setErrorMessage(null);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalWo) return;
    setErrorMessage(null);

    if (targetStatus === 'Completed' && !transitionNotes.trim()) {
      setErrorMessage('Completion notes are required when marking a work order as Completed.');
      return;
    }

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/work-orders/${activeModalWo.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          notes: transitionNotes.trim() || undefined,
          simulated_dispatch: simulateDispatch,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update work order status.');
      }

      setSuccessMessage(`Work Order ${activeModalWo.id} updated to '${targetStatus}'!`);
      setActiveModalWo(null);
      await fetchWorkOrders();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setErrorMessage(e.message || 'Status transition error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Work Orders</h1>
            <p className="text-sm text-slate-500 mt-1">
              Review AI-drafted repair scopes, approve contractor dispatch, and track lifecycle to completion.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Work Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-16 text-center text-sm text-slate-400">Loading work orders...</div>
          ) : workOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center space-y-3">
                <Wrench className="w-8 h-8 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Work Orders</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Work orders are drafted by the AI triage agent from maintenance requests.
                </p>
                <Link href="/requests">
                  <Button size="sm" variant="primary">
                    View Maintenance Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            workOrders.map(wo => {
              const req = wo.maintenance_request;
              const contractor = wo.contractor;

              return (
                <Card key={wo.id} className="hover:border-slate-300 transition-all">
                  <CardHeader className="bg-slate-50/50 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">
                          {wo.id}
                        </span>
                        <WorkOrderStatusBadge status={wo.status} />
                        <UrgencyBadge urgency={wo.priority} />
                        {req && (
                          <span className="text-xs text-slate-500">
                            Unit {req.unit_number} ({wo.property?.name || 'Oakridge'})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        Created {formatTimeAgo(wo.created_at)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    {/* Summary & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">
                        {wo.issue_summary}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-200/70">
                        {wo.description}
                      </p>
                    </div>

                    {/* Metadata: Contractor & Manager */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-0.5">Assigned Trade Contractor</span>
                        {contractor ? (
                          <div className="font-medium text-slate-800">
                            <span className="font-semibold text-slate-900">{contractor.name}</span> • {contractor.company}
                            <span className="text-slate-400 block text-[11px]">{contractor.contact_details.phone} • {contractor.contact_details.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No contractor assigned yet</span>
                        )}
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 block mb-0.5">Assigned Manager & Approvals</span>
                        <div className="font-medium text-slate-800">
                          {wo.assigned_manager}
                          {wo.approval_history.length > 0 && (
                            <span className="text-emerald-700 block text-[11px] font-semibold">
                              ✓ Approved by {wo.approval_history[0].approved_by} on {formatDate(wo.approval_history[0].approved_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Completion notes if completed */}
                    {wo.status === 'Completed' && (
                      <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs text-emerald-950">
                        <span className="font-bold block mb-0.5 text-emerald-900">
                          Completion Resolution Notes (Stored to Agent Memory):
                        </span>
                        <p>{wo.completion_notes}</p>
                      </div>
                    )}

                    {/* Simulated Actions Banner */}
                    {wo.simulated_actions && wo.simulated_actions.length > 0 && (
                      <div className="p-2.5 bg-slate-100/80 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                        <span className="font-semibold text-slate-700 block">Simulated Operational Trail:</span>
                        {wo.simulated_actions.map((act, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  {/* Actions Bar */}
                  <CardFooter className="py-3 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Manager approval required before dispatch</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {wo.status === 'Awaiting Approval' && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => openStatusModal(wo, 'Approved')}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                            Approve Work Order
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openStatusModal(wo, 'Needs Information')}
                          >
                            Request More Info
                          </Button>
                        </>
                      )}

                      {wo.status === 'Approved' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openStatusModal(wo, 'Scheduled')}
                        >
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          Mark Scheduled
                        </Button>
                      )}

                      {wo.status === 'Scheduled' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openStatusModal(wo, 'In Progress')}
                        >
                          <Wrench className="w-3.5 h-3.5 mr-1.5" />
                          Start Repair (In Progress)
                        </Button>
                      )}

                      {wo.status === 'In Progress' && (
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => openStatusModal(wo, 'Completed')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          Mark Completed & Record Memory
                        </Button>
                      )}

                      {wo.status !== 'Completed' && wo.status !== 'Cancelled' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-slate-400 hover:text-rose-600"
                          onClick={() => openStatusModal(wo, 'Cancelled')}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>

        {/* Modal for Status Transitions & Human Approvals */}
        {activeModalWo && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-base font-bold text-slate-900">
                  Update Work Order: {activeModalWo.id}
                </h3>
                <WorkOrderStatusBadge status={targetStatus} />
              </div>

              <form onSubmit={handleStatusSubmit}>
                <div className="p-6 space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600">
                    Transitioning status from <strong className="font-semibold text-slate-900">{activeModalWo.status}</strong> to <strong className="font-semibold text-slate-900">{targetStatus}</strong>.
                  </p>

                  {targetStatus === 'Approved' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
                      <span className="font-bold block">Explicit Manager Sign-off:</span>
                      <p>
                        By clicking confirm, you authorize the proposed scope of work and contractor allocation under your property management credentials.
                      </p>
                    </div>
                  )}

                  {targetStatus === 'Completed' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Repair Completion Notes <span className="text-rose-500">* (Required)</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Detail the work performed, replaced parts, warranty notes, or advice for the occupant. This will be automatically archived into SurrealDB Agent Memory for future reference."
                        value={transitionNotes}
                        onChange={e => setTransitionNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  )}

                  {targetStatus !== 'Completed' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">
                        Operational Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Add internal notes or instructions for the record..."
                        value={transitionNotes}
                        onChange={e => setTransitionNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                      />
                    </div>
                  )}

                  {targetStatus === 'Approved' && (
                    <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={simulateDispatch}
                        onChange={e => setSimulateDispatch(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Generate simulated notification draft for contractor</span>
                    </label>
                  )}
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModalWo(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isUpdating}
                  >
                    Confirm {targetStatus}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
