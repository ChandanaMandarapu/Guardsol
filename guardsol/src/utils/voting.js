import { supabase } from './supabaseClient';
import bs58 from 'bs58';

//Vote on a report (Secure API
export async function voteOnReport(wallet, reportId, voteType) {
  try {
    if (!wallet || !wallet.publicKey || !wallet.signMessage) {
      throw new Error('Wallet not connected or does not support signing');
    }
    if (!reportId || !voteType) {
      throw new Error('Missing required fields');
    }

    const voterWallet = wallet.publicKey.toString();
    const message = `Vote on report: ${reportId} - ${voteType}`;
    const messageBytes = new TextEncoder().encode(message);

    // Request signature from user
    const signatureBytes = await wallet.signMessage(messageBytes);
    const signature = bs58.encode(signatureBytes);

    // Send to API
    const response = await fetch('/api/vote-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportId,
        voterWallet,
        signature,
        voteType
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to vote');
    }

    console.log('✅ Vote recorded!', data);
    return { success: true, weightedScore: data.weightedScore };

  } catch (error) {
    console.error('❌ Error voting:', error);
    throw error;
  }
}

//Get vote counts for a report
 
export async function getVoteCounts(reportId) {
  try {
    const { data, error } = await supabase
      .from('report_votes')
      .select('vote_type')
      .eq('report_id', reportId);

    if (error) throw error;

    const upvotes = data?.filter(v => v.vote_type === 'upvote').length || 0;
    const downvotes = data?.filter(v => v.vote_type === 'downvote').length || 0;

    return {
      upvotes,
      downvotes,
      total: upvotes + downvotes,
      score: upvotes - downvotes
    };
  } catch (error) {
    console.error('❌ Error getting vote counts:', error);
    return { upvotes: 0, downvotes: 0, total: 0, score: 0 };
  }
}


// Get user's vote on a report

export async function getUserVote(reportId, voterWallet) {
  try {
    if (!voterWallet) return null;

    const { data, error } = await supabase
      .from('report_votes')
      .select('vote_type')
      .eq('report_id', reportId)
      .eq('voter_wallet', voterWallet)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data?.vote_type || null;
  } catch (error) {
    console.error('❌ Error getting user vote:', error);
    return null;
  }
}

// remove vote
export async function removeVote(reportId, voterWallet) {
  try {
    const { error } = await supabase
      .from('report_votes')
      .delete()
      .eq('report_id', reportId)
      .eq('voter_wallet', voterWallet);

    if (error) throw error;

    console.log('✅ Vote removed');
    return { success: true };
  } catch (error) {
    console.error('❌ Error removing vote:', error);
    throw error;
  }
}