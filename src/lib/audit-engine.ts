import { AuditInput, AuditResult, AuditResultItem, SpendInputItem } from '@/types/audit';
import { PRICING_DATA } from './pricing';

export function runAudit(input: AuditInput): AuditResult {
  const resultItems: AuditResultItem[] = [];
  const activeTools = new Set(input.items.map((i) => i.toolId));

  // Helper to find tool pricing details safely
  const getToolPlan = (toolId: string, planId: string) => {
    const config = PRICING_DATA[toolId];
    if (!config) return null;
    return config.plans.find((p) => p.id === planId) || null;
  };

  for (const item of input.items) {
    const config = PRICING_DATA[item.toolId];
    if (!config) continue;

    const currentPlan = getToolPlan(item.toolId, item.planId);
    if (!currentPlan) continue;

    let recPlanId = item.planId;
    let recPlanName = currentPlan.name;
    let recSeats = item.seats;
    let recSpend = item.monthlySpend;
    let action: AuditResultItem['action'] = 'keep';
    let reasoning = 'Your spend is fully optimized for this tool based on your team size and use case.';
    let savings = 0;

    switch (item.toolId) {
      case 'cursor':
        // Case 1: Cursor Business for very small teams (<= 2 users) where collab is redunant
        if (item.planId === 'business' && item.seats <= 2) {
          recPlanId = 'pro';
          const plan = getToolPlan('cursor', 'pro');
          recPlanName = plan?.name || 'Pro';
          recSpend = (plan?.pricePerSeat || 20) * item.seats;
          savings = item.monthlySpend - recSpend;
          action = 'downgrade';
          reasoning = `Cursor Business collaboration features are overkill for ${item.seats} user(s). Downgrade to Cursor Pro ($20/mo) to save $20/seat/mo.`;
        }
        // Case 2: Large teams on Business can save with Credex credits
        else if (item.planId === 'business' && item.seats >= 10) {
          recPlanId = 'business';
          recSpend = item.monthlySpend * 0.7; // 30% discount via Credex
          savings = item.monthlySpend - recSpend;
          action = 'apply_credits';
          reasoning = `For teams with ${item.seats} seats, you qualify for 30% off Cursor Business through Credex infrastructure credits.`;
        }
        // Case 3: Double IDE usage (Cursor + Windsurf)
        else if (activeTools.has('windsurf')) {
          // Keep Cursor if primaryUseCase is coding, otherwise recommend consolidation
          if (input.primaryUseCase === 'coding') {
            // Suggest keeping Cursor, removing Windsurf (which will be processed in the windsurf block)
            action = 'keep';
            reasoning = 'Cursor is your primary development tool. Suggest consolidating and removing other IDEs like Windsurf.';
          } else {
            recPlanId = 'hobby';
            const plan = getToolPlan('cursor', 'hobby');
            recPlanName = plan?.name || 'Hobby';
            recSeats = 0;
            recSpend = 0;
            savings = item.monthlySpend;
            action = 'consolidate';
            reasoning = 'Startups only need one AI IDE. Since your primary use case is mixed/writing, consolidate onto your other IDE or standard chat UI.';
          }
        }
        break;

      case 'copilot':
        // Case 1: Copilot Business for 1 seat when Individual exists
        if (item.planId === 'business' && item.seats === 1) {
          recPlanId = 'individual';
          const plan = getToolPlan('copilot', 'individual');
          recPlanName = plan?.name || 'Individual';
          recSpend = (plan?.pricePerSeat || 10) * item.seats;
          savings = item.monthlySpend - recSpend;
          action = 'downgrade';
          reasoning = 'Copilot Business is designed for organizations. As a single user, use Copilot Individual to save $9/mo.';
        }
        // Case 2: Redundant with Cursor (If Cursor is active, Copilot is 100% redundant)
        else if (activeTools.has('cursor')) {
          recSpend = 0;
          recSeats = 0;
          savings = item.monthlySpend;
          action = 'consolidate';
          reasoning = 'Cursor has built-in auto-completions and chat. Paying for GitHub Copilot alongside Cursor is duplicate spend.';
        }
        // Case 3: Volume savings for larger teams
        else if (item.planId === 'business' && item.seats >= 15) {
          recSpend = item.monthlySpend * 0.75; // 25% off
          savings = item.monthlySpend - recSpend;
          action = 'apply_credits';
          reasoning = `Your team of ${item.seats} can reduce their GitHub Copilot costs by 25% by routing licenses through Credex.`;
        }
        break;

      case 'claude':
        // Case 1: Team plan for < 5 users has a minimum charge of 5 seats ($125/mo)
        if (item.planId === 'team' && item.seats < 5) {
          recPlanId = 'pro';
          const plan = getToolPlan('claude', 'pro');
          recPlanName = plan?.name || 'Pro';
          recSpend = (plan?.pricePerSeat || 20) * item.seats;
          // Current spend for team is min 5 seats * $25 = $125/mo minimum
          const currentActualSpend = Math.max(item.monthlySpend, 125);
          savings = currentActualSpend - recSpend;
          action = 'downgrade';
          reasoning = `Claude Team requires a minimum of 5 seats ($125/mo). With only ${item.seats} seat(s), downgrade to Claude Pro ($20/mo) to save $${savings.toFixed(0)}/mo.`;
        }
        // Case 2: Consolidated with ChatGPT
        else if (activeTools.has('chatgpt') && input.primaryUseCase !== 'mixed') {
          // Recommending Claude over ChatGPT due to XML formatting & Artifacts superiority
          action = 'keep';
          reasoning = 'Claude provides superior reasoning. Consolidate ChatGPT subscriptions here to save money and align your stack.';
        }
        break;

      case 'chatgpt':
        // Case 1: Duplicate with Claude
        if (activeTools.has('claude')) {
          recSpend = 0;
          recSeats = 0;
          savings = item.monthlySpend;
          action = 'consolidate';
          reasoning = 'Your team also uses Claude. Consolidate ChatGPT subscriptions onto Claude to avoid paying for dual general LLM seats.';
        }
        // Case 2: Team plan with 1 user is overkill
        else if (item.planId === 'team' && item.seats === 1) {
          recPlanId = 'plus';
          const plan = getToolPlan('chatgpt', 'plus');
          recPlanName = plan?.name || 'Plus';
          recSpend = (plan?.pricePerSeat || 20) * item.seats;
          savings = item.monthlySpend - recSpend;
          action = 'downgrade';
          reasoning = 'ChatGPT Team has a 2-seat minimum. Downgrade to ChatGPT Plus to avoid paying for an unused slot.';
        }
        break;

      case 'anthropic_api':
        // Case 1: Prompt Caching optimization recommendation for high API use
        if (item.monthlySpend >= 150) {
          recSpend = item.monthlySpend * 0.65; // ~35% savings from Prompt Caching + 20% Credex credit pool
          savings = item.monthlySpend - recSpend;
          action = 'apply_credits';
          reasoning = 'With spend > $150/mo, you can save 35% by implementing Anthropic prompt caching and routing tokens via Credex credits.';
        }
        break;

      case 'openai_api':
        // Case 1: OpenAI token optimizations + Credex credit routing
        if (item.monthlySpend >= 150) {
          recSpend = item.monthlySpend * 0.8; // 20% savings via Credex volume credits
          savings = item.monthlySpend - recSpend;
          action = 'apply_credits';
          reasoning = 'Route your OpenAI production traffic through Credex credit pools for a flat 20% infrastructure discount.';
        }
        break;

      case 'gemini':
        // Case 1: Gemini Pro duplicate with Claude/ChatGPT
        if (activeTools.has('claude') || activeTools.has('chatgpt')) {
          recSpend = 0;
          recSeats = 0;
          savings = item.monthlySpend;
          action = 'consolidate';
          reasoning = 'You are already paying for Claude or ChatGPT. Gemini seats are redundant for standard research and writing tasks.';
        }
        break;

      case 'windsurf':
        // Redundant with Cursor
        if (activeTools.has('cursor')) {
          recSpend = 0;
          recSeats = 0;
          savings = item.monthlySpend;
          action = 'consolidate';
          reasoning = 'Windsurf duplicates Cursor. Suggest standardizing your engineering team on Cursor to eliminate double IDE costs.';
        }
        break;

      case 'v0':
        // Redundant with Cursor composer or Claude Artifacts for small teams
        if ((activeTools.has('cursor') || activeTools.has('claude')) && item.seats <= 3) {
          recSpend = 0;
          recSeats = 0;
          savings = item.monthlySpend;
          action = 'consolidate';
          reasoning = 'Cursor Composer & Claude Artifacts cover UI generation needs. Eliminate standalone v0 seats for small teams.';
        }
        break;
    }

    if (savings < 0) savings = 0;

    resultItems.push({
      toolId: item.toolId,
      toolName: config.name,
      currentPlanId: item.planId,
      currentPlanName: currentPlan.name,
      currentSeats: item.seats,
      currentSpend: item.monthlySpend,
      recommendedPlanId: recPlanId,
      recommendedPlanName: recPlanName,
      recommendedSeats: recSeats,
      recommendedSpend: recSpend,
      savings: Math.round(savings * 100) / 100,
      action: savings > 0 ? action : 'keep',
      reasoning: savings > 0 ? reasoning : 'Your plan and usage are optimally aligned. No redundant spend found.',
    });
  }

  // Aggregate totals
  const totalCurrentSpend = resultItems.reduce((acc, item) => acc + item.currentSpend, 0);
  const totalRecommendedSpend = resultItems.reduce((acc, item) => acc + item.recommendedSpend, 0);
  const totalMonthlySavings = resultItems.reduce((acc, item) => acc + item.savings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    items: resultItems,
    totalCurrentSpend: Math.round(totalCurrentSpend * 100) / 100,
    totalRecommendedSpend: Math.round(totalRecommendedSpend * 100) / 100,
    totalMonthlySavings: Math.round(totalMonthlySavings * 100) / 100,
    totalAnnualSavings: Math.round(totalAnnualSavings * 100) / 100,
    primaryUseCase: input.primaryUseCase,
    teamSize: input.teamSize,
  };
}
