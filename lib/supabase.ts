import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'placeholder-key';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase URL ou Key não encontrados.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'horizon-sales-tv-auth'
  },
  db: { schema: 'public' },
  realtime: { params: { eventsPerSecond: 10 } },
  global: { headers: { 'x-application-name': 'horizon-sales-tv' } }
});

console.log(supabase)
