import { Metadata } from 'next';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AuditResult, AuditResultItem } from '@/types/audit';
import { PRICING_DATA } from '@/lib/pricing';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingDown, ShieldCheck, CheckCircle, AlertTriangle, ArrowRight, HelpCircle, Landmark } from 'lucide-react';
import Link from 'next/link';

interface SharePageProps {
  params: Promise<{ id: string }>;
}

// Generate highly optimized viral Open Graph Previews
export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  let savingsText = '$2,400/yr';
  let toolsCount = 3;

  if (isSupabaseConfigured) {
    try {
      const { data: audit } = await supabase
        .from('audits')
        .select('total_annual_savings')
        .eq('share_slug', id)
        .maybeSingle();

      if (audit) {
        savingsText = `$${Math.round(audit.total_annual_savings).toLocaleString()}/yr`;
      }

      const { count } = await supabase
        .from('audit_items')
        .select('*', { count: 'exact', head: true })
        .eq('audit_id', id);

      if (count !== null) {
        toolsCount = count;
      }
    } catch (e) {
      console.error('Error fetching metadata:', e);
    }
  }

  const title = `We found ${savingsText} in wasted AI spend!`;
  const description = `SpendOptic scanned our AI stack (${toolsCount} developer tools) and flagged immediate plan optimizations. Run a free instant spend audit on your stack now.`;

  return {
    title: `${title} | SpendOptic by Credex`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://spendoptic.rocks/share/${id}`,
      siteName: 'SpendOptic AI',
      images: [
        {
          url: 'https://spendoptic.rocks/og-image.jpg', // Placeholder for OG card
          width: 1200,
          height: 630,
          alt: 'SpendOptic AI Spend Audit Card',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://spendoptic.rocks/og-image.jpg'],
    },
  };
}

// Resilient server side data fetch
async function getAuditData(slug: string): Promise<AuditResult | null> {
  if (!isSupabaseConfigured) {
    // Generate beautiful offline fallback mock report
    return {
      totalCurrentSpend: 480,
      totalRecommendedSpend: 310,
      totalMonthlySavings: 170,
      totalAnnualSavings: 2040,
      primaryUseCase: 'coding',
      teamSize: 5,
      items: [
        {
          toolId: 'cursor',
          toolName: 'Cursor',
          currentPlanId: 'business',
          currentPlanName: 'Business',
          currentSeats: 2,
          currentSpend: 80,
          recommendedPlanId: 'pro',
          recommendedPlanName: 'Pro',
          recommendedSeats: 2,
          recommendedSpend: 40,
          savings: 40,
          action: 'downgrade',
          reasoning: 'Cursor Business collaboration features are redundant for 2 users. Downgrading to Pro saves $20/seat/mo.',
        },
        {
          toolId: 'copilot',
          toolName: 'GitHub Copilot',
          currentPlanId: 'business',
          currentPlanName: 'Business',
          currentSeats: 5,
          currentSpend: 95,
          recommendedPlanId: 'individual',
          recommendedPlanName: 'None',
          recommendedSeats: 0,
          recommendedSpend: 0,
          savings: 95,
          action: 'consolidate',
          reasoning: 'Redundant developer spending detected alongside active Cursor editor licenses. Consolidate completely.',
        },
        {
          toolId: 'claude',
          toolName: 'Claude',
          currentPlanId: 'team',
          currentPlanName: 'Team (min 5 seats)',
          currentSeats: 3,
          currentSpend: 125,
          recommendedPlanId: 'pro',
          recommendedPlanName: 'Pro',
          recommendedSeats: 3,
          recommendedSpend: 60,
          savings: 65,
          action: 'downgrade',
          reasoning: 'Claude Team charges a minimum of 5 seats ($125/mo). Downgrading 3 seats to Pro ($60/mo) saves $65/mo.',
        },
      ],
    };
  }

  try {
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*')
      .eq('share_slug', slug)
      .maybeSingle();

    if (auditError || !audit) {
      console.error('Audit load failed:', auditError);
      return null;
    }

    const { data: items, error: itemsError } = await supabase
      .from('audit_items')
      .select('*')
      .eq('audit_id', audit.id);

    if (itemsError || !items) {
      console.error('Audit items load failed:', itemsError);
      return null;
    }

    return {
      totalCurrentSpend: Number(audit.total_current_spend),
      totalRecommendedSpend: Number(audit.total_recommended_spend),
      totalMonthlySavings: Number(audit.total_monthly_savings),
      totalAnnualSavings: Number(audit.total_annual_savings),
      primaryUseCase: audit.primary_use_case,
      teamSize: audit.team_size,
      items: items.map((item) => ({
        toolId: item.tool_id,
        toolName: item.tool_name,
        currentPlanId: item.current_plan_id,
        currentPlanName: item.current_plan_name,
        currentSeats: item.current_seats,
        currentSpend: Number(item.current_spend),
        recommendedPlanId: item.recommended_plan_id,
        recommendedPlanName: item.recommended_plan_name,
        recommendedSeats: item.recommended_seats,
        recommendedSpend: Number(item.recommended_spend),
        savings: Number(item.savings),
        action: item.action,
        reasoning: item.reasoning,
      })),
    };
  } catch (e) {
    console.error('Resilient retrieval failed:', e);
    return null;
  }
}

export default async function SharedReportPage({ params }: SharePageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const data = await getAuditData(id);

  if (!data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 px-4 py-24 text-center">
        <HelpCircle className="h-16 w-16 text-rose-500 mb-4 animate-bounce" />
        <h1 className="text-3xl font-black text-white">Audit Report Expired</h1>
        <p className="text-slate-400 mt-2 max-w-md">
          The requested spend report could not be found or has been deleted by the owner due to privacy configurations.
        </p>
        <Link href="/" className="mt-8">
          <Button variant="premium">Create Your Free Audit</Button>
        </Link>
      </div>
    );
  }

  const isHighSavings = data.totalMonthlySavings >= 500;
  const isOptimal = data.totalMonthlySavings < 100;

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* Background Visual Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-purple-500/5 blur-[140px] pointer-events-none rounded-full" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 space-y-10">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-md group-hover:scale-105 transition-all">
              <Landmark className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight text-white">
              Spend<span className="text-indigo-400">Optic</span>
            </span>
          </Link>
          <span className="text-xs text-slate-500 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/5">
            Public Audit: #{id.slice(0, 8)}
          </span>
        </div>

        {/* Audit Meta Intro Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI Stack Audit Findings
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Here is the anonymous public spend report summarizing plan optimizations, cost savings, and dual subscription cleanups.
          </p>
        </div>

        {/* Aggregated Totals Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border border-emerald-500/20 bg-emerald-950/10 backdrop-blur-lg">
            <CardHeader>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest flex items-center">
                <TrendingDown className="h-4 w-4 mr-1.5" /> Total Scanned Savings
              </span>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <span className="text-sm text-slate-400">Monthly Recouped</span>
                  <h1 className="text-4xl sm:text-5xl font-black text-emerald-400">
                    ${data.totalMonthlySavings.toLocaleString()}
                  </h1>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-slate-400">Annual Recouped</span>
                  <h1 className="text-4xl sm:text-5xl font-black text-emerald-300">
                    ${data.totalAnnualSavings.toLocaleString()}
                  </h1>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-lg flex flex-col justify-between">
            <CardHeader className="pb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Software Spend</span>
              <h2 className="text-3xl font-bold text-white mt-1">
                ${data.totalCurrentSpend.toLocaleString()}
                <span className="text-sm text-slate-400 font-normal">/mo</span>
              </h2>
            </CardHeader>
            <CardContent className="py-2">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-white/5">
                <span className="text-slate-400">Optimized Target</span>
                <span className="font-semibold text-indigo-400">${data.totalRecommendedSpend.toLocaleString()}/mo</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-slate-400">Efficiency Boost</span>
                <span className="font-semibold text-emerald-400">
                  {data.totalCurrentSpend > 0
                    ? `${Math.round((data.totalMonthlySavings / data.totalCurrentSpend) * 100)}%`
                    : '100%'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white">Itemized Recommendation Analysis</h2>
          <div className="space-y-4">
            {data.items.map((item) => (
              <div
                key={item.toolId}
                className={`border p-5 rounded-xl transition-all ${
                  item.savings > 0
                    ? 'border-emerald-500/20 bg-emerald-950/5'
                    : 'border-white/5 bg-slate-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{item.toolName}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Current Plan Setup: {item.currentPlanName} ({item.currentSeats} seats)
                    </p>
                  </div>
                  {item.savings > 0 ? (
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                      Save ${item.savings.toFixed(0)}/mo
                    </span>
                  ) : (
                    <span className="bg-white/5 text-slate-400 text-xs font-medium px-3 py-1 rounded-full border border-white/5">
                      Fully Optimized
                    </span>
                  )}
                </div>

                {item.savings > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-300">
                    <div className="flex items-center text-slate-400 mb-2">
                      <span className="font-semibold text-indigo-400 mr-2">Actionable Strategy:</span>
                      {item.recommendedPlanName} {item.recommendedSeats > 0 ? `(${item.recommendedSeats} seats)` : ''}
                      <ArrowRight className="h-3.5 w-3.5 mx-2 text-slate-500" />
                      <span className="font-bold text-emerald-400">${item.recommendedSpend.toFixed(0)}/mo</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">{item.reasoning}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Global CTA Gating to homepage */}
        <Card className="border border-indigo-500/20 bg-slate-900/50 backdrop-blur-md relative overflow-hidden p-8 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Bleeding Cash on AI Tooling?</h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto">
              Startups overspend by an average of 30% on code editors, Claude models, and open API keys without knowing. Uncover your hidden savings in under 60 seconds.
            </p>
          </div>
          <div>
            <Link href="/">
              <Button variant="premium" size="lg" className="shadow-lg shadow-indigo-500/20">
                Audit Your AI Stack (Free) <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
