import { runAudit } from '../src/lib/audit-engine';
import { AuditInput } from '../src/types/audit';

describe('SpendOptic Audit Engine - Strategic Financial Verification', () => {
  // Test 1: Downgrade Cursor Business for very small teams
  test('Cursor Business with <= 2 seats is downgraded to Cursor Pro', () => {
    const input: AuditInput = {
      teamSize: 2,
      primaryUseCase: 'coding',
      items: [
        {
          toolId: 'cursor',
          planId: 'business',
          seats: 2,
          monthlySpend: 80, // 2 * $40/seat
        },
      ],
    };

    const result = runAudit(input);
    const cursorResult = result.items.find((item) => item.toolId === 'cursor');

    expect(cursorResult).toBeDefined();
    expect(cursorResult?.recommendedPlanId).toBe('pro');
    expect(cursorResult?.action).toBe('downgrade');
    expect(cursorResult?.savings).toBe(40); // (40 - 20) * 2
    expect(result.totalMonthlySavings).toBe(40);
  });

  // Test 2: Claude Team plan requires a minimum of 5 seats ($125/mo)
  test('Claude Team plan with < 5 seats is downgraded to Claude Pro', () => {
    const input: AuditInput = {
      teamSize: 2,
      primaryUseCase: 'mixed',
      items: [
        {
          toolId: 'claude',
          planId: 'team',
          seats: 2,
          monthlySpend: 125, // Billed at minimum 5 seats * $25 = $125
        },
      ],
    };

    const result = runAudit(input);
    const claudeResult = result.items.find((item) => item.toolId === 'claude');

    expect(claudeResult).toBeDefined();
    expect(claudeResult?.recommendedPlanId).toBe('pro');
    expect(claudeResult?.action).toBe('downgrade');
    expect(claudeResult?.savings).toBe(85); // $125 min - $40 (2 Pro seats * $20)
    expect(result.totalMonthlySavings).toBe(85);
  });

  // Test 3: Redundant spending (Cursor + GitHub Copilot)
  test('GitHub Copilot is consolidated and eliminated if Cursor is active', () => {
    const input: AuditInput = {
      teamSize: 5,
      primaryUseCase: 'coding',
      items: [
        {
          toolId: 'cursor',
          planId: 'pro',
          seats: 5,
          monthlySpend: 100,
        },
        {
          toolId: 'copilot',
          planId: 'business',
          seats: 5,
          monthlySpend: 95, // 5 * $19/seat
        },
      ],
    };

    const result = runAudit(input);
    const copilotResult = result.items.find((item) => item.toolId === 'copilot');

    expect(copilotResult).toBeDefined();
    expect(copilotResult?.recommendedSeats).toBe(0);
    expect(copilotResult?.action).toBe('consolidate');
    expect(copilotResult?.savings).toBe(95); // 100% redundant spend eliminated
  });

  // Test 4: ChatGPT Team minimum seat constraint
  test('ChatGPT Team with 1 seat is downgraded to ChatGPT Plus', () => {
    const input: AuditInput = {
      teamSize: 1,
      primaryUseCase: 'writing',
      items: [
        {
          toolId: 'chatgpt',
          planId: 'team',
          seats: 1,
          monthlySpend: 50, // Minimum 2 seats billed * $25 = $50
        },
      ],
    };

    const result = runAudit(input);
    const chatGptResult = result.items.find((item) => item.toolId === 'chatgpt');

    expect(chatGptResult).toBeDefined();
    expect(chatGptResult?.recommendedPlanId).toBe('plus');
    expect(chatGptResult?.action).toBe('downgrade');
    expect(chatGptResult?.savings).toBe(30); // $50 min - $20 Plus plan
  });

  // Test 5: Be honest and manufacture no savings for a fully optimized stack
  test('Honest audit results in $0 savings for already optimized setups', () => {
    const input: AuditInput = {
      teamSize: 3,
      primaryUseCase: 'coding',
      items: [
        {
          toolId: 'cursor',
          planId: 'pro',
          seats: 3,
          monthlySpend: 60,
        },
        {
          toolId: 'claude',
          planId: 'pro',
          seats: 3,
          monthlySpend: 60,
        },
      ],
    };

    const result = runAudit(input);

    expect(result.totalMonthlySavings).toBe(0);
    expect(result.items.every((i) => i.action === 'keep')).toBe(true);
  });

  // Test 6: API direct prompt caching recommendations
  test('Anthropic API spend >= $150 triggers prompt caching savings', () => {
    const input: AuditInput = {
      teamSize: 4,
      primaryUseCase: 'coding',
      items: [
        {
          toolId: 'anthropic_api',
          planId: 'api',
          seats: 0,
          monthlySpend: 200,
        },
      ],
    };

    const result = runAudit(input);
    const apiResult = result.items.find((item) => item.toolId === 'anthropic_api');

    expect(apiResult).toBeDefined();
    expect(apiResult?.action).toBe('apply_credits');
    expect(apiResult?.savings).toBe(70); // 35% of $200
  });
});
