import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { AuditInput, AuditResult } from '@/types/audit';

export async function POST(req: Request) {
  try {
    const { rawInput, auditResult, email } = await req.json();

    // Generate unique URL safe share slug
    const shareSlug = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);

    if (isSupabaseConfigured) {
      let leadId = null;

      if (email) {
        const { data: lead } = await supabase
          .from('leads')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (lead) leadId = lead.id;
      }

      // Save Audit record
      const { data: audit, error: auditError } = await supabase
        .from('audits')
        .insert({
          lead_id: leadId,
          team_size: rawInput.teamSize,
          primary_use_case: rawInput.primaryUseCase,
          total_current_spend: auditResult.totalCurrentSpend,
          total_recommended_spend: auditResult.totalRecommendedSpend,
          total_monthly_savings: auditResult.totalMonthlySavings,
          total_annual_savings: auditResult.totalAnnualSavings,
          share_slug: shareSlug,
          is_public: true,
        })
        .select('id')
        .single();

      if (auditError) {
        console.error('Error inserting audit:', auditError);
        return NextResponse.json({ error: 'Database save failed' }, { status: 500 });
      }

      // Save individual items
      const itemsToInsert = auditResult.items.map((item: any) => ({
        audit_id: audit.id,
        tool_id: item.toolId,
        tool_name: item.toolName,
        current_plan_id: item.currentPlanId,
        current_plan_name: item.currentPlanName,
        current_seats: item.currentSeats,
        current_spend: item.currentSpend,
        recommended_plan_id: item.recommendedPlanId,
        recommended_plan_name: item.recommendedPlanName,
        recommended_seats: item.recommendedSeats,
        recommended_spend: item.recommendedSpend,
        savings: item.savings,
        action: item.action,
        reasoning: item.reasoning,
      }));

      const { error: itemsError } = await supabase
        .from('audit_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error inserting audit items:', itemsError);
        // Clean up the parent audit if child insert fails
        await supabase.from('audits').delete().eq('id', audit.id);
        return NextResponse.json({ error: 'Database items save failed' }, { status: 500 });
      }
    } else {
      console.log('✏️ Supabase offline. Simulated shared URL record generated.');
    }

    return NextResponse.json({ shareSlug, offlineMode: !isSupabaseConfigured });
  } catch (e) {
    console.error('Error in share API:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
