
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

    const isAnonymous = reporterWallet === 'Anonymous';

    // Check if already reported by this user (if not anonymous)
    if (!isAnonymous) {
      const { data: existing } = await supabase
        .from('scam_reports')
        .select('*')
        .eq('reported_address', scamAddress)
        .eq('reporter_wallet', reporterWallet)
        .single();

      if (existing) {
        throw new Error('You already reported this address');
      }
    }

    // Prepare report data
    // IMPORTANT: If anonymous, we send NULL for reporter_wallet to avoid FK constraint issues
    // We store 'Anonymous' in the signature field or just rely on reporter_wallet being null
    const reportPayload = {
      reported_address: scamAddress,
      reporter_wallet: isAnonymous ? null : reporterWallet, // Send NULL if anonymous
      signature: signature || 'Anonymous',
      reason: reason,
      evidence_url: evidenceUrl || null,
      stake_amount: 0.01,
      verified: false,
      created_at: new Date().toISOString()
    };

    console.log('Payload:', reportPayload);

    // Insert report
    const { data, error } = await supabase
      .from('scam_reports')
      .insert(reportPayload)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message);
    }

    console.log('✅ Report submitted:', data);

    // Update or create user reputation (only if not anonymous)
    if (!isAnonymous) {
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
// the amount of i changed this codeeee hoooooooooooooooooooooooooooooooooooo - venmathiye nov21252331