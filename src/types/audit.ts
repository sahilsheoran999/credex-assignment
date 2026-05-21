export type PrimaryUseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

export type ToolName =
  | 'cursor'
  | 'copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf'
  | 'v0';

export interface ToolConfig {
  id: ToolName;
  name: string;
  plans: { id: string; name: string; pricePerSeat: number; isApi: boolean }[];
}

export interface SpendInputItem {
  toolId: ToolName;
  planId: string;
  seats: number;
  monthlySpend: number; // For APIs, direct spend; for subscriptions, seats * plan_price or custom override
}

export interface AuditInput {
  teamSize: number;
  primaryUseCase: PrimaryUseCase;
  items: SpendInputItem[];
}

export interface AuditResultItem {
  toolId: ToolName;
  toolName: string;
  currentPlanId: string;
  currentPlanName: string;
  currentSeats: number;
  currentSpend: number;
  recommendedPlanId: string;
  recommendedPlanName: string;
  recommendedSeats: number;
  recommendedSpend: number;
  savings: number;
  action: 'keep' | 'downgrade' | 'consolidate' | 'switch_to_api' | 'apply_credits' | 'volume_discount';
  reasoning: string;
}

export interface AuditResult {
  items: AuditResultItem[];
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  primaryUseCase: PrimaryUseCase;
  teamSize: number;
}

export interface LeadInput {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: string;
}
