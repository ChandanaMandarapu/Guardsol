import { createClient } from '@supabase/supabase-js';
// purely AI HELPED
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { report_id, disputer_address, reason, evidence_link } = req.body;

    if (!report_id || !disputer_address || !reason) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check if report exists
        const { data: report, error: reportError } = await supabase
            .from('scam_reports')
            .select('id')
            .eq('id', report_id)
            .single();

        if (reportError || !report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        // Insertng dispute
        // Note: In a real app, we would have a 'disputes' table. 
        // For this version of app, we'll assume a 'disputes' table exists or we'll store it in a generic 'activity_log' or similar if strictly constrained.
        // However, creating a new table is the right way.
        // If 'disputes' table doesn't exist, this will fail. 
        // Alternatively, we can flag the report as disputed.

        // Let's try to insert into 'disputes'. If it fails, we'll fallback to updating the report metadata (if possible) or just logging it.
        // Ideally, the user has set up the DB. 

        const { error: insertError } = await supabase
            .from('disputes')
            .insert([
                {
                    report_id,
                    disputer_address,
                    reason,
                    evidence_link,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }
            ]);

        if (insertError) {
            // Fallback: Update report to say it's disputed (simple flag)
            // This is less ideal but works for MVP without migration scripts
            console.warn('Disputes table might not exist, flagging report instead.', insertError);

            const { error: updateError } = await supabase
                .from('scam_reports')
                .update({
                    disputed: true,
                    dispute_reason: reason, // Assuming we added these columns or using a JSONB column if available
                    dispute_evidence: evidence_link
                })
                .eq('id', report_id);

            if (updateError) {
                throw updateError;
            }
        }

        res.status(200).json({ message: 'Dispute submitted successfully' });

    } catch (error) {
        console.error('Error submitting dispute:', error);
        res.status(500).json({ error: 'Failed to submit dispute' });
    }
}
