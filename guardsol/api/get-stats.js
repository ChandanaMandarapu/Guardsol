import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // 1. Get Total Stats
        const { count: totalReports } = await supabase
            .from('scam_reports')
            .select('*', { count: 'exact', head: true });

        const { count: verifiedReports } = await supabase
            .from('scam_reports')
            .select('*', { count: 'exact', head: true })
            .eq('verified', true);

        const { count: activeUsers } = await supabase
            .from('user_reputation')
            .select('*', { count: 'exact', head: true });

        const { count: totalScans } = await supabase
            .from('risk_scores')
            .select('*', { count: 'exact', head: true });

        // 2. Get Recent Activity (Last 7 Days) for Chart
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentActivity } = await supabase
            .from('scam_reports')
            .select('created_at')
            .gte('created_at', sevenDaysAgo.toISOString());

        // Group by date
        const activityMap = {};
        // Initialize last 7 days with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString();
            activityMap[dateStr] = 0;
        }

        recentActivity.forEach(item => {
            const dateStr = new Date(item.created_at).toLocaleDateString();
            if (activityMap[dateStr] !== undefined) {
                activityMap[dateStr]++;
            }
        });

        const chartData = Object.keys(activityMap)
            .map(date => ({ date, count: activityMap[date] }))
            .reverse(); // Oldest first

        // 3. Get Top Scams Leaderboard
        // Since we don't have a dedicated 'report_count' on a 'scams' table, 
        // we'll aggregate from scam_reports. 
        // Note: In a production app with millions of rows, this aggregation should be a materialized view.
        const { data: topScamsRaw } = await supabase
            .from('scam_reports')
            .select('reported_address, scam_type, verified');

        const scamCounts = {};
        topScamsRaw.forEach(scam => {
            if (!scamCounts[scam.reported_address]) {
                scamCounts[scam.reported_address] = {
                    address: scam.reported_address,
                    type: scam.scam_type,
                    count: 0,
                    verified: scam.verified // crude approximation, takes last status
                };
            }
            scamCounts[scam.reported_address].count++;
            if (scam.verified) scamCounts[scam.reported_address].verified = true;
        });

        const topScams = Object.values(scamCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);


        res.status(200).json({
            stats: {
                totalReports: totalReports || 0,
                verifiedReports: verifiedReports || 0,
                activeUsers: activeUsers || 0,
                scamsPrevented: (verifiedReports || 0) * 12, // Estimate
                totalScans: totalScans || 0
            },
            chartData,
            topScams
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch network stats' });
    }
}
