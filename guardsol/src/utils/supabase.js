import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Create Supabase client using config
export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

// Check if token address is in scam database
export async function checkIfScam(tokenAddress) {
  try {
    console.log('🔍 Checking database for:', tokenAddress.slice(0, 8));
    
    const { data, error } = await supabase
      .from('scam_database')
      .select('*')
      .eq('address', tokenAddress)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (data) {
      console.log('🚨 SCAM DETECTED:', data.name);
      return {
        isScam: true,
        name: data.name,
        reason: data.reason,
        verified: data.verified
      };
    }
    
    return { isScam: false };
    
  } catch (error) {
    console.error('❌ Database error:', error);
    return { isScam: false };
  }
}

// Get all scam addresses
export async function getAllScams() {
  try {
    const { data, error } = await supabase
      .from('scam_database')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('✅ Fetched', data.length, 'scams');
    return data;
    
  } catch (error) {
    console.error('❌ Error fetching scams:', error);
    return [];
  }
}