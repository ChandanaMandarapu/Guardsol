import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { reportId } = req.body;

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // Get report outcome
        const { data: report } = await supabase
            .from('scam_reports')
            .select('verified')
            .eq('id', reportId)
            .single();

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Get all votes on this report
        const { data: votes } = await supabase
            .from('report_votes')
            .select('voter_wallet, vote_type')
            .eq('report_id', reportId);

        // Update reputation for each voter
        for (const vote of votes) {
            const correct = report.verified
                ? vote.vote_type === 'confirm'
                : vote.vote_type === 'dispute';

            const change = correct ? 2 : -1; // +2 for correct, -1 for wrong

            const { data: userRep } = await supabase
                .from('user_reputation')
                .select('reputation_score')
                .eq('wallet_address', vote.voter_wallet)
                .single();

            if (userRep) {
                const newScore = Math.max(0, Math.min(100, userRep.reputation_score + change));

                await supabase
                    .from('user_reputation')
                    .update({ reputation_score: newScore })
                    .eq('wallet_address', vote.voter_wallet);
            }
        }

        return res.json({ success: true });

    } catch (error) {
        console.error('Update reputation error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
