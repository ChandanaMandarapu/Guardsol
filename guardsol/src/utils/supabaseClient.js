import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Supabase client for frontend
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey
);

console.log('✅ Supabase client initialized');