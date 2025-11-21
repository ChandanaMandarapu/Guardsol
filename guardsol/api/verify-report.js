import { createClient } from '@supabase/supabase-js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reportId, adminWallet, signature, verdict } = req.body;

    // Verify admin signature
    const message = `Verify report: ${reportId} - ${verdict}`;
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(adminWallet);
    
    const verified = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
    
    if (!verified || adminWallet !== process.env.ADMIN_WALLET_ADDRESS) {
      return res.status(403).json({ error: 'Unauthorized - Not admin' });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Update report
    const { data, error } = await supabase
      .from('scam_reports')
      .update({
        verified: verdict === 'approve',
        verified_by: adminWallet,
        verified_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;

    // Update reporter reputation
    const repChange = verdict === 'approve' ? 5 : -10;
    const { data: userRep } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('wallet_address', data.reporter_wallet)
      .single();

    if (userRep) {
      await supabase
        .from('user_reputation')
        .update({
          reputation_score: Math.max(0, Math.min(100, userRep.reputation_score + repChange)),
          verified_reports: verdict === 'approve' ? userRep.verified_reports + 1 : userRep.verified_reports,
          false_reports: verdict === 'reject' ? userRep.false_reports + 1 : userRep.false_reports
        })
        .eq('wallet_address', data.reporter_wallet);
    }

    return res.status(200).json({
      success: true,
      verdict
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}