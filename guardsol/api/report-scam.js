// api/report-scam.js
// Vercel Serverless Function - Submit Scam Report

import { createClient } from '@supabase/supabase-js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export default async function handler(req, res) {
  // Only accept POST requests
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
      return res.status(400).json({ 
        error: 'Missing required fields: scamAddress, reporterWallet, signature, reason' 
      });
    }

    console.log('📝 New report submission:', {
      scamAddress: scamAddress.slice(0, 8),
      reporter: reporterWallet.slice(0, 8)
    });

    // 2. VERIFY WALLET SIGNATURE (CRITICAL FOR SECURITY)
    try {
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
        console.log('❌ Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
      
      console.log('✅ Signature verified');
    } catch (sigError) {
      console.error('❌ Signature verification failed:', sigError);
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // 3. CONNECT TO SUPABASE (Server-side with service key)
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // 4. CHECK RATE LIMIT (5 reports per day per wallet)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const { data: recentReports, error: rateLimitError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('wallet_address', reporterWallet)
      .eq('action_type', 'report_scam')
      .gte('timestamp', oneDayAgo.toISOString());

    if (rateLimitError) {
      console.error('❌ Rate limit check error:', rateLimitError);
    }

    if (recentReports && recentReports.length >= 5) {
      console.log('⚠️ Rate limit exceeded for:', reporterWallet.slice(0, 8));
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Maximum 5 reports per day.' 
      });
    }

    console.log('✅ Rate limit OK:', recentReports?.length || 0, '/ 5');

    // 5. GET OR CREATE USER REPUTATION
    let { data: userRep, error: repError } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('wallet_address', reporterWallet)
      .single();

    if (repError && repError.code !== 'PGRST116') {
      console.error('❌ Reputation fetch error:', repError);
    }

    if (!userRep) {
      // First time reporter - create reputation
      console.log('🆕 Creating new user reputation');
      const { data: newRep, error: createError } = await supabase
        .from('user_reputation')
        .insert({
          wallet_address: reporterWallet,
          reputation_score: 50,
          total_reports: 0,
          wallet_age_days: 0 // You can fetch actual age if needed
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Create reputation error:', createError);
        return res.status(500).json({ error: 'Failed to create user profile' });
      }

      userRep = newRep;
      console.log('✅ User reputation created');
    }

    // 6. CHECK IF ALREADY REPORTED BY THIS USER
    const { data: existingReport } = await supabase
      .from('scam_reports')
      .select('*')
      .eq('reported_address', scamAddress)
      .eq('reporter_wallet', reporterWallet)
      .single();

    if (existingReport) {
      console.log('⚠️ Already reported by this user');
      return res.status(409).json({ 
        error: 'You have already reported this address' 
      });
    }

    // 7. SUBMIT REPORT
    console.log('💾 Inserting report into database');
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

    if (reportError) {
      console.error('❌ Report insert error:', reportError);
      return res.status(500).json({ error: 'Failed to submit report' });
    }

    console.log('✅ Report inserted:', report.id);

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

    console.log('✅ Report submitted successfully');

    // 10. RETURN SUCCESS
    return res.status(200).json({
      success: true,
      reportId: report.id,
      message: 'Report submitted successfully',
      reputationScore: userRep.reputation_score
    });

  } catch (error) {
    console.error('❌ Report submission error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}