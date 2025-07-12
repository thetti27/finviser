import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lrtkvlehhboxpdzqvnkk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxydGt2bGVoaGJveHBkenF2bmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMDk1MjEsImV4cCI6MjA2Nzg4NTUyMX0.3rBGDfsPpuyjVys3j60uqpkRHmBKvChx61GXPcid5Ro';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 