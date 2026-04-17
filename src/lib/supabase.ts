import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Widing] Supabase env vars missing. Copy .env.local.example → .env.local and fill in your project credentials.'
  );
}

/** Browser / client-component safe client (uses anon key) */
export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder',
);

/** Server-side admin client (uses service role key — never expose to browser) */
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient<Database>(
    supabaseUrl ?? 'https://placeholder.supabase.co',
    serviceRoleKey ?? supabaseAnonKey ?? 'placeholder',
    { auth: { persistSession: false } }
  );
}

export type { Database };
