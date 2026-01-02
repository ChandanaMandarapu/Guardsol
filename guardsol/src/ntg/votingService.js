import { supabase } from '../utils/supabaseClient';

/**
 * Submit a community vote for a token
 */
export async function submitVote(tokenAddress, walletAddress, voteType, reason) {
    try {
        const { data, error } = await supabase
            .from('ntg_votes')
            .insert([
                {
                    token_address: tokenAddress,
                    voter_wallet: walletAddress,
                    vote_type: voteType,
                    reason: reason,
                    vote_weight: 1
                }
            ]);

        if (error) throw error;
        return { success: true, data };
    } catch (err) {
        console.error('Vote submission error:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Get votes for a token to display community sentiment
 */
export async function getTokenVotes(tokenAddress) {
    try {
        const { data, error } = await supabase
            .from('ntg_votes')
            .select('*')
            .eq('token_address', tokenAddress);

        if (error) throw error;

        // Simple aggregation
        const flags = data.filter(v => v.vote_type === 'flag_bad').length;
        const verifications = data.filter(v => v.vote_type === 'verify_safe').length;

        return {
            flags,
            verifications,
            recentVotes: data.slice(0, 5) // Show last 5
        };
    } catch (err) {
        // If table doesn't exist yet, return 0s gracefully so UI doesn't crash......
        console.warn('Could not fetch votes (Table might not exist yet):', err);
        return { flags: 0, verifications: 0, recentVotes: [] };
    }
}
