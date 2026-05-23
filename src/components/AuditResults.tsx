'use client';

import * as React from 'react';
import { AuditResult, AuditInput, LeadInput } from '@/types/audit';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  TrendingDown,
  Sparkles,
  Mail,
  Share2,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  FileText,
  Copy,
  Activity,
  ArrowLeft,
  Building,
  User,
  Users,
} from 'lucide-react';

interface AuditResultsProps {
  result: AuditResult;
  rawInput: AuditInput;
  onReset: () => void;
}

export function AuditResults({ result, rawInput, onReset }: AuditResultsProps) {
  const [summary, setSummary] = React.useState<string>('');
  const [isSummaryLoading, setIsSummaryLoading] = React.useState<boolean>(true);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState<boolean>(false);
  const [shareUrl, setShareUrl] = React.useState<string>('');
  const [isSharingLoading, setIsSharingLoading] = React.useState<boolean>(false);
  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  // Lead capture state
  const [leadEmail, setLeadEmail] = React.useState<string>('');
  const [leadCompany, setLeadCompany] = React.useState<string>('');
  const [leadRole, setLeadRole] = React.useState<string>('');
  const [leadTeamSize, setLeadTeamSize] = React.useState<string>(result.teamSize.toString());
  const [honeypot, setHoneypot] = React.useState<string>('');
  const [isLeadSubmitted, setIsLeadSubmitted] = React.useState<boolean>(false);
  const [isLeadLoading, setIsLeadLoading] = React.useState<boolean>(false);
  const [leadError, setLeadError] = React.useState<boolean>(false);

  const isHighSavings = result.totalMonthlySavings >= 500;
  const isOptimal = result.totalMonthlySavings < 100;

  // Chart data formatting
  const chartData = result.items.map((item) => ({
    name: item.toolName,
    'Current Spend': item.currentSpend,
    'Recommended Spend': item.recommendedSpend,
  }));

  // Fetch AI Summary
  React.useEffect(() => {
    let active = true;

    async function fetchSummary() {
      try {
        const response = await fetch('/api/audit-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(result),
        });
        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        if (active) {
          setSummary(data.summary);
        }
      } catch (e) {
        console.error('AI summary fetch failed, using fallback.', e);
        if (active) {
          // Robust templated fallback
          setSummary(
            `Your AI spend is currently $${result.totalCurrentSpend}/mo. By implementing our recommended downgrades, consolidation strategies, and volume credit pricing, your team can reduce this to $${result.totalRecommendedSpend}/mo. This translates to an immediate savings of $${result.totalMonthlySavings}/mo ($${result.totalAnnualSavings}/yr). Major savings are unlocked by optimizing seat plans on toolsets like Cursor or Claude, and routing high production API traffic via Credex infrastructure pools.`
          );
        }
      } finally {
        if (active) {
          setIsSummaryLoading(false);
        }
      }
    }

    fetchSummary();
    return () => {
      active = false;
    };
  }, [result]);

  // Lead Submission
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail) return;

    // Honeypot check (abuse protection)
    if (honeypot) {
      console.warn('Spam submission detected via honeypot.');
      setIsLeadSubmitted(true); // Mock success to spam bot
      return;
    }

    setIsLeadLoading(true);
    setLeadError(false);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: leadEmail,
          companyName: leadCompany,
          role: leadRole,
          teamSize: leadTeamSize,
          auditResult: result,
        }),
      });

      if (!response.ok) throw new Error('Failed to save lead');
      setIsLeadSubmitted(true);
    } catch (e) {
      console.error(e);
      setLeadError(true);
    } finally {
      setIsLeadLoading(false);
    }
  };

  // Share audit link generation
  const handleGenerateShareLink = async () => {
    setIsSharingLoading(true);
    setIsCopied(false);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawInput,
          auditResult: result,
          email: leadEmail || null,
        }),
      });

      if (!response.ok) throw new Error('Share generation failed');
      const data = await response.json();
      
      const absoluteUrl = `${window.location.origin}/share/${data.shareSlug}`;
      setShareUrl(absoluteUrl);
      setIsShareModalOpen(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSharingLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Back CTA */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center text-sm font-medium text-slate-400 hover:text-white transition-all cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Modify Inputs
        </button>

        <Button
          type="button"
          onClick={handleGenerateShareLink}
          disabled={isSharingLoading}
          variant="outline"
          className="flex items-center"
        >
          {isSharingLoading ? (
            <Activity className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Share2 className="h-4 w-4 mr-2" />
          )}
          Share Audit Report
        </Button>
      </div>

      {/* Hero Financial Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border border-emerald-500/20 bg-gradient-to-br from-slate-900/60 to-emerald-950/20 backdrop-blur-lg shadow-emerald-500/5 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />
          <CardHeader>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest flex items-center">
              <TrendingDown className="h-4 w-4 mr-1.5" /> Potential Savings Scanned
            </span>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-1">
                <span className="text-sm text-slate-400">Monthly Savings</span>
                <h1 className="text-4xl sm:text-5xl font-black text-emerald-400">
                  ${result.totalMonthlySavings.toLocaleString()}
                </h1>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-slate-400">Annualized Savings</span>
                <h1 className="text-4xl sm:text-5xl font-black text-emerald-300">
                  ${result.totalAnnualSavings.toLocaleString()}
                </h1>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isOptimal ? (
              <div className="flex items-start bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-lg text-sm text-emerald-300">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0 text-emerald-400 mt-0.5" />
                <p>
                  <strong>Excellent work!</strong> Your startup is running a highly optimal AI software stack. You are not bleeding duplicate license costs or bloated API tokens.
                </p>
              </div>
            ) : (
              <div className="flex items-start bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-lg text-sm text-amber-300">
                <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 text-amber-400 mt-0.5" />
                <p>
                  We flagged **{result.items.filter((i) => i.savings > 0).length} optimization vectors** across your stack. Making these changes immediately plugs cash leakage.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aggregate Current Spend */}
        <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-lg flex flex-col justify-between">
          <CardHeader className="pb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Active Spend</span>
            <h2 className="text-3xl font-bold text-white mt-1">
              ${result.totalCurrentSpend.toLocaleString()}<span className="text-sm text-slate-400 font-normal">/mo</span>
            </h2>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex items-center justify-between text-sm py-1.5 border-b border-white/5">
              <span className="text-slate-400">Optimized Cost</span>
              <span className="font-semibold text-indigo-400">${result.totalRecommendedSpend.toLocaleString()}/mo</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1.5">
              <span className="text-slate-400">Efficiency Lift</span>
              <span className="font-semibold text-emerald-400">
                {result.totalCurrentSpend > 0
                  ? `${Math.round((result.totalMonthlySavings / result.totalCurrentSpend) * 100)}%`
                  : '100%'}
              </span>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <span className="text-[11px] text-slate-500 flex items-center">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 mr-1.5" /> 100% Defensible Auditing Math
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* AI Summary Block */}
      <Card className="border border-indigo-500/20 bg-slate-950/60 shadow-xl shadow-indigo-950/10 relative">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-3 text-indigo-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">AI Executive Brief</h4>
                <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest border border-indigo-500/30">
                  Anthropic CLAUDE
                </span>
              </div>
              {isSummaryLoading ? (
                <div className="space-y-2 py-2">
                  <div className="h-3 bg-white/5 rounded-full w-full animate-pulse" />
                  <div className="h-3 bg-white/5 rounded-full w-[95%] animate-pulse" />
                  <div className="h-3 bg-white/5 rounded-full w-[80%] animate-pulse" />
                </div>
              ) : (
                <p className="text-sm text-slate-300 leading-relaxed font-normal">{summary}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spend breakdown details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recharts chart */}
        <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-lg">
          <CardHeader>
            <CardTitle className="text-white text-base">Spend Differential per Tool</CardTitle>
            <CardDescription>Financial comparison of current active costs vs. our optimized recommendation plan.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: '#fff' }} />
                <Bar dataKey="Current Spend" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recommended Spend" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Breakdown Card List */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base">Per-Tool Breakdown & Insights</h3>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
            {result.items.map((item) => (
              <div
                key={item.toolId}
                className={`border p-4 rounded-xl transition-all ${
                  item.savings > 0
                    ? 'border-emerald-500/20 bg-emerald-950/5 hover:border-emerald-500/35'
                    : 'border-white/5 bg-slate-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.toolName}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Current Plan: {item.currentPlanName} ({item.currentSeats} seats)
                    </p>
                  </div>
                  {item.savings > 0 ? (
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                      Save ${item.savings.toFixed(0)}/mo
                    </span>
                  ) : (
                    <span className="bg-white/5 text-slate-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/5">
                      Optimal
                    </span>
                  )}
                </div>

                {item.savings > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-300">
                    <div className="flex items-center text-slate-400 mb-1.5">
                      <span className="font-semibold text-indigo-400 mr-1.5">Recommended Plan:</span>
                      {item.recommendedPlanName} {item.recommendedSeats > 0 ? `(${item.recommendedSeats} seats)` : ''}
                      <ChevronRight className="h-3 w-3 mx-1 text-slate-500" />
                      <span className="font-bold text-emerald-400">${item.recommendedSpend.toFixed(0)}/mo</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{item.reasoning}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Lead Capture Block */}
      <Card className={`border shadow-2xl relative overflow-hidden ${
        isHighSavings
          ? 'border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-950 to-indigo-950/20 shadow-indigo-500/5'
          : 'border-white/10 bg-slate-900/50'
      }`}>
        <CardHeader className="relative z-10">
          {isHighSavings ? (
            <div className="space-y-1">
              <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-indigo-500/30 tracking-widest inline-block mb-3">
                🔥 High-Savings Elite Pre-Approval
              </span>
              <CardTitle className="text-white text-2xl font-black">
                Unlock ${result.totalAnnualSavings.toLocaleString()}/yr Instantly
              </CardTitle>
              <CardDescription className="text-slate-300 text-base max-w-2xl mt-2 leading-relaxed">
                Your startup qualifies for **Credex Discounted Infrastructure Credits**. Claim a flat 20-30% volume discount on Cursor, Claude, ChatGPT Enterprise, and production API traffic immediately.
              </CardDescription>
            </div>
          ) : isOptimal ? (
            <div className="space-y-1">
              <CardTitle className="text-white text-xl">Monitor Stack Performance</CardTitle>
              <CardDescription className="text-slate-400">
                You are spending extremely well! Sign up below to receive a clean PDF of this audit report and get notified the exact second new pricing tiers or discounts apply to your stack.
              </CardDescription>
            </div>
          ) : (
            <div className="space-y-1">
              <CardTitle className="text-white text-xl">Capture Your Savings Report</CardTitle>
              <CardDescription className="text-slate-400">
                Secure a downloadable PDF copy of this full spend report and unlock standard pre-approved Credex discount vouchers.
              </CardDescription>
            </div>
          )}
        </CardHeader>

        <CardContent className="relative z-10">
          {isLeadSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center max-w-xl mx-auto space-y-3">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
              <h3 className="text-white font-bold text-lg">Report Secured!</h3>
              <p className="text-slate-300 text-sm">
                We have emailed a carbon copy of this audit report to <strong>{leadEmail}</strong>.
              </p>
              {isHighSavings && (
                <p className="text-xs text-indigo-300 font-medium">
                  A Credex Solutions Architect will reach out to you within 24 hours with your pre-approved credits package.
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="space-y-4 max-w-3xl">
              {/* Spam Honeypot - hidden from normal users */}
              <input
                type="text"
                name="b2b_lead_honeypot"
                style={{ display: 'none' }}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Mandatory email */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                    Business Email <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                  />
                </div>

                {/* Optional Company */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center">
                    <Building className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                    Company Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={leadCompany}
                    onChange={(e) => setLeadCompany(e.target.value)}
                  />
                </div>

                {/* Optional Role */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center">
                    <User className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                    Your Role
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. CTO / Eng Manager"
                    value={leadRole}
                    onChange={(e) => setLeadRole(e.target.value)}
                  />
                </div>

                {/* Optional Team Size */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                    Total Team Size
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. 5"
                    value={leadTeamSize}
                    onChange={(e) => setLeadTeamSize(e.target.value)}
                  />
                </div>
              </div>

              {leadError && (
                <p className="text-xs text-rose-400 font-medium">
                  Something went wrong saving your lead. Please double check the fields and try again.
                </p>
              )}

              <div className="pt-3">
                <Button
                  type="submit"
                  variant={isHighSavings ? 'premium' : 'default'}
                  className="w-full sm:w-auto font-bold tracking-wide active:scale-95 shadow-md"
                  disabled={isLeadLoading}
                >
                  {isLeadLoading ? (
                    <Activity className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  {isHighSavings ? 'Book consultation & Secure Credits' : 'Secure Audit PDF'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Share Modal Dialog */}
      <Dialog isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)}>
        <DialogHeader>
          <DialogTitle>Shareable Audit Report Created!</DialogTitle>
          <DialogDescription>
            We have securely saved this audit report to our cloud database. All private details (like emails or company names) have been removed, making the public version fully anonymous and safe to share.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex items-center gap-2 bg-slate-900 p-3 rounded-lg border border-white/10">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none select-all"
          />
          <Button type="button" size="sm" onClick={handleCopyLink} className="flex items-center">
            {isCopied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={() => setIsShareModalOpen(false)}>Done</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
