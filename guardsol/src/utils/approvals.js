import { calculateApprovalRisk } from './approvalRisk';
import { supabase } from './supabaseClient';

export function extractApprovals(tokens) {
  console.log('🔍 Extracting approvals from', tokens.length, 'tokens...');

  const tokensWithApprovals = tokens.filter(token =>
    token.delegate && token.delegate !== null
  );

  console.log('✅ Found', tokensWithApprovals.length, 'approvals');

  const approvals = tokensWithApprovals.map(token => ({
    mint: token.mint,
    tokenName: token.metadata?.name || 'Unknown Token',
    tokenSymbol: token.metadata?.symbol || '???',
    tokenImage: token.metadata?.image,
    balance: token.balance,
    delegate: token.delegate,
    delegatedAmount: token.delegatedAmount,
    isUnlimited: token.isUnlimited,
    tokenAccountAddress: token.accountAddress,
    riskScore: 0,
    riskLevel: 'unknown',
    riskFactors: [],
    delegateInfo: null
  }));

  return approvals;
}

// Enrich approvals with risk data
export async function enrichApprovalsWithRisk(approvals) {
  console.log('🎯 Enriching', approvals.length, 'approvals...');

  const enriched = await Promise.all(
    approvals.map(async (approval) => {
      const risk = await calculateApprovalRisk(approval);
      return {
        ...approval,
        riskScore: risk.score,
        riskLevel: risk.level,
        riskFactors: risk.factors,
        delegateInfo: risk.delegateInfo
      };
    })
  );

  console.log('✅ Approvals enriched');
  return enriched;
}

// Get approvals with full risk analysis
export async function getApprovalsWithRisk(tokens, walletAddress) {
  const approvals = extractApprovals(tokens);

  if (approvals.length === 0) {
    console.log('✅ No approvals found');
    return [];
  }

  const enriched = await enrichApprovalsWithRisk(approvals);
  
  // Save to history if walletAddress is provided
  if (walletAddress) {
    for (const approval of enriched) {
      await saveApprovalToHistory(walletAddress, approval);
    }
  }

  enriched.sort((a, b) => b.riskScore - a.riskScore);

  return enriched;
}

// Group approvals by risk level
export function groupApprovalsByRisk(approvals) {
  return {
    critical: approvals.filter(a => a.riskLevel === 'critical'),
    high: approvals.filter(a => a.riskLevel === 'high'),
    medium: approvals.filter(a => a.riskLevel === 'medium'),
    low: approvals.filter(a => a.riskLevel === 'low')
  };
}

export async function saveApprovalToHistory(walletAddress, approval) {
  try {
    const { error } = await supabase
      .from('approval_history')
      .insert({
        wallet_address: walletAddress,
        token_mint: approval.mint,
        delegate_address: approval.delegate,
        amount: approval.delegatedAmount,
        is_unlimited: approval.isUnlimited,
        risk_score: approval.riskScore,
        detected_at: new Date().toISOString()
      });
      
    if (error) console.error('Failed to save approval:', error);
  } catch (err) {
    console.error('Approval save error:', err);
  }
}