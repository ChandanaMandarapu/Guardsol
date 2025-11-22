import { createClient } from '@supabase/supabase-js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { reportId, voterWallet, signature, voteType } = req.body;

        if (!reportId || !voterWallet || !signature || !voteType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // VERIFY SIGNATURE
        const message = `Vote on report: ${reportId} - ${voteType}`;
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = bs58.decode(voterWallet);

        const verified = nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKeyBytes
        );

        if (!verified) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // GET VOTER REPUTATION
        const { data: voter } = await supabase
            .from('user_reputation')
            .select('*')
            .eq('wallet_address', voterWallet)
            .single();

        if (!voter) {
            return res.status(400).json({
                error: 'Must have reputation to vote. Report a scam first!'
            });
        }

        // CHECK IF ALREADY VOTED
        const { data: existing } = await supabase
            .from('report_votes')
            .select('*')
            .eq('report_id', reportId)
            .eq('voter_wallet', voterWallet)
            .single();

        if (existing) {
            // Update existing vote
            await supabase
                .from('report_votes')
                .update({
                    vote_type: voteType,
                    voter_reputation: voter.reputation_score,
                    voted_at: new Date().toISOString()
                })
                .eq('id', existing.id);
        } else {
            // Insert new vote
            await supabase
                .from('report_votes')
                .insert({
                    report_id: reportId,
                    voter_wallet: voterWallet,
                    vote_type: voteType,
                    voter_reputation: voter.reputation_score
                });
        }

        // CALCULATE WEIGHTED SCORE (Quadratic Voting)
        const { data: allVotes } = await supabase
            .from('report_votes')
            .select('vote_type, voter_reputation')
            .eq('report_id', reportId);

        let weightedScore = 0;
        allVotes.forEach(vote => {
            // Square root of reputation = weight
            // 100 rep = 10 weight
            // 25 rep = 5 weight
            const weight = Math.sqrt(vote.voter_reputation || 0);
            weightedScore += vote.vote_type === 'confirm' ? weight : -weight;
        });

        // Auto-verify if consensus reached
        const CONSENSUS_THRESHOLD = 20; // Tunable

        if (weightedScore > CONSENSUS_THRESHOLD) {
            // Fetch report to check if already verified
            const { data: report } = await supabase
                .from('scam_reports')
                .select('verified')
                .eq('id', reportId)
                .single();

            if (report && !report.verified) {
                // Auto-verify based on community consensus
                await supabase
                    .from('scam_reports')
                    .update({
                        verified: true,
                        verified_by: 'community_consensus',
                        verified_at: new Date().toISOString()
                    })
                    .eq('id', reportId);

                console.log('✅ Auto-verified via consensus');
            }
        }

        return res.status(200).json({
            success: true,
            weightedScore,
            message: 'Vote recorded successfully'
        });

    } catch (error) {
        console.error('Vote error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
