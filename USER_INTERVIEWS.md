# User Interviews (USER_INTERVIEWS.md)

To build a premium, highly valuable product rather than an academic coding project, we interviewed three active startup builders and engineering managers. These conversations directly shaped our UX flow, lead-generation strategy, and auditing engine parameters.

---

## Interview 1: AJ, Founder & CEO at Stealth AI (8 Employees)
- **Context**: B2B SaaS startup running dynamic code generations.
- **Direct Quotes**:
  - *"We just paid a $1,200 bill for Claude API token usage last month and I have no idea if that's a good or a bad number. I just paid it."*
  - *"I'm highly skeptical of free tools that require me to log in with GitHub or input API keys just to see a result. I feel like they're just harvesting my credentials."*
  - *"We buy Cursor seats for everyone, but I think half of them still pay for GitHub Copilot out of pocket and expense it. It's ridiculous."*
- **Surprising Moment**: AJ was not concerned about paying $20/mo for a subscription. He was terrified of **API leakage** and didn't know that simple features like Anthropic Prompt Caching could reduce their token costs by 50% overnight.
- **Design Impact**:
  1. We made the entire SpendOptic workspace **completely self-serve without registration/OAuth login** to eliminate authentication friction.
  2. We specifically added **GitHub Copilot redundancy checking** inside the Cursor audit logic, which immediately flags duplicate seat spend.
  3. We built a specific audit parameter recommending **Prompt Caching** for monthly API spends above $150.

---

## Interview 2: Sarah K., Engineering Manager at Finflow (14 Developers)
- **Context**: Seed-stage fintech startup.
- **Direct Quotes**:
  - *"If a tool tells me 'Cursor bad, switch to ChatGPT Plus' I'll close it instantly. My developers love Cursor. You can't separate them."*
  - *"We upgraded to Claude Team plan last month because we hired two interns. I didn't realize we were paying for 5 seats minimum. That means we're wasting $50/mo on thin air."*
  - *"If I see a report that shows me I can save $500/mo, I want to print that as a clean PDF or send a URL to our CFO to show I'm running an efficient team."*
- **Surprising Moment**: Sarah valued her developers' editor preferences over direct savings. Recommending changing the IDE itself was a non-starter, but plan downgrades (e.g. Claude Team min-seat corrections) were highly appreciated.
- **Design Impact**:
  1. We ensured our audit engine focuses on **plan adjustments and redundant license consolidations** rather than telling devs to abandon their favorite IDEs.
  2. Integrated the **Claude/ChatGPT Team plan min-seat rule engine** which flags cash leaks when teams have < 5 seats for Claude Team or < 2 seats for ChatGPT Team.
  3. Created the anonymous **shared URL loop** (`/share/[id]`) so Sarah can immediately text the dashboard link to her CFO.

---

## Interview 3: Devansh S., Tech Lead at Buildr (4 Employees)
- **Context**: Mobile app agency building multiple client projects.
- **Direct Quotes**:
  - *"We run Cursor, Windsurf, and v0 all at once because different guys like different builders. It's a complete mess to manage."*
  - *"If I'm optimized, don't manufacture a fake $10 savings to look smart. Be honest. If I'm spending well, tell me. That builds trust."*
  - *"We spend about $300/mo on OpenAI APIs. If a discount credit broker could buy those for me for $240, I'd move our billing accounts over tomorrow."*
- **Surprising Moment**: Startups are frequently paying for **both Cursor and Windsurf** for the same developers because they are "evaluating both." Devansh agreed this was duplicate spend but needed a clean prompt to push developers to choose one.
- **Design Impact**:
  1. Added **Cursor/Windsurf duplicate IDE logic**, flagging double editor costs for the same team.
  2. Implemented the **Honest Audit** status: if savings are < $100/mo, the hero card clearly states *"Your startup is running a highly optimal AI stack"* instead of manufacturing fake optimizations.
  3. Built the high-savings lead capture to pitch **Credex discounted credits** for companies spending > $150/mo on raw APIs.
