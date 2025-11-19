// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Create Supabase client for frontend
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey
);

console.log('✅ Supabase client initialized');

// Setup real-time listener for new reports
export function subscribeToReports(callback) {
  console.log('👂 Listening for new reports...');
  
  const subscription = supabase
    .channel('scam_reports_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'scam_reports'
      },
      (payload) => {
        console.log('🚨 New report received!', payload);
        callback(payload.new);
      }
    )
    .subscribe();
  
  return subscription;
}