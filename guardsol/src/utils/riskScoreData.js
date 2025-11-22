// FETCHES ALL DATA NEEDED FOR RISK SCORE CALCULATION

import { fetchAllTokens } from './tokens';
import { getApprovalsWithRisk } from './approvals';
import { getWalletAge } from './solana';
import { calculateWalletRiskScore } from './riskScore';
import { getCachedData, setCachedData } from './cache';
import { supabase } from './supabaseClient';

/**
 * Fetch all data needed for risk score and calculate it
 * @param {string} walletAddress - Wallet address to analyze
 * @returns {Promise<Object>} Complete risk score data
 */
export async function fetchRiskScoreData(walletAddress) {
  console.log('🎯 Fetching all data for risk score...');

  try {
    // Check cache first (24 hour TTL)
    const cached = getCachedData('risk_score', walletAddress);
    if (cached) {
      console.log('✅ Returning cached risk score');
      return cached;
    }

    console.log('📡 Fetching fresh data...');

    // Fetch all tokens (includes scam detection)
    console.log('📡 Fetching tokens...');
    const tokens = await fetchAllTokens(walletAddress);
    console.log('✅ Fetched', tokens.length, 'tokens');

    // Get approvals from tokens with risk analysis
    console.log('📡 Analyzing approvals...');
    const approvals = await getApprovalsWithRisk(tokens, walletAddress);
    console.log('✅ Found', approvals.length, 'approvals');

    // Get wallet age
    console.log('📡 Fetching wallet age...');
    const walletAge = await getWalletAge(walletAddress);
    console.log('✅ Wallet age:', walletAge, 'days');

    // Prepare data object for risk calculation
    const data = {
      tokens,
      approvals,
      walletAge,
      recentScamInteractions: 0 // Can add this later if tracking transaction history
    };

    // Calculate risk score
    console.log('🎯 Calculating risk score...');
    const riskScore = calculateWalletRiskScore(data);

    // Add extra metadata
    const result = {
      ...riskScore,
      data: {
        tokensCount: tokens.length,
        approvalsCount: approvals.length,
        walletAge,
        walletAddress
      }
    };

    // Cache the result (24 hours)
    setCachedData('risk_score', walletAddress, result);

    // Save to database for history
    try {
      const { error } = await supabase
        .from('risk_scores')
        .insert({
          wallet_address: walletAddress,
          score: result.score,
          calculation_breakdown: result.breakdown,
          calculated_at: new Date().toISOString()
        });

      if (error) console.error('Failed to save risk score:', error);
    } catch (err) {
      console.error('Risk score save error:', err);
    }

    console.log('✅ Risk score calculated:', result.score);
    return result;

  } catch (error) {
    console.error('❌ Error fetching risk score data:', error);
    throw error;
  }
}

/**
 * Clear risk score cache for a wallet
 * Use this after user revokes approvals so score recalculates
 * @param {string} walletAddress - Wallet address
 */
export function clearRiskScoreCache(walletAddress) {
  // Remove from localStorage
  const cacheKey = `guardsol_risk_score_${walletAddress}`;
  localStorage.removeItem(cacheKey);
  console.log('🗑️ Cleared risk score cache for', walletAddress.slice(0, 8));
}

/**
 * Force refresh risk score (bypass cache)
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<Object>} Fresh risk score data
 */
export async function forceRefreshRiskScore(walletAddress) {
  console.log('🔄 Force refreshing risk score...');

  // Clear cache first
  clearRiskScoreCache(walletAddress);

  // Fetch fresh
  return await fetchRiskScoreData(walletAddress);
}

/**
 * Fetch risk score history for a wallet
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<Array>} History of risk scores
 */
export async function getRiskScoreHistory(walletAddress) {
  try {
    const { data, error } = await supabase
      .from('risk_scores')
      .select('score, calculated_at')
      .eq('wallet_address', walletAddress)
      .order('calculated_at', { ascending: true })
      .limit(30); // Last 30 entries

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching score history:', error);
    return [];
  }
}