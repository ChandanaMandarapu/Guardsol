// api/report-scam.js
import { createClient } from '@supabase/supabase-js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      scamAddress, 
      reporterWallet, 
      signature, 
      reason, 
      evidenceUrl 
    } = req.body;

    // 1. VALIDATE INPUT
    if (!scamAddress || !reporterWallet || !signature || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 2. VERIFY WALLET SIGNATURE (CRITICAL!)
    const message = `Report scam: ${scamAddress} - ${reason}`;
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(reporterWallet);
    
    const verified = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
    
    if (!verified) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // 3. CONNECT TO SUPABASE (server-side)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 4. CHECK RATE LIMIT (5 reports per day)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: recentReports } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('wallet_address', reporterWallet)
      .eq('action_type', 'report_scam')
      .gte('timestamp', oneDayAgo.toISOString());

    if (recentReports && recentReports.length >= 5) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Max 5 reports per day.' 
      });
    }

    // 5. GET OR CREATE USER REPUTATION
    let { data: userRep } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('wallet_address', reporterWallet)
      .single();

    if (!userRep) {
      // First time reporter
      const { data: newRep } = await supabase
        .from('user_reputation')
        .insert({
          wallet_address: reporterWallet,
          reputation_score: 50,
          total_reports: 0,
          wallet_age_days: 30 // You can fetch real age later
        })
        .select()
        .single();
      userRep = newRep;
    }

    // 6. CHECK IF ALREADY REPORTED
    const { data: existingReport } = await supabase
      .from('scam_reports')
      .select('*')
      .eq('reported_address', scamAddress)
      .eq('reporter_wallet', reporterWallet)
      .single();

    if (existingReport) {
      return res.status(409).json({ 
        error: 'You already reported this address' 
      });
    }

    // 7. SUBMIT REPORT
    const { data: report, error: reportError } = await supabase
      .from('scam_reports')
      .insert({
        reported_address: scamAddress,
        reporter_wallet: reporterWallet,
        signature,
        reason,
        evidence_url: evidenceUrl || null,
        stake_amount: 0.01
      })
      .select()
      .single();

    if (reportError) throw reportError;

    // 8. UPDATE RATE LIMIT
    await supabase.from('rate_limits').insert({
      wallet_address: reporterWallet,
      action_type: 'report_scam',
      timestamp: new Date().toISOString()
    });

    // 9. UPDATE USER REPUTATION
    await supabase
      .from('user_reputation')
      .update({ 
        total_reports: userRep.total_reports + 1,
        last_active: new Date().toISOString()
      })
      .eq('wallet_address', reporterWallet);

    // 10. SUCCESS!
    return res.status(200).json({
      success: true,
      reportId: report.id,
      message: 'Report submitted successfully',
      reputationScore: userRep.reputation_score
    });

  } catch (error) {
    console.error('Report submission error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}