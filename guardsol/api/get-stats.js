import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Allow CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // 1. Get Total Reports Count
        const { count: totalReports, error: countError } = await supabase
            .from('scam_reports')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        // 2. Get Verified Reports Count
        const { count: verifiedReports, error: verifiedError } = await supabase
            .from('scam_reports')
            .select('*', { count: 'exact', head: true })
            .eq('verified', true);

        if (verifiedError) throw verifiedError;

        // 3. Get Recent Reports (Last 5)
        const { data: recentReports, error: recentError } = await supabase
            .from('scam_reports')
            .select('id, reported_address, scam_type, created_at, verified')
            .order('created_at', { ascending: false })
            .limit(5);

        if (recentError) throw recentError;

        // 4. Estimate Active Users (Unique reporters)
        // Note: This is an estimation as Supabase doesn't have a distinct count API easily without RPC
        // We will just count rows in user_reputation as a proxy for "Active Participants"
        const { count: activeUsers, error: usersError } = await supabase
            .from('user_reputation')
            .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        return res.status(200).json({
            stats: {
                totalReports: totalReports || 0,
                verifiedReports: verifiedReports || 0,
                activeUsers: activeUsers || 0,
                scamsPrevented: (verifiedReports || 0) * 12 // Fake "estimated" metric: 12 users saved per scam
            },
            recentReports: recentReports || []
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
