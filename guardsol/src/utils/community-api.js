// src/utils/community-api.js
// LOCAL API FUNCTIONS (No backend needed for now)

import { supabase } from './supabaseClient';
import bs58 from 'bs58';

/**
 * Submit a scam report directly to Supabase
 * @param {Object} reportData - Report details
 * @returns {Promise<Object>} Result
 */
export async function submitScamReport(reportData) {
  try {
    const {
      scamAddress,
      reporterWallet,
      signature,
      reason,
      evidenceUrl
    } = reportData;

    console.log('📝 Submitting report to Supabase...');

    // Check if already reported by this user (if not anonymous)
    if (reporterWallet !== 'Anonymous') {
      const { data: existing } = await supabase
        .from('scam_reports')
        .select('*')
        .eq('reported_address', scamAddress)
        .eq('reporter_wallet', reporterWallet)
        .single();

      if (existing) {
        throw new Error('You already reported this address');
      }
    } else {
      // CRITICAL FIX: Ensure 'Anonymous' user exists in user_reputation to satisfy Foreign Key constraint
      try {
        // Check if Anonymous user exists (using select to avoid error on 0 rows)
        const { data: anonUsers, error: fetchError } = await supabase
          .from('user_reputation')
          .select('wallet_address')
          .eq('wallet_address', 'Anonymous');

        if (fetchError || !anonUsers || anonUsers.length === 0) {
          console.log('👤 Creating Anonymous user record...');
          const { error: createError } = await supabase
            .from('user_reputation')
            .insert({
              wallet_address: 'Anonymous',
              reputation_score: 0,
              total_reports: 0,
              verified_reports: 0,
              false_reports: 0,
              wallet_age_days: 0,
              created_at: new Date().toISOString(),
              last_active: new Date().toISOString()
            });

          if (createError) {
            console.error('Failed to create Anonymous user:', createError);
            // If it failed because it already exists (race condition), that's fine.
            if (!createError.message?.includes('duplicate')) {
              throw new Error('Failed to initialize anonymous reporting system');
            }
          }
        }
      } catch (err) {
        console.warn('Error checking/creating anonymous user:', err);
        // If we really can't ensure the user exists, the next insert will fail with FK error.
      }
    }

    // Insert report
    const { data, error } = await supabase
      .from('scam_reports')
      .insert({
        reported_address: scamAddress,
        reporter_wallet: reporterWallet,
        signature: signature || 'Anonymous',
        reason: reason,
        evidence_url: evidenceUrl || null,
        stake_amount: 0.01,
        verified: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Report submitted:', data);

    // Update or create user reputation (only if not anonymous)
    if (reporterWallet !== 'Anonymous') {
      await updateUserReputation(reporterWallet);
    }

    return {
      success: true,
      reportId: data.id,
      message: 'Report submitted successfully'
    };

  } catch (error) {
    console.error('❌ Submit error:', error);
    throw error;
  }
}

/**
 * Get community reports for an address
 * @param {string} address - Token/wallet address
 * @returns {Promise<Object>} Report summary
 */
export async function getCommunityReports(address) {
  try {
    const { data: reports, error } = await supabase
      .from('scam_reports')
      .select('*')
      .eq('reported_address', address);

    if (error) throw error;

    if (!reports || reports.length === 0) {
      return {
        isScam: false,
        reportCount: 0,
        confidence: 0
      };
    }

    const totalReports = reports.length;
    const verifiedReports = reports.filter(r => r.verified).length;

    // Calculate confidence
    let confidence = 0;
    if (verifiedReports > 0) confidence += 50;
    if (totalReports >= 10) confidence += 30;
    else if (totalReports >= 5) confidence += 15;
    else if (totalReports >= 3) confidence += 10;

    return {
      isScam: confidence >= 50,
      reportCount: totalReports,
      verifiedCount: verifiedReports,
      confidence: Math.min(100, confidence),
      reports: reports.map(r => ({
        reason: r.reason,
        reportedAt: r.created_at,
        verified: r.verified
      }))
    };

  } catch (error) {
    console.error('❌ Get reports error:', error);
    return {
      isScam: false,
      reportCount: 0,
      confidence: 0
    };
  }
}

/**
 * Update user reputation after report
 */
async function updateUserReputation(walletAddress) {
  try {
    const { data: existing } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (existing) {
      // Update existing
      await supabase
        .from('user_reputation')
        .update({
          total_reports: existing.total_reports + 1,
          last_active: new Date().toISOString()
        })
        .eq('wallet_address', walletAddress);
    } else {
      // Create new
      await supabase
        .from('user_reputation')
        .insert({
          wallet_address: walletAddress,
          reputation_score: 50,
          total_reports: 1,
          verified_reports: 0,
          false_reports: 0,
          wallet_age_days: 30,
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Reputation update error:', error);
  }
}

/**
 * Sign message with wallet
 * @param {string} message - Message to sign
 * @param {Object} wallet - Wallet adapter
 * @returns {Promise<string>} Base58 signature
 */
export async function signMessageWithWallet(message, wallet) {
  if (!wallet || !wallet.signMessage) {
    throw new Error('Wallet does not support message signing');
  }

  const messageBytes = new TextEncoder().encode(message);
  const signature = await wallet.signMessage(messageBytes);
  const signatureBase58 = bs58.encode(signature);

  return signatureBase58;
}