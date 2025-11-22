import { supabase } from './supabaseClient';

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
        verified: data.verified,
        source: 'database' // Old database
      };
    }
    
    //Check community reports
    const communityCheck = await checkCommunityReports(tokenAddress);
    if (communityCheck.isScam) {
      return communityCheck;
    }
    
    return { isScam: false };
    
  } catch (error) {
    console.error('❌ Database error:', error);
    return { isScam: false };
  }
}

//Check community reports
export async function checkCommunityReports(address) {
  try {
    const { data: reports, error } = await supabase
      .from('scam_reports')
      .select('*')
      .eq('reported_address', address);
    
    if (error) throw error;
    
    if (!reports || reports.length === 0) {
      return { isScam: false, reportCount: 0 };
    }
    
    const totalReports = reports.length;
    const verifiedReports = reports.filter(r => r.verified).length;
    
    // Calculate confidence
    let confidence = 0;
    if (verifiedReports > 0) confidence += 50; // Admin verified
    if (totalReports >= 10) confidence += 30; // Many reports
    else if (totalReports >= 5) confidence += 15;
    else if (totalReports >= 3) confidence += 10;
    
    console.log('📊', address.slice(0, 8), '- Reports:', totalReports, 'Confidence:', confidence);
    
    return {
      isScam: confidence >= 50,
      reportCount: totalReports,
      verifiedCount: verifiedReports,
      confidence,
      source: 'community',
      reports: reports.map(r => ({
        reason: r.reason,
        reportedAt: r.created_at,
        verified: r.verified
      }))
    };
    
  } catch (error) {
    console.error('❌ Error checking community reports:', error);
    return { isScam: false, reportCount: 0 };
  }
}

// Get all scams from old database
export async function getAllScams() {
  try {
    const { data, error } = await supabase
      .from('scam_database')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    console.log('✅ Fetched', data.length, 'scams from database');
    return data;
    
  } catch (error) {
    console.error('❌ Error fetching scams:', error);
    return [];
  }
}