# Analytics & Performance Metrics (METRICS.md)

This document outlines the instrumentation plan, key performance indicators (KPIs), and pivot boundaries established to evaluate **SpendOptic's** traction as a B2B customer acquisition funnel.

---

## 1. The North Star Metric

Our single North Star metric is **Cumulative Monthly Savings Flagged (CMSF)**.

### Why this is the North Star
SpendOptic is a value-first lead generation engine. The more wasted money we flag for startup founders, the more value we have demonstrated. Higher flagged savings directly correlate with high-quality B2B leads who have a high-urgency intent to schedule a **Credex credit consult** to capture that money.
Tracking DAU (Daily Active Users) is a vanity metric for an audit tool that founders only run once a quarter. But CMSF measures direct value generated.

---

## 2. The Three Input Metrics

To drive our North Star metric (CMSF), we monitor and optimize 3 critical input metrics:

### Input Metric 1: Unique Audit Submissions (Form Completion Rate)
- **Definition**: The percentage of landing page visitors who fill out their AI subscriptions and click "Analyze AI Spend."
- **Why it matters**: If visitors land but don't complete the form, our value funnel is empty. We target a **30% conversion rate**.
- **Optimization Vector**: Reduce form fields, add tool-preset shortcuts, and emphasize the *"No OAuth / No Credit Card"* privacy guarantee.

### Input Metric 2: High-Savings Threshold Conversions (>$500/mo)
- **Definition**: The percentage of audits that identify greater than or equal to $500/mo ($6,000/yr) in redundant AI spending.
- **Why it matters**: Startups with minor savings (<$50/mo) rarely book consultation calls. Startups losing $500+/mo have high financial leaks. We need our GTM distribution channels to target companies with team size >= 5 to maximize this ratio.

### Input Metric 3: Lead Capture Form Rate (Value-to-Lead)
- **Definition**: The percentage of audited users who fill in their business email to claim their report PDF or book a consult.
- **Why it matters**: Flagging savings does not help Credex if we don't capture the lead. We target **30% lead capture** from completed audits.
- **Optimization Vector**: Keep the form gates *after* the audit result is shown (Value First) and customize the CTAs dynamically based on the flagged savings tier.

---

## 3. Instrumentation & Analytics Stack

To measure these metrics accurately from day 1, we will instrument the frontend using:

- **PostHog** (Self-hosted or cloud free tier): For event tracking, form drop-off funnels, and session recordings to see where users get stuck.
- **Tracked Events**:
  - `audit_form_step_completed`: Fired when user updates team parameters.
  - `tool_added`: Tracks which specific AI tools are added (helps us see what tools are most popular in the wild).
  - `audit_calculated`: Tracks current spend, recommended spend, and monthly savings.
  - `lead_captured`: Tracks lead submissions (categorized into `high_savings` vs `low_savings`).
  - `report_shared`: Fired when a user generates a shareable anonymous report URL.

---

## 4. The Pivot Threshold: When do we change direction?

SaaS MVPs must have clear failure parameters to prevent endless iteration on dead concepts.

> [!WARNING]
> **The Pivot Trigger**
> If, after **30 days** of active distribution and a minimum of **200 completed audits**, our **Lead-to-Consultation Booking Rate is below 3%**, we will trigger a strategic pivot.

### What the Pivot Looks Like:
A booking rate <3% means that even though founders see their overspend, they don't trust Credex as the vehicle to capture those savings, or they don't care enough about $100-$300/mo to book a call.

1. **Strategic Shift (Product focus)**: If founders are lazy to switch billing accounts, we will pivot SpendOptic from a self-serve *calculator* into a **Chrome Extension** that reads their SaaS subscription portals automatically and presents a single-click *"Consolidate & Save 20%"* checkout, eliminating the friction of manual plan adjustments entirely.
2. **Pricing Pivot**: If startups are spending heavily on raw APIs and aren't converted by credits, we will offer a direct **API proxy router** that they can swap in their codebase in 1 line of code to save 20% flat, removing the consultation step.
