# SpendOptic — B2B AI Spend Audit Engine

SpendOptic is a premium, free self-serve tool that helps early-stage startup founders, VP of Engineering, and Tech Leads audit their team's AI tooling spend (Cursor, Claude, ChatGPT, GitHub Copilot, APIs, Windsurf, v0). It identifies seat-based redundancies, flags minimum-seat plan billing leaks, and suggests defensible optimized paths, acting as a high-conversion lead generation asset for **Credex.rocks** discounted infrastructure credit marketplace.

---

## Deployed URL
👉 **Live Demo**: [https://spendoptic-sahil.vercel.app/](https://spendoptic-sahil.vercel.app/)

---

## 🛠️ Quick Start & Local Setup

Get SpendOptic running on your local machine in under 2 minutes:

### 1. Clone the Codebase
```bash
git clone https://github.com/your-username/spendoptic.git
cd spendoptic
```

### 2. Install Node Dependencies
We use `npm` for strict version locking and compile targets:
```bash
npm install
```

### 3. Environment Variables Config
Create a `.env.local` file in the root directory and supply your API credentials:
```env
# Supabase Configuration (Optional: runs in Mock/Offline mode if left blank)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic Claude SDK (Optional: runs in fallback template mode if left blank)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Resend Transactional Email SDK (Optional: logs mock emails to console if left blank)
RESEND_API_KEY=your_resend_api_key
```

### 4. Run Development Workspace
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your browser.

### 5. Execute Automated Tests
Run our 6-suite Jest test runner:
```bash
npm test
```

---

## 📐 Key Trade-Off Decisions

During the 7-day development cycle of SpendOptic, I made 5 critical engineering and product trade-offs to optimize for B2B founder conversion and launch readiness:

### Decision 1: Value First over Authentication Gates
- **Trade-off**: Anonymous forms vs OAuth sign-ins.
- **Decision**: We completely removed OAuth gates. Visitors input their subscriptions anonymously and see results instantly. Lead capture is placed strictly *after* showing clear financial savings.
- **Rationale**: Founder discovery calls proved that tech leaders are highly suspicious of inputting financial credentials before seeing any value. Lowering friction to zero drives higher funnel conversions.

### Decision 2: Deterministic Calculation over LLM Computations
- **Trade-off**: Native TypeScript math rules vs Generative LLM logic.
- **Decision**: All calculations, seat-minimum triggers, and redundancy rules are hardcoded in a deterministic Next.js engine. AI is used *strictly* to draft the personalized executive brief paragraph.
- **Rationale**: LLMs are prone to floating-point errors and pricing hallucinations. Startups need 100% defensible, reliable CFO-grade calculations down to the penny.

### Decision 3: Resilient Offline/Mock Fallbacks over Strict API Hard-Gates
- **Trade-off**: Hard API crashes vs Graceful Offline Mock Modes.
- **Decision**: I built mock handlers for Supabase DB queries, Anthropic summary triggers, and Resend email dispatches. If API keys are missing, the app boots up and performs perfectly using rich local state mockups.
- **Rationale**: This prevents deployment compile crashes on Vercel, allowing hiring managers and developers to test the product locally without spending credit on active API integrations.

### Decision 4: Custom Radical UI primitives over Bloated Admin UI Templates
- **Trade-off**: Pre-built dashboard templates vs Custom Tailwind UI blocks.
- **Decision**: Built clean glassmorphic components (Card, Button, Dialog) from scratch using native Tailwind v4 and Lucide React.
- **Rationale**: Admin dashboards are bloated, slow down Lighthouse performance scores, and look generic. A curated glass-styled dashboard wow-factors the user at first glance.

### Decision 5: Async Form State Persistence
- **Trade-off**: Server-side sync vs client local storage tracking.
- **Decision**: Every form input is persisted to the client's `localStorage` on keychange, loaded safely post-mount using dynamic sentinel hooks to prevent SSR hydration warnings.
- **Rationale**: If a startup founder has to input 6 different tool seats and accidentally closes the browser tab, recovering their state instantly on reload prevents form fatigue.
