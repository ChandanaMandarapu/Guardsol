import { supabase } from './supabaseClient';

/**
 * Fetch user reputation from Supabase
 * @param {string} walletAddress 
 * @returns {Promise<number>} Reputation score (default 0)
 */
export async function getUserReputation(walletAddress) {
    if (!walletAddress) return 0;

    try {
        const { data, error } = await supabase
            .from('user_reputation')
            .select('reputation_score')
            .eq('wallet_address', walletAddress)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore "not found" error
            console.error('Error fetching reputation:', error);
        }

        return data?.reputation_score || 0;
    } catch (err) {
        console.error('Reputation fetch error:', err);
        return 0;
    }
}

/**
 * Get badge details based on reputation score
 * @param {number} score 
 * @returns {Object} { label, color, icon }
 */
export function getReputationBadge(score) {
    if (score >= 100) {
        return { label: 'Legend', color: 'bg-yellow-500', icon: '👑' };
    } else if (score >= 50) {
        return { label: 'Guardian', color: 'bg-purple-600', icon: '🛡️' };
    } else if (score >= 20) {
        return { label: 'Scout', color: 'bg-blue-500', icon: '🔭' };
    } else {
        return { label: 'Rookie', color: 'bg-gray-500', icon: '👶' };
    }
}
