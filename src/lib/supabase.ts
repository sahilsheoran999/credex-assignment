import { createClient } from '@supabase/supabase-js';

// Clean the environment variables by trimming spaces and stripping quotes
let rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
let rawAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// Strip surrounding double or single quotes if they were pasted accidentally
if (rawUrl.startsWith('"') && rawUrl.endsWith('"')) rawUrl = rawUrl.slice(1, -1);
if (rawUrl.startsWith("'") && rawUrl.endsWith("'")) rawUrl = rawUrl.slice(1, -1);
if (rawAnonKey.startsWith('"') && rawAnonKey.endsWith('"')) rawAnonKey = rawAnonKey.slice(1, -1);
if (rawAnonKey.startsWith("'") && rawAnonKey.endsWith("'")) rawAnonKey = rawAnonKey.slice(1, -1);

// Verify that the URL begins with standard HTTP/HTTPS protocol
const isValidUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://');

export const isSupabaseConfigured = Boolean(
  rawUrl && rawAnonKey && isValidUrl && rawUrl !== 'your_supabase_url'
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ Supabase URL or Anon Key is missing, malformed, or invalid. Database integrations will run in Mock/Offline mode.'
  );
}

// Ensure createClient always receives a syntactically valid URL structure to prevent hard Vercel build crashes
const finalUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder-url-prevent-crash.supabase.co';
const finalAnonKey = isSupabaseConfigured ? rawAnonKey : 'placeholder-key-prevent-crash';

export const supabase = createClient(finalUrl, finalAnonKey);
