'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardList,
  Building,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  Sparkles,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Property, IssueCategory } from '@/lib/types';

export default function NewRequestPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);

  // Form state
  const [propertyId, setPropertyId] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [category, setCategory] = useState<IssueCategory>('general_maintenance');
  const [description, setDescription] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch('/api/properties');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setProperties(json.data);
          setPropertyId(json.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProps(false);
      }
    }
    loadProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!propertyId) {
      setError('Please select a property.');
      return;
    }
    if (!unitNumber.trim()) {
      setError('Please enter a unit number.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('Please enter a descriptive report of the maintenance issue (min 5 characters).');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/maintenance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: propertyId,
          unit_number: unitNumber.trim(),
          category,
          description: description.trim(),
          tenant_name: tenantName.trim() || undefined,
          tenant_phone: tenantPhone.trim() || undefined,
          photo_url: photoUrl.trim() || undefined,
          reported_at: new Date().toISOString(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit request.');
      }

      // Automatically redirect to request detail page so AI triage can run
      router.push(`/requests/${json.data.id}`);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Error creating request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation back */}
        <div className="flex items-center gap-2">
          <Link
            href="/requests"
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Maintenance Requests
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Maintenance Request Intake
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Log an authenticated tenant issue or submit a maintenance ticket on behalf of a resident.
            </p>
          </div>
        </div>

        {/* Clerk Authenticated Session Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">Clerk Authenticated Session:</span>
            <span className="text-slate-600">Alex Morgan (Senior PM) • Oakridge Property Management</span>
          </div>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 shrink-0">
            Role: Authorized Submitter
          </span>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Issue & Location Details</CardTitle>
              <CardDescription>Select unit and describe reported symptoms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Property & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Property Location <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={propertyId}
                    onChange={e => setPropertyId(e.target.value)}
                    disabled={loadingProps}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.address})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Unit / Suite Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 204 or Penthouse A"
                    value={unitNumber}
                    onChange={e => setUnitNumber(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Issue Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as IssueCategory)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                >
                  <option value="plumbing">Plumbing (leaks, clogs, toilets, pipes)</option>
                  <option value="electrical">Electrical (sparking, breakers, lights, outlets)</option>
                  <option value="heating_and_cooling">Heating & Cooling (furnace, AC, gas smell)</option>
                  <option value="appliances">Appliances (fridge, stove, dishwasher)</option>
                  <option value="structural">Structural (roof, ceiling, walls, foundation)</option>
                  <option value="pest_control">Pest Control (insects, rodents)</option>
                  <option value="general_maintenance">General Maintenance (doors, handles, fixtures)</option>
                  <option value="other">Other / Miscellaneous</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Problem Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe the problem, when it started, and any audible or visible signs (e.g. water accumulation, smell, strange sounds)..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Our AI agent will review this description, verify against safety rules, probe for missing info, and suggest a matched contractor.
                </p>
              </div>

              {/* Tenant Details */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-700 mb-3">
                  Tenant Information (Optional / Synthetic Demo Data)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Tenant Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={tenantName}
                      onChange={e => setTenantName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g. (555) 123-4567"
                      value={tenantPhone}
                      onChange={e => setTenantPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Upload simulation */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Resident Photograph (Private / Optional)
                </label>
                <div className="border border-dashed border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <p className="text-xs text-slate-600 font-medium">Simulated Private Tenant Upload</p>
                  <p className="text-[11px] text-slate-400">
                    PNG, JPG up to 10MB. Stored with private organization-level access controls.
                  </p>
                  <input
                    type="text"
                    placeholder="Optional image attachment label or URL"
                    value={photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    className="mt-2 w-full max-w-sm bg-white border border-slate-200 text-xs rounded px-2.5 py-1 text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Link href="/requests">
                  <Button type="button" variant="outline" size="sm">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Submit & Open AI Triage
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </Shell>
  );
}
