import Link from 'next/link';
import {
  BrainCircuit,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ClipboardList,
  Activity,
  Flame,
  Layers,
  Smartphone,
  Lock,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/90 px-6 sm:px-8 py-4 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">FixIt AI</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  MVP LIVE
                </span>
              </div>
              <p className="text-xs text-slate-500">Autonomous Maintenance Operations Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/demo">
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-white"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                Judge Demo Hub
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" variant="primary" className="text-xs font-semibold shadow-xs">
                Enter Dashboard
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 sm:py-20 max-w-5xl mx-auto">
        {/* Guardrail Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Deterministic Safety Guardrails • Human-in-the-Loop Operations</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.15]">
          Turn Maintenance Complaints into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
            Actionable Work Orders
          </span>{' '}
          in Seconds
        </h1>

        {/* Subtitle */}
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mt-5 leading-relaxed font-normal">
          FixIt AI empowers independent residential property managers to triage tenant complaints, enforce deterministic gas &amp; electrical safety protocols, recall persistent unit memory with SurrealDB, and dispatch verified local contractors on web and mobile.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
          <Link href="/dashboard">
            <Button size="lg" variant="primary" className="text-sm font-semibold shadow-sm hover:shadow">
              <ClipboardList className="w-4 h-4 mr-2" />
              Launch Operations Dashboard
            </Button>
          </Link>
          <Link href="/demo">
            <Button
              size="lg"
              variant="outline"
              className="text-sm font-semibold border-slate-300 text-slate-800 hover:bg-slate-100 bg-white"
            >
              <Sparkles className="w-4 h-4 mr-2 text-emerald-600" />
              Interactive Demo Scenarios
            </Button>
          </Link>
          <Link href="/ai-activity">
            <Button
              size="lg"
              variant="outline"
              className="text-sm font-semibold border-slate-300 text-slate-800 hover:bg-slate-100 bg-white"
            >
              <Activity className="w-4 h-4 mr-2 text-blue-600" />
              Run 15-Test Eon Benchmark
            </Button>
          </Link>
        </div>

        {/* Partner Tech Trust Strip */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 w-full max-w-3xl">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-4">
            Powered by the Build North Partner Stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <Smartphone className="w-3.5 h-3.5 text-slate-800" />
              Expo SDK 58 (Mobile App)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              Clerk Authentication
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              SurrealDB Agent Memory
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Era by Eon Evaluation
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
              <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
              Anthropic Claude 3.5
            </span>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12 text-left w-full">
          {/* Card 1 */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">AI Maintenance Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Structured classification with Anthropic Claude, probing missing details, and estimating calibrated repair urgency.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Deterministic Safety</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gas leaks &amp; electrical hazards trigger immediate 911 evacuation guidance. The AI cannot downgrade emergencies.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">SurrealDB Agent Memory</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Persists unit history across interactions. Recalls prior pipe corrosion for Unit 204 to alter root-cause triage.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Human-in-the-Loop</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real contractor matching from verified database. Mandatory manager approval before work is dispatched.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            FixIt AI • Built for Build North 🍁 • Residential Property Operations Agent
          </p>
          <div className="flex items-center gap-4 text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-900 font-medium">Dashboard</Link>
            <Link href="/demo" className="hover:text-slate-900 font-medium">Demo Hub</Link>
            <Link href="/ai-activity" className="hover:text-slate-900 font-medium">Eon Benchmark</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
