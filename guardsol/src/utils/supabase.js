import { createClient } from '@supabase/supabase-js';


const SUPABASE_URL = 'https://wjioubfrdqdpjusqfheu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqaW91YmZyZHFkcGp1c3FmaGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMjU5NTUsImV4cCI6MjA3ODgwMTk1NX0.xR0oJbk6wH2a8pMgAM67--XJ83ROe3DYcOkRKYsrFSc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if token address is in scam database
export async function checkIfScam(tokenAddress) {
  try {
    console.log('🔍 Checking if scam:', tokenAddress);
    
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
    } else {
      console.log('✅ Not in scam database');
      return { isScam: false };
    }
    
  } catch (error) {
    console.error('❌ Error checking scam database:', error);
    return { isScam: false };
  }
}

// Getting all scam addresses
export async function getAllScams() {
  try {
    console.log('📥 Fetching all scams...');
    
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