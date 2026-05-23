import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AuditResult } from '@/types/audit';

export async function POST(req: Request) {
  try {
    const result: AuditResult = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY || '';

    // Standard fallback response
    const fallbackText = `Your active AI stack spend is $${result.totalCurrentSpend.toLocaleString()}/mo. By executing our recommended plan optimizations, your team can reduce this to $${result.totalRecommendedSpend.toLocaleString()}/mo. This translates to an immediate savings of $${result.totalMonthlySavings.toLocaleString()}/mo ($${result.totalAnnualSavings.toLocaleString()}/yr). Key levers include plan seat downgrades on tools like Cursor/Claude and consolidating duplicate seats. High production API traffic should be routed through Credex volume pools to capture an additional 20-30% flat discount immediately.`;

    if (!apiKey) {
      return NextResponse.json({ summary: fallbackText });
    }

    const anthropic = new Anthropic({ apiKey });

    const prompt = `You are a world-class startup CFO and AI infrastructure analyst. Generate a highly professional, ~100-word executive summary paragraph for a startup's AI spend audit.

Audit Details:
- Active Monthly Spend: $${result.totalCurrentSpend}
- Recommended Optimized Monthly Spend: $${result.totalRecommendedSpend}
- Total Monthly Savings: $${result.totalMonthlySavings}
- Total Annual Savings: $${result.totalAnnualSavings}
- Primary Use Case: ${result.primaryUseCase}
- Team Size: ${result.teamSize}

Tool Breakdown details:
${result.items
  .map(
    (item) =>
      `- ${item.toolName}: current plan '${item.currentPlanName}' (${item.currentSeats} seats) cost $${item.currentSpend}/mo. Recommendation: '${item.action}' to '${item.recommendedPlanName}', saving $${item.savings}/mo. Reason: ${item.reasoning}`
  )
  .join('\n')}

Instructions:
1. Be concise, direct, and speak like an elite venture financial analyst advising a startup founder.
2. Write a single continuous paragraph of roughly 100 words. Do not use list items.
3. Highlight the biggest savings opportunities and why they occur.
4. Conclude with a strong note about how Credex AI credits helps capture these high-tier savings.
5. Do not output markdown, code blocks, bullet points, or intro greetings. Start directly with the summary text.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-latest',
      max_tokens: 250,
      system: 'You are a professional CFO advising a startup on software stack optimization.',
      messages: [{ role: 'user', content: prompt }],
    });

    const summaryText = response.content[0].type === 'text' ? response.content[0].text : '';

    return NextResponse.json({ summary: summaryText ? summaryText.trim() : fallbackText });
  } catch (e) {
    console.error('Error generating AI summary:', e);
    // Graceful fallback
    const result: AuditResult = await req.json().catch(() => ({
      totalCurrentSpend: 0,
      totalRecommendedSpend: 0,
      totalMonthlySavings: 0,
      totalAnnualSavings: 0,
    }));
    return NextResponse.json({
      summary: `Your active AI stack spend is $${result.totalCurrentSpend.toLocaleString()}/mo. By executing our recommended plan optimizations, your team can reduce this to $${result.totalRecommendedSpend.toLocaleString()}/mo. This translates to an immediate savings of $${result.totalMonthlySavings.toLocaleString()}/mo ($${result.totalAnnualSavings.toLocaleString()}/yr). Key levers include plan seat downgrades on tools like Cursor/Claude and consolidating duplicate seats. High production API traffic should be routed through Credex volume pools to capture an additional 20-30% flat discount immediately.`,
    });
  }
}
