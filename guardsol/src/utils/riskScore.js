/**
 * em ledhu calculating comprehensive wallet risk score (0-100)
 * Higher score = Better security
 * @param {Object} walletData - All wallet data
 * @returns {Object} Score with breakdown
 */
export function calculateWalletRiskScore(walletData) {
  console.log('🎯 Calculating wallet risk score...');
  
  // PERFECT SCORE 
  let score = 100;
  
  const breakdown = {
    deductions: [],
    bonuses: [],
    totalDeducted: 0,
    totalBonuses: 0
  };
  // hooo koncham proffesional comments rasanu 
  // ============================================
  // FACTOR 1: TOKEN APPROVALS (40% weight - BIGGEST RISK)
  // ============================================
  
  if (walletData.approvals && walletData.approvals.length > 0) {
    console.log('📊 Analyzing', walletData.approvals.length, 'approvals...');
    
    // Group by risk level
    const critical = walletData.approvals.filter(a => a.riskScore >= 81);
    const high = walletData.approvals.filter(a => a.riskScore >= 61 && a.riskScore < 81);
    const medium = walletData.approvals.filter(a => a.riskScore >= 31 && a.riskScore < 61);
    const low = walletData.approvals.filter(a => a.riskScore < 31);
    
    // CRITICAL APPROVALS (-25 points each)
    if (critical.length > 0) {
      const points = critical.length * 25;
      score -= points;
      breakdown.deductions.push({
        category: 'Critical Risk Approvals',
        count: critical.length,
        points: points,
        severity: 'critical',
        description: `${critical.length} CRITICAL risk approval${critical.length !== 1 ? 's' : ''} detected`,
        recommendation: 'Revoke immediately! These can drain your funds.',
        icon: '🔴'
      });
      console.log('🔴 Critical approvals:', critical.length, '(-' + points + ')');
    }
    
    // HIGH RISK APPROVALS (-15 points each)
    if (high.length > 0) {
      const points = high.length * 15;
      score -= points;
      breakdown.deductions.push({
        category: 'High Risk Approvals',
        count: high.length,
        points: points,
        severity: 'high',
        description: `${high.length} high risk approval${high.length !== 1 ? 's' : ''}`,
        recommendation: 'Review and revoke suspicious approvals.',
        icon: '🟠'
      });
      console.log('🟠 High risk approvals:', high.length, '(-' + points + ')');
    }
    
    // MEDIUM RISK APPROVALS (-5 points each)
    if (medium.length > 0) {
      const points = medium.length * 5;
      score -= points;
      breakdown.deductions.push({
        category: 'Medium Risk Approvals',
        count: medium.length,
        points: points,
        severity: 'medium',
        description: `${medium.length} medium risk approval${medium.length !== 1 ? 's' : ''}`,
        recommendation: 'Monitor these approvals regularly.',
        icon: '🟡'
      });
      console.log('🟡 Medium risk approvals:', medium.length, '(-' + points + ')');
    }
    
  } else {
    // NO APPROVALS = BONUS!
    breakdown.bonuses.push({
      category: 'No Approvals',
      points: 10,
      description: 'Your wallet has no token approvals',
      icon: '🎉'
    });
    console.log('✅ No approvals found (+10 bonus)');
  }
  
  // ============================================
  // FACTOR 2: SCAM TOKENS (30% weight)
  // ============================================
  
  if (walletData.tokens && walletData.tokens.length > 0) {
    console.log('📊 Analyzing', walletData.tokens.length, 'tokens...');
    
    // Group tokens by scam score
    const confirmedScams = walletData.tokens.filter(t => t.scamScore === 100);
    const likelyScams = walletData.tokens.filter(t => t.scamScore >= 61 && t.scamScore < 100);
    const suspicious = walletData.tokens.filter(t => t.scamScore >= 31 && t.scamScore < 61);
    
    // CONFIRMED SCAMS (-15 points each)
    if (confirmedScams.length > 0) {
      const points = confirmedScams.length * 15;
      score -= points;
      breakdown.deductions.push({
        category: 'Confirmed Scam Tokens',
        count: confirmedScams.length,
        points: points,
        severity: 'high',
        description: `${confirmedScams.length} confirmed scam token${confirmedScams.length !== 1 ? 's' : ''} in database`,
        recommendation: 'These tokens are known scams. They cannot steal funds but clutter your wallet.',
        icon: '🚨'
      });
      console.log('🚨 Confirmed scams:', confirmedScams.length, '(-' + points + ')');
    }
    
    // LIKELY SCAMS (-10 points each)
    if (likelyScams.length > 0) {
      const points = likelyScams.length * 10;
      score -= points;
      breakdown.deductions.push({
        category: 'Likely Scam Tokens',
        count: likelyScams.length,
        points: points,
        severity: 'medium',
        description: `${likelyScams.length} likely scam token${likelyScams.length !== 1 ? 's' : ''}`,
        recommendation: 'Review token details carefully. Avoid interacting with these.',
        icon: '🔴'
      });
      console.log('🔴 Likely scams:', likelyScams.length, '(-' + points + ')');
    }
    
    // SUSPICIOUS TOKENS (-3 points each)
    if (suspicious.length > 0) {
      const points = suspicious.length * 3;
      score -= points;
      breakdown.deductions.push({
        category: 'Suspicious Tokens',
        count: suspicious.length,
        points: points,
        severity: 'low',
        description: `${suspicious.length} suspicious token${suspicious.length !== 1 ? 's' : ''}`,
        recommendation: 'Be cautious when interacting with these tokens.',
        icon: '🟡'
      });
      console.log('🟡 Suspicious tokens:', suspicious.length, '(-' + points + ')');
    }
  }
  
  // ============================================
  // FACTOR 3: WALLET AGE (Bonus for established wallets)
  // ============================================
  
  if (walletData.walletAge) {
    if (walletData.walletAge > 365) {
      breakdown.bonuses.push({
        category: 'Established Wallet',
        points: 3,
        description: 'Wallet is over 1 year old',
        icon: '📅'
      });
      console.log('✅ Wallet age > 1 year (+3 bonus)');
    } else if (walletData.walletAge > 90) {
      breakdown.bonuses.push({
        category: 'Mature Wallet',
        points: 2,
        description: 'Wallet is over 3 months old',
        icon: '📅'
      });
      console.log('✅ Wallet age > 3 months (+2 bonus)');
    }
  }
  
  // ============================================
  // CALCULATE TOTALS
  // ============================================
  
  breakdown.totalDeducted = breakdown.deductions.reduce((sum, d) => sum + d.points, 0);
  breakdown.totalBonuses = breakdown.bonuses.reduce((sum, b) => sum + b.points, 0);
  
  // Apply bonuses
  score += breakdown.totalBonuses;
  
  // Clamp between 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // ============================================
  // DETERMINE LEVEL
  // ============================================
  
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

/**
 * Get improvement suggestions based on risk data
 * @param {Object} riskData - Risk score data
 * @returns {Array} Suggestions sorted by priority
 */
export function getImprovementSuggestions(riskData) {
  const suggestions = [];
  
  // Get deductions sorted by impact
  const sorted = [...riskData.breakdown.deductions].sort((a, b) => b.points - a.points);
  
  // Take top 5 most impactful issues
  sorted.slice(0, 5).forEach((item, index) => {
    suggestions.push({
      priority: index + 1,
      action: item.recommendation,
      impact: `+${item.points} points`,
      category: item.category
    });
  });
  
  return suggestions;
}

/**
 * Calculate potential score after improvements
 * @param {number} currentScore - Current score
 * @param {Array} improvements - List of improvements
 * @returns {number} Potential score
 */
export function calculatePotentialScore(currentScore, improvements) {
  let potentialScore = currentScore;
  
  improvements.forEach(improvement => {
    // Extract points from "+X points" string
    const points = parseInt(improvement.impact.replace('+', '').replace(' points', ''));
    potentialScore += points;
  });
  
  return Math.min(100, potentialScore);
}

/**
 * Get color for score (for charts/visualizations)
 * @param {number} score - Risk score (0-100)
 * @returns {string} Hex color
 */
export function getScoreColor(score) {
  if (score >= 90) return '#10b981'; // green
  if (score >= 75) return '#84cc16'; // lime
  if (score >= 60) return '#eab308'; // yellow
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
} //sarleyyy parleyy goodd 