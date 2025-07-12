import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lrtkvlehhboxpdzqvnkk.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for server-side operations (with service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Client for client-side operations (with anon key)
export const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!); 