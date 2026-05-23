import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendAuditConfirmationEmail } from '@/lib/email';
import { AuditResult } from '@/types/audit';

export async function POST(req: Request) {
  try {
    const { email, companyName, role, teamSize, auditResult } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let leadId = null;

    if (isSupabaseConfigured) {
      // 1. Check if lead already exists
      const { data: existingLead, error: checkError } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing lead:', checkError);
      }

      if (existingLead) {
        leadId = existingLead.id;
        // Optionally update company name / role
        const { error: updateError } = await supabase
          .from('leads')
          .update({
            company_name: companyName || null,
            role: role || null,
            team_size: teamSize || null,
          })
          .eq('id', leadId);

        if (updateError) {
          console.error('Error updating existing lead details:', updateError);
        }
      } else {
        // Create new lead record
        const { data: newLead, error: insertError } = await supabase
          .from('leads')
          .insert({
            email: email,
            company_name: companyName || null,
            role: role || null,
            team_size: teamSize || null,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting new lead:', insertError);
          // Don't crash here; we can still try to proceed to send email even if DB insert fails
        } else {
          leadId = newLead.id;
        }
      }
    } else {
      console.log('✏️ Database is Offline. Simulating lead storage.');
    }

    // 2. Trigger Transactional Email
    const emailResult = await sendAuditConfirmationEmail({
      email,
      auditResult: auditResult as AuditResult,
      companyName,
    });

    return NextResponse.json({
      success: true,
      leadId,
      emailTriggered: emailResult.success,
      offlineMode: !isSupabaseConfigured,
    });
  } catch (e) {
    console.error('Exception in leads API route:', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
