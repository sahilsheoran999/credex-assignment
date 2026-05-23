import { Resend } from 'resend';
import { AuditResult } from '@/types/audit';

const resendApiKey = process.env.RESEND_API_KEY || '';

export const isResendConfigured = Boolean(resendApiKey);

// Fallback mock sender if API key is not present
const resend = isResendConfigured ? new Resend(resendApiKey) : null;

if (!isResendConfigured) {
  console.warn(
    '⚠️ RESEND_API_KEY environment variable is not set. Transactional emails will be logged to the server console instead.'
  );
}

interface SendAuditEmailInput {
  email: string;
  auditResult: AuditResult;
  companyName?: string;
}

export async function sendAuditConfirmationEmail({
  email,
  auditResult,
  companyName,
}: SendAuditEmailInput) {
  const isHighSavings = auditResult.totalMonthlySavings >= 500;
  const savingsText = `$${auditResult.totalMonthlySavings.toFixed(0)}/mo ($${auditResult.totalAnnualSavings.toFixed(0)}/yr)`;

  const subject = isHighSavings
    ? `🔥 Critical Overspend Alert: Save ${savingsText} with Credex`
    : `📊 SpendOptic Audit: Your AI Stack Financial Breakdown`;

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
      <h2 style="color: #6366f1; margin-bottom: 20px;">SpendOptic AI Spend Audit</h2>
      <p>Hi there,</p>
      <p>Thank you for using <strong>SpendOptic</strong> by Credex. We have completed your instant AI spend audit${companyName ? ` for <strong>${companyName}</strong>` : ''}.</p>
      
      <div style="background-color: #f3f4f6; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 10px 0; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; color: #4b5563;">Audit Summary</h4>
        <div style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 5px;">
          ${isHighSavings ? 'Potential Savings: ' : 'Your Monthly Savings: '} <span style="color: #10b981;">$${auditResult.totalMonthlySavings.toFixed(0)}/mo</span>
        </div>
        <div style="font-size: 14px; color: #6b7280;">
          Annual Potential Savings: <strong style="color: #374151;">$${auditResult.totalAnnualSavings.toFixed(0)}/yr</strong>
        </div>
      </div>

      <h3>Per-Tool Breakdown:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb; text-align: left;">
            <th style="padding: 8px 0;">Tool</th>
            <th style="padding: 8px 0;">Current Spend</th>
            <th style="padding: 8px 0;">Recommended Plan</th>
            <th style="padding: 8px 0;">Monthly Savings</th>
          </tr>
        </thead>
        <tbody>
          ${auditResult.items
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px 0;"><strong>${item.toolName}</strong><br><span style="font-size: 11px; color: #9ca3af;">${item.currentPlanName} (${item.currentSeats} seats)</span></td>
              <td style="padding: 8px 0;">$${item.currentSpend.toFixed(0)}</td>
              <td style="padding: 8px 0;">${item.recommendedPlanName}</td>
              <td style="padding: 8px 0; color: ${item.savings > 0 ? '#10b981' : '#374151'};">${item.savings > 0 ? `+$${item.savings.toFixed(0)}` : '$0'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      ${
        isHighSavings
          ? `
          <div style="background-color: #eef2ff; border: 1px solid #e0e7ff; border-radius: 8px; padding: 20px; margin-top: 30px;">
            <h3 style="color: #4f46e5; margin-top: 0;">🎉 High-Savings Pre-Approval</h3>
            <p style="font-size: 14px;">Your startup qualifies for **Credex discounted infrastructure credits**! We can help you consolidate your stack and unlock up to 30% flat discounts on Cursor, Claude, ChatGPT, and OpenAI API spend immediately.</p>
            <p style="margin-bottom: 0;">Our team will reach out to you within **24 hours** to schedule a quick 10-minute savings consultation and allocate your discount credits.</p>
          </div>
          `
          : `
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">You are running a highly optimal AI stack setup! We will notify you automatically the moment any new pricing optimization opportunities or Credex credits apply to your stack.</p>
          `
      }

      <div style="margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 12px; color: #9ca3af; text-align: center;">
        Sent via <a href="https://credex.rocks" style="color: #6366f1; text-decoration: none;">Credex.rocks</a> - Premium AI Infrastructure Credits.
      </div>
    </div>
  `;

  if (resend) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'SpendOptic Audits <onboarding@resend.dev>', // Resend Sandbox Sender
        to: email,
        subject: subject,
        html: htmlContent,
      });

      if (error) {
        console.error('❌ Resend API Error:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (e) {
      console.error('❌ Resend Exception:', e);
      return { success: false, error: e };
    }
  } else {
    // Log fallback
    console.log('\n=========================================');
    console.log(`✉️  [MOCK EMAIL SENT TO: ${email}]`);
    console.log(`Subject: ${subject}`);
    console.log('HTML CONTENT CAPTURED BELOW:');
    console.log(htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
    console.log('=========================================\n');
    return { success: true, mock: true };
  }
}
