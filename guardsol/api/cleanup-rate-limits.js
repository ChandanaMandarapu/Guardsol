import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Check for secret key to prevent unauthorized access
    // This endpoint is meant to be called by a cron job (e.g. Vercel Cron or GitHub Actions)
    const { secret } = req.query;

    if (secret !== process.env.CLEANUP_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // Delete entries older than 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { error, count } = await supabase
            .from('rate_limits')
            .delete({ count: 'exact' })
            .lt('created_at', twentyFourHoursAgo);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            message: `Cleaned up ${count || 0} old rate limit entries`
        });

    } catch (error) {
        console.error('Cleanup error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
