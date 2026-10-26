import Link from 'next/link';
import {
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Wrench,
  CheckCircle2,
  Activity,
  Flame,
  Layers,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 px-8 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">FixIt AI</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MVP READY
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Maintenance Operations Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/demo">
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-200 bg-slate-800/60 hover:bg-slate-800 hover:text-white text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Judge Demo Hub
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" variant="primary" className="text-xs font-semibold">
              Enter Dashboard
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Production-Grade Architecture • Deterministic Safety Guardrails</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Turn Maintenance Complaints into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            Actionable Work Orders
          </span>{' '}
          in Seconds
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mt-5 leading-relaxed font-normal">
          FixIt AI empowers independent property managers to triage tenant complaints, enforce gas &amp; electrical emergency safety protocols, recall unit memory with SurrealDB, and match verified local contractors.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link href="/dashboard">
            <Button size="lg" variant="primary" className="text-sm font-semibold shadow-lg shadow-emerald-500/20">
              <ClipboardList className="w-4 h-4 mr-2" />
              Launch Operations Dashboard
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="secondary" className="border border-slate-700 text-sm font-semibold bg-slate-800 hover:bg-slate-700">
              <Sparkles className="w-4 h-4 mr-2 text-emerald-400" />
              Interactive Demo Scenarios
            </Button>
          </Link>
          <Link href="/ai-activity">
            <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:text-white bg-slate-900/60 text-sm">
              <Activity className="w-4 h-4 mr-2 text-blue-400" />
              Run 15-Test Eon Benchmark
            </Button>
          </Link>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 text-left w-full">
          <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">AI Maintenance Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Structured classification with Anthropic Claude, probing missing info, and calibrated urgency.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Deterministic Safety</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gas leaks &amp; electrical hazards trigger immediate 911 escalation. AI cannot downgrade emergencies.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">SurrealDB Agent Memory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Persists unit repair histories. Recalls prior pipe corrosion for Unit 204 to alter root-cause triage.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Human-in-the-Loop</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real contractor matching from verified database. Mandatory manager sign-off before dispatch.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-8 py-5 text-center text-xs text-slate-500">
        FixIt AI • Residential Property Operations Agent • Clerk Auth • SurrealDB • Anthropic Claude • Era by Eon Benchmark
      </footer>
    </div>
  );
}
