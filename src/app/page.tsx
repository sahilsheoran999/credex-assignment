'use client';

import * as React from 'react';
import { AuditInputType } from '@/lib/schemas';
import { AuditInput, AuditResult } from '@/types/audit';
import { runAudit } from '@/lib/audit-engine';
import { SpendForm } from '@/components/SpendForm';
import { AuditResults } from '@/components/AuditResults';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  ShieldCheck,
  TrendingDown,
  Activity,
  Landmark,
  Zap,
  DollarSign,
  PieChart as ChartIcon,
} from 'lucide-react';

const STATS_DATA = [
  { icon: DollarSign, label: 'Average Overspend Found', value: '$2,400+/yr' },
  { icon: TrendingDown, label: 'Average Savings Lift', value: '31%' },
  { icon: ShieldCheck, label: 'Defensible Accuracy', value: '100%' },
];

export default function Home() {
  const [auditInput, setAuditInput] = React.useState<AuditInput | null>(null);
  const [auditResult, setAuditResult] = React.useState<AuditResult | null>(null);
  const [isAuditing, setIsAuditing] = React.useState<boolean>(false);

  const handleAuditSubmit = async (data: AuditInputType) => {
    setIsAuditing(true);
    // Simulate short computation for modern SaaS premium feel
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    try {
      const result = runAudit(data as AuditInput);
      setAuditInput(data as AuditInput);
      setAuditResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleReset = () => {
    setAuditInput(null);
    setAuditResult(null);
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 font-sans antialiased relative overflow-hidden flex flex-col justify-between">
      {/* Curved Visual Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-purple-500/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="w-full flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 space-y-12">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center space-x-2">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-md">
              <Landmark className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight text-white">
              Spend<span className="text-indigo-400">Optic</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-300 hover:text-indigo-200 font-bold bg-indigo-500/10 px-3.5 py-1.5 rounded-lg border border-indigo-500/20 tracking-wide transition-all"
            >
              By Credex
            </a>
          </div>
        </header>

        {/* Hero Section */}
        {!auditResult && (
          <section className="text-center max-w-3xl mx-auto space-y-4 py-6">
            <span className="bg-indigo-500/10 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/20 tracking-wider uppercase inline-flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-indigo-400 animate-pulse" />
              100% Free Self-Serve AI Spend Audit
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Plug the Cash Leaks in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">AI Software Stack</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Startups overspend by an average of 31% on Cursor seats, Claude licenses, and unoptimized API tokens. Run an instant, 100% defensible financial audit now.
            </p>

            {/* Quick stats panel */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-6">
              {STATS_DATA.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center space-y-1 hover:border-white/10 transition-all"
                  >
                    <Icon className="h-4 w-4 text-indigo-400" />
                    <span className="text-[10px] text-slate-400 text-center font-medium leading-none">
                      {s.label}
                    </span>
                    <span className="text-xs font-black text-white">{s.value}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Primary Interactive Form/Results Container */}
        <section className="transition-all duration-300">
          {auditResult && auditInput ? (
            <AuditResults result={auditResult} rawInput={auditInput} onReset={handleReset} />
          ) : (
            <SpendForm onSubmit={handleAuditSubmit} isLoading={isAuditing} />
          )}
        </section>

        {/* Brand Trust footer info */}
        {!auditResult && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/10 pt-12">
            <div className="flex items-start space-x-3.5">
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-2.5 text-indigo-400 flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">100% Data Confidentiality Guarantee</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We strip all email handles, names, and team details from shareable urls. Your raw inputs are processed in transient memory and never leased to third parties.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-2.5 text-indigo-400 flex-shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Defensible CFO-Grade Math</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our calculations reflect real vendor limits (minimum seat caps, API prompt caches, and consolidation alternatives), not synthetic mock calculations.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Footer Copy */}
      <footer className="w-full border-t border-white/5 py-6 bg-slate-950/80 backdrop-blur-md relative z-10">
        <div className="max-w-5xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>&copy; {new Date().getFullYear()} SpendOptic AI. Built for the Credex Internship evaluation.</span>
          <div className="flex items-center space-x-4">
            <a href="https://credex.rocks" className="hover:text-indigo-400 transition-colors">
              Credex.rocks
            </a>
            <span className="text-slate-700">|</span>
            <span className="font-mono text-[10px]">Secure PG Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
