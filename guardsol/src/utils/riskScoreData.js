// RISK SCORE DATA FETCHER
// gathers all data needed to calculate risk score

import { fetchAllTokens } from './tokens';
import { getApprovalsWithRisk } from './approvals';
import { getWalletAge } from './solana';
import { calculateWalletRiskScore } from './riskScore';
import { getCachedData, setCachedData } from './cache';

export async function fetchRiskScoreData(walletAddress) {
  console.log('🎯 Fetching all data for risk score...');
  
  try {
    // Check if we have cached data (saves time)
    const cached = getCachedData('risk_score', walletAddress);
    if (cached) {
      console.log('✅ Returning cached risk score');
      return cached;
    }
    
    // Fetch tokens (includes scam detection)
    console.log('📡 Fetching tokens...');
    const tokens = await fetchAllTokens(walletAddress);
    
    // Get approvals from tokens
    console.log('📡 Analyzing approvals...');
    const approvals = await getApprovalsWithRisk(tokens);
    
    // Get wallet age
    console.log('📡 Fetching wallet age...');
    const walletAge = await getWalletAge(walletAddress);
    
    // Prepare data for risk calculation
    const data = {
      tokens,
      approvals,
      walletAge,
      recentScamInteractions: 0 // We can add this later
    };
    
    // Calculate risk score
    console.log('🎯 Calculating risk score...');
    const riskScore = calculateWalletRiskScore(data);
    
    // Add extra data to result
    const result = {
      ...riskScore,
      data: {
        tokensCount: tokens.length,
        approvalsCount: approvals.length,
        walletAge
      }
    };
    
    // Save to cache
    setCachedData('risk_score', walletAddress, result);
    
    console.log('✅ Risk score calculated:', result.score);
    return result;
    
  } catch (error) {
    console.error('❌ Error fetching risk score data:', error);
    throw error;
  }
}

// Clear risk score cache (use after revoking approvals)
export function clearRiskScoreCache(walletAddress) {
  localStorage.removeItem(`whm_risk_score_${walletAddress}`);
  console.log('🗑️ Cleared risk score cache');
}