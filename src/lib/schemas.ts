import { z } from 'zod';

export const SpendInputItemSchema = z.object({
  toolId: z.enum([
    'cursor',
    'copilot',
    'claude',
    'chatgpt',
    'anthropic_api',
    'openai_api',
    'gemini',
    'windsurf',
    'v0',
  ]),
  planId: z.string().min(1, 'Please select a plan'),
  seats: z.number().int().min(0, 'Seats must be 0 or greater'),
  monthlySpend: z.number().min(0, 'Spend must be 0 or greater'),
});

export const AuditInputSchema = z.object({
  teamSize: z.number().int().min(1, 'Team size must be at least 1'),
  primaryUseCase: z.enum(['coding', 'writing', 'data', 'research', 'mixed']),
  items: z.array(SpendInputItemSchema).min(1, 'Please add at least one AI tool to audit'),
});

export const LeadCaptureSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  companyName: z.string().optional(),
  role: z.string().optional(),
  teamSize: z.string().optional(),
  honeypot: z.string().optional(), // Honeypot spam protection field
});

export type AuditInputType = z.infer<typeof AuditInputSchema>;
export type LeadCaptureType = z.infer<typeof LeadCaptureSchema>;
