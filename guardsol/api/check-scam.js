// api/check-scam.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: 'Address required' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Get all reports with votes
    const { data: reports, error } = await supabase
      .from('scam_reports')
      .select(`
        *,
        report_votes (
          vote_type
        )
      `)
      .eq('reported_address', address);

    if (error) throw error;

    if (!reports || reports.length === 0) {
      return res.status(200).json({
        isScam: false,
        reportCount: 0,
        confidence: 0
      });
    }

    // Calculate confidence
    let totalReports = reports.length;
    let verifiedReports = reports.filter(r => r.verified).length;

    let confidence = 0;
    if (verifiedReports > 0) confidence += 50; // Admin verified
    if (totalReports >= 10) confidence += 30; // Many reports
    if (totalReports >= 5 && totalReports < 10) confidence += 15;

    confidence = Math.min(100, Math.round(confidence));

    return res.status(200).json({
      isScam: confidence >= 50,
      reportCount: totalReports,
      verifiedCount: verifiedReports,
      confidence,
      reports: reports.map(r => {
        const upvotes = r.report_votes?.filter(v => v.vote_type === 'upvote').length || 0;
        const downvotes = r.report_votes?.filter(v => v.vote_type === 'downvote').length || 0;
        return {
          id: r.id,
          reason: r.reason,
          reportedAt: r.created_at,
          verified: r.verified,
          upvotes,
          downvotes
        };
      })
    });

  } catch (error) {
    console.error('Check scam error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}