# Automated Tests Inventory (TESTS.md)

This document contains a comprehensive breakdown of the automated test suite written to validate **SpendOptic's** financial recommendation engine.

---

## 1. Test Suite Summary

Our test suite is written in TypeScript using the **Jest** framework with **ts-jest** compilers. It contains **6 robust unit tests** validating edge cases, minimum seat caps, duplicate subscription consolidations, API caching math, and optimal stack configurations.

- **Test Runner**: Jest (`jest`)
- **Test File**: `__tests__/audit.test.ts`
- **TypeScript Presets**: `ts-jest`
- **Test Targets**: `src/lib/audit-engine.ts`

---

## 2. Test Cases Breakdown

### Test 1: Small Team Cursor Business Downgrade
- **Filename**: `__tests__/audit.test.ts`
- **Objective**: Verify that if a startup is on Cursor Business ($40/seat) with only 2 seats, the engine recommends downgrading to Cursor Pro ($20/seat).
- **Assertion**: Expect `recommendedPlanId` to equal `'pro'`, `action` to equal `'downgrade'`, and monthly savings to equal exactly `$40` (since `($40 - $20) * 2 = $40`).

### Test 2: Claude Team Plan Seat Correction
- **Filename**: `__tests__/audit.test.ts`
- **Objective**: Verify that if a small team has 2 Claude Team seats, they are charged the minimum of 5 seats ($125/mo), and that the engine suggests downgrading to Claude Pro ($20/seat), recalculating the actual savings.
- **Assertion**: Expect current actual cost to equal `$125`, recommended cost to equal `$40`, and savings to equal exactly `$85/mo` (`$125 - $40`).

### Test 3: Redundant Editor Consolidation (Cursor + GitHub Copilot)
- **Filename**: `__tests__/audit.test.ts`
- **Objective**: Verify that if a team pays for both Cursor Pro and GitHub Copilot Business, the engine flags Copilot as 100% redundant spend and consolidates it.
- **Assertion**: Expect Copilot `recommendedSeats` to equal `0`, `action` to equal `'consolidate'`, and monthly savings to equal the full Copilot cost.

### Test 4: ChatGPT Team Minimum Seat Constraint
- **Filename**: `__tests__/audit.test.ts`
- **Objective**: Verify that a ChatGPT Team subscription with only 1 user (which has a 2-seat minimum charge = $50/mo) is downgraded to ChatGPT Plus ($20/mo).
- **Assertion**: Expect `recommendedPlanId` to equal `'plus'`, `action` to equal `'downgrade'`, and savings to equal `$30/mo` (`$50 - $20`).

### Test 5: Optimal Stack Integrity (Honest Auditing)
- **Filename**: `__tests__/audit.test.ts`
- **Objective**: Ensure that for a perfectly optimized startup, the engine is honest, returns exactly `$0` in total savings, and flags all actions as `'keep'`, proving we manufacture no fake savings.
- **Assertion**: Expect `totalMonthlySavings` to equal `0` and all `action` states to equal `'keep'`.

### Test 6: API Token Optimization
- **Filename**: `__tests__/audit.test.ts`
- **Objective**: Validate that high Anthropic API spend (>= $150/mo) triggers prompt caching and Credex credits.
- **Assertion**: Expect `action` to equal `'apply_credits'` and savings to equal 35% of the total monthly spend.

---

## 3. How to Run the Tests

Ensure you have installed node dependencies first:

```bash
# Install packages
npm install

# Execute Jest tests
npm test
```

### Expected Output
```text
PASS __tests__/audit.test.ts
  SpendOptic Audit Engine - Strategic Financial Verification
    √ Cursor Business with <= 2 seats is downgraded to Cursor Pro (3 ms)
    √ Claude Team plan with < 5 seats is downgraded to Claude Pro (1 ms)
    √ GitHub Copilot is consolidated and eliminated if Cursor is active
    √ ChatGPT Team with 1 seat is downgraded to ChatGPT Plus (1 ms)
    √ Honest audit results in $0 savings for already optimized setups
    √ Anthropic API spend >= $150 triggers prompt caching savings

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.416 s
Ran all test suites.
```
