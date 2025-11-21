import { getDelegateIntelligence } from './delegateIntelligence';

// Calculate approval risk (0-100)
export async function calculateApprovalRisk(approval) {
  let riskScore = 0;
  const riskFactors = [];
  
  console.log('🎯 Scoring:', approval.tokenName);
  
  // Unlimited approval (+60 points)
  if (approval.isUnlimited) {
    riskScore += 60;
    riskFactors.push({
      severity: 'critical',
      factor: 'Unlimited Approval',
      description: 'Delegate can transfer ALL your tokens',
      points: 60
    });
  } else {
    riskScore += 20;
    riskFactors.push({
      severity: 'medium',
      factor: 'Limited Approval',
      description: `Delegate can transfer up to ${approval.delegatedAmount} tokens`,
      points: 20
    });
  }
  
  // Get delegate intelligence
  const delegateInfo = await getDelegateIntelligence(approval.delegate);
  
  // Known scammer (+30 points)
  if (delegateInfo.isScammer) {
    riskScore += 30;
    riskFactors.push({
      severity: 'critical',
      factor: 'Known Scammer',
      description: 'Delegate is in our scam database',
      points: 30
    });
  }
  
  // Delegate wallet age (+20 points if very new)
  if (delegateInfo.age < 7) {
    riskScore += 20;
    riskFactors.push({
      severity: 'high',
      factor: 'Very New Delegate',
      description: `Delegate created only ${delegateInfo.age} days ago`,
      points: 20
    });
  } else if (delegateInfo.age < 30) {
    riskScore += 10;
    riskFactors.push({
      severity: 'medium',
      factor: 'New Delegate',
      description: `Delegate created ${delegateInfo.age} days ago`,
      points: 10
    });
  }
  
  // Transaction count (+10 if very few)
  if (delegateInfo.txCount < 10) {
    riskScore += 10;
    riskFactors.push({
      severity: 'medium',
      factor: 'Few Transactions',
      description: `Delegate has only ${delegateInfo.txCount} transactions`,
      points: 10
    });
  }
  
  // Cap at 100
  riskScore = Math.min(riskScore, 100);
  
  // Determine risk level
  let riskLevel = 'low';
  if (riskScore >= 81) riskLevel = 'critical';
  else if (riskScore >= 61) riskLevel = 'high';
  else if (riskScore >= 31) riskLevel = 'medium';
  
  console.log('✅ Risk score:', riskScore);
  
  return {
    score: riskScore,
    level: riskLevel,
    factors: riskFactors,
    delegateInfo
  };
}

// Get risk color
export function getRiskColor(riskLevel) {
  const colors = {
    critical: 'red',
    high: 'orange',
    medium: 'yellow',
    low: 'blue'
  };
  return colors[riskLevel] || 'gray';
}

// Get risk emoji
export function getRiskEmoji(riskLevel) {
  const emojis = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵'
  };
  return emojis[riskLevel] || '⚪';
}

// Get risk label
export function getRiskLabel(riskLevel) {
  const labels = {
    critical: 'CRITICAL RISK',
    high: 'High Risk',
    medium: 'Medium Risk',
    low: 'Low Risk'
  };
  return labels[riskLevel] || 'Unknown';
}