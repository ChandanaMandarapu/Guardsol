// api/check-scam.js
// Vercel Serverless Function - Check if address has been reported

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // ✅ ADD CORS HEADERS FIRST - THIS FIXES YOUR ERROR!
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { address } = req.query;

    // Validate input
    if (!address) {
      return res.status(400).json({ error: 'Address parameter required' });
    }

    console.log('🔍 Checking reports for:', address.slice(0, 8));

    // Connect to Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Get all reports for this address with votes
    const { data: reports, error } = await supabase
      .from('scam_reports')
      .select(`
        *,
        report_votes(vote_type, voter_reputation)
      `)
      .eq('reported_address', address);

    if (error) {
      console.error('❌ Query error:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }

    // If no reports found
    if (!reports || reports.length === 0) {
      console.log('✅ No reports found');
      return res.status(200).json({
        isScam: false,
        reportCount: 0,
        confidence: 0,
        reports: []
      });
    }

    console.log('📊 Found', reports.length, 'reports');

    // Calculate confidence score
    let totalReports = reports.length;
    let verifiedReports = reports.filter(r => r.verified).length;
    let totalVotes = 0;
    let confirmVotes = 0;

    reports.forEach(report => {
      if (report.report_votes) {
        totalVotes += report.report_votes.length;
        confirmVotes += report.report_votes.filter(
          v => v.vote_type === 'confirm'
        ).length;
      }
    });

    // CONFIDENCE CALCULATION
    let confidence = 0;
    
    // Admin verified = high confidence
    if (verifiedReports > 0) {
      confidence += 50;
    }
    
    // Many reports = higher confidence
    if (totalReports >= 10) {
      confidence += 30;
    } else if (totalReports >= 5) {
      confidence += 20;
    } else if (totalReports >= 3) {
      confidence += 10;
    }
    
    // Community voting agreement
    if (totalVotes > 0) {
      const voteRatio = confirmVotes / totalVotes;
      confidence += voteRatio * 20;
    }

    // Cap at 100
    confidence = Math.min(100, Math.round(confidence));

    console.log('✅ Confidence calculated:', confidence);

    return res.status(200).json({
      isScam: confidence >= 50,
      reportCount: totalReports,
      verifiedCount: verifiedReports,
      confidence,
      reports: reports.map(r => ({
        id: r.id,
        reason: r.reason,
        reportedAt: r.created_at,
        verified: r.verified,
        evidenceUrl: r.evidence_url
      }))
    });

  } catch (error) {
    console.error('❌ Check scam error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}