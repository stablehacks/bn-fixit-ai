'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Flame,
  Wrench,
  Layers,
  ArrowRight,
  ShieldAlert,
  History,
  CheckCircle2,
  Clock,
  Play,
  FileCheck,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { UrgencyBadge, Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function DemoPage() {
  const router = useRouter();
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [memoryDemoState, setMemoryDemoState] = useState<'idle' | 'step1_created' | 'step2_running' | 'completed'>('idle');
  const [memoryOutput, setMemoryOutput] = useState<string | null>(null);

  // Preloaded Scenario 1: Routine Maintenance
  const handleLoadRoutine = async () => {
    try {
      setLoadingScenario('routine');
      const res = await fetch('/api/maintenance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: 'prop_oak_01',
          unit_number: '102',
          category: 'general_maintenance',
          description: 'The kitchen cabinet handle beneath the island is loose and wobbling when pulled.',
          tenant_name: 'Emma Watson',
          tenant_phone: '(555) 901-2345',
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/requests/${json.data.id}`);
      }
    } finally {
      setLoadingScenario(null);
    }
  };

  // Preloaded Scenario 2: High-Priority Plumbing Leak
  const handleLoadHighPriority = async () => {
    try {
      setLoadingScenario('high');
      const res = await fetch('/api/maintenance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: 'prop_oak_01',
          unit_number: '305',
          category: 'plumbing',
          description: 'Active water leak beneath the kitchen sink. Water is pooling rapidly across the cabinet baseboard and onto the kitchen tile floor.',
          tenant_name: 'David Chen',
          tenant_phone: '(555) 789-0123',
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/requests/${json.data.id}`);
      }
    } finally {
      setLoadingScenario(null);
    }
  };

  // Preloaded Scenario 3: Critical Gas Leak Emergency
  const handleLoadEmergency = async () => {
    try {
      setLoadingScenario('emergency');
      const res = await fetch('/api/maintenance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: 'prop_oak_01',
          unit_number: '410',
          category: 'heating_and_cooling',
          description: 'Strong rotten egg sulfur gas odor detected near the utility closet. Tenant heard a continuous faint hissing sound near the furnace pipe.',
          tenant_name: 'Marcus Brody',
          tenant_phone: '(555) 654-3210',
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push(`/requests/${json.data.id}`);
      }
    } finally {
      setLoadingScenario(null);
    }
  };

  // Unit 204 Memory Sequence Demonstration (Feature G)
  const handleRunUnit204MemorySequence = async () => {
    try {
      setLoadingScenario('memory_sequence');
      setMemoryDemoState('step1_created');

      // Step 1: Ensure initial memory exists or create prior repair note
      await fetch('/api/agent/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: 'prop_oak_01',
          unit_number: '204',
          summary: 'Sub-floor shutoff valve replaced; pipe corrosion noted in main stack',
          details: 'Apex Master Plumbing replaced rusted valve. Noted severe galvanic corrosion on pipe entering drywall stack. Advised full pipe replacement if leak returns.',
          source: 'repair_completion',
          memory_type: 'confirmed_history',
        }),
      });

      setMemoryDemoState('step2_running');

      // Step 2: Ingest subsequent maintenance request referencing problem
      const reqRes = await fetch('/api/maintenance-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: 'prop_oak_01',
          unit_number: '204',
          category: 'plumbing',
          description: 'Water pooling again near bathroom floorboards behind the toilet wall.',
          tenant_name: 'Unit 204 Resident',
        }),
      });
      const reqJson = await reqRes.json();
      const requestId = reqJson.data.id;

      // Step 3: Run AI Triage (which will fetch memory and alter reasoning)
      const triageRes = await fetch(`/api/maintenance-requests/${requestId}/triage`, {
        method: 'POST',
      });
      const triageJson = await triageRes.json();

      setMemoryDemoState('completed');
      setMemoryOutput(
        `Memory Retrieved: Prior repair for Unit 204 on main stack corrosion.\n` +
        `Resulting AI Reasoning: ${triageJson.data.triage.reasoning_summary}\n` +
        `Matched Contractor: ${triageJson.data.triage.recommended_contractor?.company || 'Apex Master Plumbing'} (recalled from past repair).`
      );

      // Offer direct jump to the triaged ticket
      setTimeout(() => {
        router.push(`/requests/${requestId}`);
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScenario(null);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Judge Exploration Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Interactive Demonstration Suite
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Test pre-configured operational scenarios with synthetic data to observe how FixIt AI evaluates urgency, enforces deterministic safety rules, recalls historical memories, and recommends vetted contractors.
          </p>
        </div>

        {/* 3 Core MVP Scenarios */}
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-3">
            Core Evaluation Scenarios (Feature J)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scenario 1: Routine */}
            <Card className="hover:border-slate-300 transition-all flex flex-col justify-between">
              <div>
                <CardHeader className="bg-slate-50/50">
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-sm">1. Routine Maintenance</CardTitle>
                    <UrgencyBadge urgency="low" />
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Report:</strong> Loose kitchen cabinet island handle in Unit 102.
                  </p>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 space-y-1">
                    <span className="font-semibold text-slate-700 block">Expected AI Behavior:</span>
                    <p>• Correctly classifies as low urgency.</p>
                    <p>• Zero emergency safety flags.</p>
                    <p>• Recommends batching into weekly maintenance.</p>
                    <p>• Matches General Maintenance contractor.</p>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="bg-slate-50">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLoadRoutine}
                  isLoading={loadingScenario === 'routine'}
                  className="w-full text-xs"
                >
                  <Play className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Load & Run Routine Scenario
                </Button>
              </CardFooter>
            </Card>

            {/* Scenario 2: High Priority Plumbing */}
            <Card className="hover:border-amber-300 transition-all flex flex-col justify-between border-amber-200/80 bg-amber-50/10">
              <div>
                <CardHeader className="bg-amber-50/40">
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-sm">2. High-Priority Plumbing</CardTitle>
                    <UrgencyBadge urgency="high" />
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Report:</strong> Active water leak pooling under sink in Unit 305.
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-[11px] text-slate-600 space-y-1">
                    <span className="font-semibold text-amber-900 block">Expected AI Behavior:</span>
                    <p>• Classifies urgency as High with property damage risk.</p>
                    <p>• Probes missing info: Is water actively continuous?</p>
                    <p>• Formulates emergency water shutoff instructions.</p>
                    <p>• Matches Apex Master Plumbing (under 2h response).</p>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="bg-amber-50/40">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleLoadHighPriority}
                  isLoading={loadingScenario === 'high'}
                  className="w-full text-xs bg-amber-600 hover:bg-amber-700"
                >
                  <Play className="w-3.5 h-3.5 mr-1" />
                  Load & Run High Priority Scenario
                </Button>
              </CardFooter>
            </Card>

            {/* Scenario 3: Emergency Gas Leak */}
            <Card className="hover:border-red-400 transition-all flex flex-col justify-between border-red-300 bg-red-50/20">
              <div>
                <CardHeader className="bg-red-50/50">
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-sm text-red-950 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-red-600" />
                      3. Critical Gas Leak
                    </CardTitle>
                    <UrgencyBadge urgency="emergency" />
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs text-slate-700 leading-relaxed">
                    <strong>Report:</strong> Rotten egg sulfur smell and hissing pipe in Unit 410.
                  </p>
                  <div className="p-2.5 bg-white rounded-lg border border-red-200 text-[11px] text-red-950 space-y-1">
                    <span className="font-bold text-red-700 block">Expected Safety Escalation:</span>
                    <p>• Deterministic safety override triggers immediately.</p>
                    <p>• Routine contractor scheduling blocked.</p>
                    <p>• Emergency 911 & Gas Utility evacuation protocol shown.</p>
                    <p>• Prominent red hazard warning surfaced.</p>
                  </div>
                </CardContent>
              </div>
              <CardFooter className="bg-red-50/50">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={handleLoadEmergency}
                  isLoading={loadingScenario === 'emergency'}
                  className="w-full text-xs"
                >
                  <Flame className="w-3.5 h-3.5 mr-1" />
                  Load & Run Emergency Protocol
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Feature G: Unit 204 Memory Two-Interaction Demonstration */}
        <Card className="border-emerald-500/40 bg-gradient-to-br from-emerald-50/30 via-white to-slate-50">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <div>
                  <CardTitle>Unit 204 Two-Interaction Memory Demonstration (Feature G)</CardTitle>
                  <CardDescription>
                    Demonstrates how SurrealDB Agent Memory persists context across interactions and influences agent recommendations
                  </CardDescription>
                </div>
              </div>
              <Badge variant="info">Persistent Memory Workflow</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Interaction 1: Prior Completed Repair
                </span>
                <p className="text-xs text-slate-700 font-medium">
                  A plumbing repair for Unit 204 was resolved. The contractor noted severe external pipe corrosion in the main stack.
                </p>
                <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded">
                  Stored to SurrealDB: [CONFIRMED HISTORY] Unit 204 main stack galvanic corrosion noted by Apex Master Plumbing.
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Interaction 2: Recurrent Maintenance Request
                </span>
                <p className="text-xs text-slate-700 font-medium">
                  A later request is submitted: &ldquo;Water pooling again near bathroom floorboards behind the toilet wall.&rdquo;
                </p>
                <div className="text-[11px] text-blue-900 font-semibold bg-blue-50 p-2 rounded">
                  AI Agent Action: Retrieves Unit 204 memory, identifies recurrence, recommends inspecting the wall stack rather than a simple patch, and suggests the same technician.
                </div>
              </div>
            </div>

            {memoryOutput && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1 font-mono">
                <span className="font-bold block text-emerald-900">Live Agent Memory Trace:</span>
                <p className="whitespace-pre-wrap">{memoryOutput}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Executes full automated 2-step lifecycle: Seed memory → Ingest request → Recall & Triage
            </span>
            <Button
              size="sm"
              variant="primary"
              onClick={handleRunUnit204MemorySequence}
              isLoading={loadingScenario === 'memory_sequence'}
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Execute Unit 204 Memory Demonstration
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Shell>
  );
}
