import { ToolConfig } from '@/types/audit';

export const PRICING_DATA: Record<string, ToolConfig> = {
  cursor: {
    id: 'cursor',
    name: 'Cursor',
    plans: [
      { id: 'hobby', name: 'Hobby', pricePerSeat: 0, isApi: false },
      { id: 'pro', name: 'Pro', pricePerSeat: 20, isApi: false },
      { id: 'business', name: 'Business', pricePerSeat: 40, isApi: false },
      { id: 'enterprise', name: 'Enterprise', pricePerSeat: 75, isApi: false },
    ],
  },
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    plans: [
      { id: 'individual', name: 'Individual', pricePerSeat: 10, isApi: false },
      { id: 'business', name: 'Business', pricePerSeat: 19, isApi: false },
      { id: 'enterprise', name: 'Enterprise', pricePerSeat: 39, isApi: false },
    ],
  },
  claude: {
    id: 'claude',
    name: 'Claude',
    plans: [
      { id: 'free', name: 'Free', pricePerSeat: 0, isApi: false },
      { id: 'pro', name: 'Pro', pricePerSeat: 20, isApi: false },
      { id: 'max', name: 'Max', pricePerSeat: 40, isApi: false },
      { id: 'team', name: 'Team (min 5 seats)', pricePerSeat: 25, isApi: false },
      { id: 'enterprise', name: 'Enterprise', pricePerSeat: 75, isApi: false },
      { id: 'api_direct', name: 'API Direct', pricePerSeat: 0, isApi: true },
    ],
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    plans: [
      { id: 'plus', name: 'Plus', pricePerSeat: 20, isApi: false },
      { id: 'team', name: 'Team (min 2 seats)', pricePerSeat: 25, isApi: false },
      { id: 'enterprise', name: 'Enterprise', pricePerSeat: 60, isApi: false },
      { id: 'api_direct', name: 'API Direct', pricePerSeat: 0, isApi: true },
    ],
  },
  anthropic_api: {
    id: 'anthropic_api',
    name: 'Anthropic API Direct',
    plans: [
      { id: 'api', name: 'Pay-As-You-Go', pricePerSeat: 0, isApi: true },
    ],
  },
  openai_api: {
    id: 'openai_api',
    name: 'OpenAI API Direct',
    plans: [
      { id: 'api', name: 'Pay-As-You-Go', pricePerSeat: 0, isApi: true },
    ],
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    plans: [
      { id: 'pro', name: 'Advanced / Business Pro', pricePerSeat: 20, isApi: false },
      { id: 'ultra', name: 'Enterprise Ultra', pricePerSeat: 30, isApi: false },
      { id: 'api', name: 'Developer API', pricePerSeat: 0, isApi: true },
    ],
  },
  windsurf: {
    id: 'windsurf',
    name: 'Windsurf',
    plans: [
      { id: 'free', name: 'Free', pricePerSeat: 0, isApi: false },
      { id: 'pro', name: 'Pro', pricePerSeat: 15, isApi: false },
      { id: 'team', name: 'Team', pricePerSeat: 30, isApi: false },
    ],
  },
  v0: {
    id: 'v0',
    name: 'v0 by Vercel',
    plans: [
      { id: 'free', name: 'Free', pricePerSeat: 0, isApi: false },
      { id: 'pro', name: 'Pro', pricePerSeat: 20, isApi: false },
      { id: 'enterprise', name: 'Enterprise', pricePerSeat: 50, isApi: false },
    ],
  },
};
