
import { supabase } from '../utils/supabaseClient';


export async function submitVote(tokenAddress, walletAddress, voteType, reason) {
    try {
        // FEATURE: Reputation Weightin
        const userReputation = await getUserReputation(walletAddress);

        const { data, error } = await supabase
            .from('ntg_votes')
            .insert([
                {
                    token_address: tokenAddress,
                    voter_wallet: walletAddress,
                    vote_type: voteType,
                    reason: reason,
                    vote_weight: userReputation // Weight depends on user history
                }
            ]);

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('Vote submission error:', err);
        return { success: false, error: err.message };
    }
}

async function getUserReputation(walletAddress) {
    
    // This prevents Sybil attacks (scammers making new wallets to upvote themselves).
    try {
        const { count, error } = await supabase
            .from('ntg_votes')
            .select('*', { count: 'exact', head: true })
            .eq('voter_wallet', walletAddress);

        if (error || !count) return 1; // Base weight
        return Math.min(1 + Math.floor(count / 5), 10); // +1 weight every 5 votes, max 10.
    } catch (e) {
        return 1;
    }
}

/**
 * Get votes with AGGREGATED WEIGHT
 */
export async function getTokenVotes(tokenAddress) {
    try {
        const { data, error } = await supabase
            .from('ntg_votes')
            .select('*')
            .eq('token_address', tokenAddress);

        if (error) throw error;

        const flags = data
            .filter(v => v.vote_type === 'flag_bad')
            .reduce((sum, v) => sum + (v.vote_weight || 1), 0);

        const verifications = data
            .filter(v => v.vote_type === 'verify_safe')
            .reduce((sum, v) => sum + (v.vote_weight || 1), 0);

        return {
            flags,
            verifications,
            recentVotes: data.slice(0, 5)
        };
    } catch (err) {
        console.warn('Could not fetch votes:', err);
        return { flags: 0, verifications: 0, recentVotes: [] };
    }
}
