// RISK SCORE CALCULATOR

export function calculateWalletRiskScore(data) {
  console.log('🎯 Calculating wallet risk score...');
  
  // Start at perfect score (100)
  let score = 100;
  const breakdown = {
    deductions: [],
    bonuses: [],
    totalDeducted: 0,
    totalBonuses: 0
  };
  
  // ============================================
  // FACTOR 1: APPROVALS (Most imp - 40% weight)
  // ============================================
  
  if (data.approvals && data.approvals.length > 0) {
    console.log('📊 Analyzing', data.approvals.length, 'approvals...');
    
    // Group approvals 
    const critical = data.approvals.filter(a => a.riskScore >= 81);
    const high = data.approvals.filter(a => a.riskScore >= 61 && a.riskScore < 81);
    const medium = data.approvals.filter(a => a.riskScore >= 31 && a.riskScore < 61);
    const low = data.approvals.filter(a => a.riskScore < 31);
    
    // Subtract points for dangerous approvals
    if (critical.length > 0) {
      const points = critical.length * 25; // Each critical approval = -25 points
      score -= points;
      breakdown.deductions.push({
        category: 'Critical Approvals',
        count: critical.length,
        points: points,
        severity: 'critical',
        description: `${critical.length} CRITICAL risk approval${critical.length !== 1 ? 's' : ''} detected`,
        recommendation: 'Revoke immediately! These can drain your funds.'
      });
      console.log('🔴 Critical approvals:', critical.length, '(-' + points + ' points)');
    }
    
    if (high.length > 0) {
      const points = high.length * 15; // Each high risk = -15 points
      score -= points;
      breakdown.deductions.push({
        category: 'High Risk Approvals',
        count: high.length,
        points: points,
        severity: 'high',
        description: `${high.length} high risk approval${high.length !== 1 ? 's' : ''}`,
        recommendation: 'Review and revoke suspicious approvals.'
      });
      console.log('🟠 High risk approvals:', high.length, '(-' + points + ' points)');
    }
    
    if (medium.length > 0) {
      const points = medium.length * 5; // Each medium risk = -5 points
      score -= points;
      breakdown.deductions.push({
        category: 'Medium Risk Approvals',
        count: medium.length,
        points: points,
        severity: 'medium',
        description: `${medium.length} medium risk approval${medium.length !== 1 ? 's' : ''}`,
        recommendation: 'Monitor these approvals regularly.'
      });
      console.log('🟡 Medium risk approvals:', medium.length, '(-' + points + ' points)');
    }
    
  } else {
    // No approvals = BONUS!
    breakdown.bonuses.push({
      category: 'No Approvals',
      points: 10,
      description: 'Your wallet has no token approvals',
      icon: '🎉'
    });
    console.log('✅ No approvals found (+10 bonus)');
  }
  
  // ============================================
  // FACTOR 2: SCAM TOKENS (Second most imp - 30% weight)
  // ============================================
  
  if (data.tokens && data.tokens.length > 0) {
    console.log('📊 Analyzing', data.tokens.length, 'tokens...');
    
    // Group tokens by how scamm they are
    const confirmedScams = data.tokens.filter(t => t.scamScore === 100);
    const likelyScams = data.tokens.filter(t => t.scamScore >= 61 && t.scamScore < 100);
    const suspicious = data.tokens.filter(t => t.scamScore >= 31 && t.scamScore < 61);
    
    if (confirmedScams.length > 0) {
      const points = confirmedScams.length * 15;
      score -= points;
      breakdown.deductions.push({
        category: 'Confirmed Scam Tokens',
        count: confirmedScams.length,
        points: points,
        severity: 'high',
        description: `${confirmedScams.length} confirmed scam token${confirmedScams.length !== 1 ? 's' : ''} in database`,
        recommendation: 'These cannot steal funds, but clutter your wallet.'
      });
      console.log('🚨 Confirmed scams:', confirmedScams.length, '(-' + points + ' points)');
    }
    
    if (likelyScams.length > 0) {
      const points = likelyScams.length * 10;
      score -= points;
      breakdown.deductions.push({
        category: 'Likely Scam Tokens',
        count: likelyScams.length,
        points: points,
        severity: 'medium',
        description: `${likelyScams.length} likely scam token${likelyScams.length !== 1 ? 's' : ''}`,
        recommendation: 'Review token details and avoid interacting.'
      });
      console.log('🔴 Likely scams:', likelyScams.length, '(-' + points + ' points)');
    }
    
    if (suspicious.length > 0) {
      const points = suspicious.length * 3;
      score -= points;
      breakdown.deductions.push({
        category: 'Suspicious Tokens',
        count: suspicious.length,
        points: points,
        severity: 'low',
        description: `${suspicious.length} suspicious token${suspicious.length !== 1 ? 's' : ''}`,
        recommendation: 'Be cautious with these tokens.'
      });
      console.log('🟡 Suspicious tokens:', suspicious.length, '(-' + points + ' points)');
    }
  }
  
  // ============================================
  // FACTOR 3: WALLET AGE (Bonus points for older wallets)
  // ============================================
  
  if (data.walletAge && data.walletAge > 365) {
    breakdown.bonuses.push({
      category: 'Established Wallet',
      points: 3,
      description: 'Wallet is over 1 year old',
      icon: '📅'
    });
    console.log('✅ Wallet age > 1 year (+3 bonus)');
  }
  
  // ============================================
  // CALCULATE FINAL SCORE
  // ============================================
  
  // Calculate totals
  breakdown.totalDeducted = breakdown.deductions.reduce((sum, d) => sum + d.points, 0);
  breakdown.totalBonuses = breakdown.bonuses.reduce((sum, b) => sum + b.points, 0);
  
  // Apply bonuses
  score += breakdown.totalBonuses;
  
  // Make sure score is between 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Determine what level (Excellent, Good, Fair, etc.)
  let level = 'critical';
  let levelLabel = 'CRITICAL';
  let levelColor = 'red';
  let levelEmoji = '🔴';
  
  if (score >= 90) {
    level = 'excellent';
    levelLabel = 'Excellent';
    levelColor = 'green';
    levelEmoji = '🟢';
  } else if (score >= 75) {
    level = 'good';
    levelLabel = 'Good';
    levelColor = 'lightgreen';
    levelEmoji = '🟢';
  } else if (score >= 60) {
    level = 'fair';
    levelLabel = 'Fair';
    levelColor = 'yellow';
    levelEmoji = '🟡';
  } else if (score >= 40) {
    level = 'poor';
    levelLabel = 'Poor';
    levelColor = 'orange';
    levelEmoji = '🟠';
  }
  
  console.log('✅ Final risk score:', score, '(' + levelLabel + ')');
  
  return {
    score,
    level,
    levelLabel,
    levelColor,
    levelEmoji,
    breakdown,
    timestamp: new Date().toISOString()
  };
}

// Helper function: Get color for score
export function getScoreColor(score) {
  if (score >= 90) return '#10b981'; // green
  if (score >= 75) return '#84cc16'; // lime
  if (score >= 60) return '#eab308'; // yellow
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

// Helper function: Get suggestions to improve score
export function getImprovementSuggestions(riskData) {
  const suggestions = [];
  
  // Get all deductions
  const deductions = riskData.breakdown.deductions;
  
  // Sort by biggest impact first
  const sorted = [...deductions].sort((a, b) => b.points - a.points);
  
  // Get top 3 suggestions
  sorted.forEach((item, index) => {
    if (index < 3) {
      suggestions.push({
        priority: index + 1,
        action: item.recommendation,
        impact: `+${item.points} points`,
        category: item.category
      });
    }
  });
  
  return suggestions;
}

// Calculate what score would be after improvements
export function calculatePotentialScore(currentScore, improvements) {
  let potentialScore = currentScore;
  
  improvements.forEach(improvement => {
    const points = parseInt(improvement.impact.replace('+', '').replace(' points', ''));
    potentialScore += points;
  });
  
  return Math.min(100, potentialScore);
}