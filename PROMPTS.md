# Prompts Engineering & Analysis (PROMPTS.md)

This document contains the prompt designs and technical decisions behind **SpendOptic's** AI executive summary engine, powered by the Anthropic Claude API.

---

## 1. Production Prompt Design

Our system utilizes `claude-3-5-sonnet-latest` to analyze mathematical audit findings and draft a highly-polished, professional startup executive brief.

### System Prompt
```text
You are a professional CFO advising a startup on software stack optimization.
```

### User Prompt
```text
You are a world-class startup CFO and AI infrastructure analyst. Generate a highly professional, ~100-word executive summary paragraph for a startup's AI spend audit.

Audit Details:
- Active Monthly Spend: ${totalCurrentSpend}
- Recommended Optimized Monthly Spend: ${totalRecommendedSpend}
- Total Monthly Savings: ${totalMonthlySavings}
- Total Annual Savings: ${totalAnnualSavings}
- Primary Use Case: ${primaryUseCase}
- Team Size: ${teamSize}

Tool Breakdown details:
${toolBreakdownList}

Instructions:
1. Be concise, direct, and speak like an elite venture financial analyst advising a startup founder.
2. Write a single continuous paragraph of roughly 100 words. Do not use list items.
3. Highlight the biggest savings opportunities and why they occur.
4. Conclude with a strong note about how Credex AI credits helps capture these high-tier savings.
5. Do not output markdown, code blocks, bullet points, or intro greetings. Start directly with the summary text.
```

---

## 2. Technical Rationales

1. **Deterministic Math, Fluid Summary**:
   We deliberately keep all arithmetic operations out of the LLM context. The Next.js backend calculates the exact current spend, target optimized cost, and savings down to the penny before sending the aggregated JSON payload to Anthropic. LLMs are notoriously prone to floating-point errors; by offloading arithmetic to TypeScript, the AI only has to focus on high-fidelity linguistic summarizing, maximizing reliability.
   
2. **Contextual Calibration**:
   Including the `primaryUseCase` and `teamSize` ensures Claude doesn't spit out generic financial recommendations. If a startup has primary use case `coding`, Claude automatically calibrates the text to highlight Cursor, Copilot, and engineering tools. If `writing` or `research`, it details Claude/ChatGPT seat adjustments.

3. **Viral Hooks**:
   The prompt specifically instructs Claude to close with a strong hook illustrating how routing high API traffic and subscription pools through **Credex credits** unlocks immediate savings. This turns the summary into a natural lead-generation pipeline for the parent brand.

---

## 3. Iterative Prompt Engineering (What Didn't Work)

### Attempt 1: Letting the LLM calculate savings
- **What we tried**: We supplied raw tools lists, prices, and asked Claude to "calculate savings and recommend options."
- **Why it failed**: Claude would regularly hallucinate Cursor/Claude seat minimum rules, make basic multiplication errors for seat-based totals, and mismatch monthly savings against annual calculations (e.g. `$170/mo` savings somehow became `$2,400/yr` instead of `$2,040`).
- **Pivot**: We stripped all mathematical computation from the prompt. The Next.js audit engine now computes everything deterministically, supplying raw totals directly to the AI for narrative synthesis only.

### Attempt 2: Allowing Bullet Points and Markdown Headers
- **What we tried**: Giving Claude formatting freedom to outline its findings using Markdown subheadings and bullets.
- **Why it failed**: It cluttered our UI. The card container became too long and disrupted the visual dashboard layout. On mobile screens, bullets wrapped awkwardly.
- **Pivot**: Enforced a strict "single continuous paragraph of roughly 100 words" instruction, ensuring a tight, premium visual reading box on every viewport.
