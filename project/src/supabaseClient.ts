import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '';

if (!url || !anonKey) {
  console.error('Supabase environment variables are missing. Check .env file.');
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});
