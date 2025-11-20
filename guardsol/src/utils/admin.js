// src/utils/admin.js
// FULLY FIXED: Admin utility functions with proper verification
import { supabase } from './supabaseClient';

// YOUR ADMIN WALLET ADDRESS
const ADMIN_WALLET = 'EB51DpnWfwM91HHipvub1VCcz5bSrJ7cjNentHcvgRBM';

/**
 * Check if wallet address is admin
 */
export function isAdmin(walletAddress) {
  if (!walletAddress) return false;
  return walletAddress.toLowerCase() === ADMIN_WALLET.toLowerCase();
}

/**
 * Check if in demo mode (not admin but viewing)
 */
export function isDemoMode(walletAddress) {
  return !isAdmin(walletAddress);
}

/**
 * Get all reports from database
 */
export async function getAllReports() {
  try {
    const { data, error } = await supabase
      .from('scam_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('📊 Fetched all reports:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching reports:', error);
    return [];
  }
}

/**
 * Get pending reports (not verified)
 */
export async function getPendingReports() {
  try {
    const { data, error } = await supabase
      .from('scam_reports')
      .select('*')
      .eq('verified', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('⏳ Fetched pending reports:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching pending reports:', error);
    return [];
  }
}

/**
 * Get verified reports
 */
export async function getVerifiedReports() {
  try {
    const { data, error } = await supabase
      .from('scam_reports')
      .select('*')
      .eq('verified', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('✅ Fetched verified reports:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching verified reports:', error);
    return [];
  }
}

/**
 * Verify a report (admin only) - CLIENT-SIDE VERSION
 * This updates Supabase directly without API endpoint
 */
export async function verifyReport(reportId, adminWallet, verdict) {
  try {
    console.log('🔐 Verifying report:', reportId, 'Verdict:', verdict);

    // Check if admin
    if (!isAdmin(adminWallet)) {
      throw new Error('Unauthorized - Not admin');
    }

    // Get the report first
    const { data: report, error: fetchError } = await supabase
      .from('scam_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchError) throw fetchError;
    if (!report) throw new Error('Report not found');

    console.log('📝 Found report:', report);

    // Update report verification status
    const { data: updatedReport, error: updateError } = await supabase
      .from('scam_reports')
      .update({
        verified: verdict === 'approve',
        verified_by: adminWallet,
        verified_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ Report updated:', updatedReport);

    // Update reporter reputation
    // Handle case where reporter_wallet might be null (Anonymous)
    if (report.reporter_wallet && report.reporter_wallet !== 'Anonymous') {
      const repChange = verdict === 'approve' ? 5 : -10;

      const { data: userRep, error: repError } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('wallet_address', report.reporter_wallet)
        .single();

      if (userRep) {
        console.log('📊 Updating reputation...');

        await supabase
          .from('user_reputation')
          .update({
            reputation_score: Math.max(0, Math.min(100, userRep.reputation_score + repChange)),
            verified_reports: verdict === 'approve' ? userRep.verified_reports + 1 : userRep.verified_reports,
            false_reports: verdict === 'reject' ? userRep.false_reports + 1 : userRep.false_reports
          })
          .eq('wallet_address', report.reporter_wallet);

        console.log('✅ Reputation updated');
      } else {
        console.log('⚠️ No reputation record found for reporter');
      }
    } else {
      console.log('ℹ️ Anonymous report verified, no reputation update needed.');
    }

    return { success: true, verdict };

  } catch (error) {
    console.error('❌ Error verifying report:', error);
    throw error;
  }
}

/**
 * Approve a report (wrapper for verifyReport)
 */
export async function approveReport(reportId, adminWallet) {
  return verifyReport(reportId, adminWallet, 'approve');
}

/**
 * Reject a report (wrapper for verifyReport)
 */
export async function rejectReport(reportId, adminWallet) {
  return verifyReport(reportId, adminWallet, 'reject');
}

/**
 * Get reporter stats
 */
export async function getReporterStats(walletAddress) {
  // Handle null/undefined or 'Anonymous'
  if (!walletAddress || walletAddress === 'Anonymous') {
    return {
      reputation_score: 0,
      total_reports: 0,
      verified_reports: 0,
      false_reports: 0,
      is_anonymous: true
    };
  }

  try {
    const { data, error } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found, return default stats
        return {
          reputation_score: 0,
          total_reports: 0,
          verified_reports: 0,
          false_reports: 0
        };
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching reporter stats:', error);
    return {
      reputation_score: 0,
      total_reports: 0,
      verified_reports: 0,
      false_reports: 0
    };
  }
}