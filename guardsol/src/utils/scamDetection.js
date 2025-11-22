import { checkIfScam, checkCommunityReports } from './supabase';

// Multi-factor scam detection algorithm
export async function calculateScamScore(token) {
  let score = 0;
  const reasons = [];
  
  console.log('🔍 Scoring:', token.metadata?.name || token.mint.slice(0, 8));

  // --- CHECK OLD DATABASE ---
  const dbCheck = await checkIfScam(token.mint);
  if (dbCheck.isScam && dbCheck.source === "database") {
    console.log('🚨 In scam database!');
    return {
      score: 100,
      reasons: [`In scam database: ${dbCheck.reason}`],
      confidence: 'confirmed'
    };
  }

  // --- CHECK COMMUNITY REPORTS ---
  const community = await checkCommunityReports(token.mint);

  if (community.reportCount > 0) {
    score += community.confidence; // add confidence directly
    reasons.push(`🚨 Reported by ${community.reportCount} users (${community.confidence}% confidence)`);

    // If highly reported, force scam
    if (community.confidence >= 50) {
      return {
        score: 100,
        reasons,
        confidence: 'community_confirmed'
      };
    }
  }

  const metadata = token.metadata;
  if (!metadata) {
    return { score: 0, reasons, confidence: 'unknown' };
  }

  // Mint authority active (+40 points)
  if (metadata.mintAuthority && metadata.mintAuthority !== 'null') {
    score += 40;
    reasons.push('⚠️ Mint authority active (can create more tokens)');
  }

  // Freeze authority exists (+30 points)
  if (metadata.freezeAuthority && metadata.freezeAuthority !== 'null') {
    score += 30;
    reasons.push('⚠️ Freeze authority exists (can freeze tokens)');
  }

  // Suspicious keywords (+20 points)
  const suspiciousWords = [
    'CLAIM', 'FREE', 'AIRDROP', 'BONUS', 'REWARD', 'GIFT',
    'WIN', 'PRIZE', 'GIVEAWAY', '🎁', '💰', '$$$'
  ];

  const nameUpper = (metadata.name || '').toUpperCase();
  const hasSuspicious = suspiciousWords.some(word => nameUpper.includes(word));

  if (hasSuspicious) {
    score += 20;
    reasons.push('⚠️ Suspicious name pattern');
  }

  // Very low holders (+10 points)
  if (metadata.holderCount > 0 && metadata.holderCount < 10) {
    score += 10;
    reasons.push('⚠️ Very few holders (< 10)');
  }

  console.log('✅ Final Score:', score);

  return {
    score,
    reasons,
    confidence: score >= 61 ? 'likely_scam' : score >= 31 ? 'suspicious' : 'safe'
  };
}

// Get color for score
export function getScamScoreColor(score) {
  if (score >= 61) return 'red';
  if (score >= 31) return 'yellow';
  return 'green';
}

// Get badge text
export function getScamScoreBadge(score) {
  if (score >= 61) return { text: 'Likely Scam', emoji: '🔴' };
  if (score >= 31) return { text: 'Suspicious', emoji: '🟡' };
  return { text: 'Safe', emoji: '🟢' };
}
