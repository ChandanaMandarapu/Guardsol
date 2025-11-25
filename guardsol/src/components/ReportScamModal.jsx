// Works for both connected wallet AND public viewing
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { submitScamReport, signMessageWithWallet } from '../utils/community-api';
import GlassCard from './UI/GlassCard';
import NeonButton from './UI/NeonButton';

export default function ReportScamModal({
  isOpen,
  onClose,
  scamAddress,
  tokenName,
  viewingAddress // Pass the address being viewed (connected OR public)
}) {
  const { wallet, publicKey, connected } = useWallet();

  const [reason, setReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Can submit if wallet is connected OR if we allow anonymous reporting
  // The user explicitly requested to allow reporting without connecting wallet
  const canSubmit = true;

  const reasonOptions = [
    'Phishing',
    'Fake Token',
    'Drainer',
    'Rug Pull',
    'Honeypot',
    'Impersonation',
    'Other'
  ];

  async function handleSubmit() {
    // Validate reason
    if (!reason) {
      alert('Please select a reason');
      return;
    }

    if (reason === 'Other' && !customReason.trim()) {
      alert('Please describe the issue');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log('🚨 Submitting report...');
      console.log('Scam address:', scamAddress);

      const finalReason = reason === 'Other' ? customReason : reason;
      let signature = 'Anonymous';
      let reporterWallet = 'Anonymous';

      // Try to sign if connected, otherwise proceed as anonymous
      if (connected && wallet && publicKey) {
        try {
          console.log('Reporter wallet:', publicKey.toString());
          reporterWallet = publicKey.toString();
          const message = `Report scam: ${scamAddress} - ${finalReason}`;
          console.log('✍️ Requesting signature...');
          signature = await signMessageWithWallet(message, wallet);
        } catch (signErr) {
          console.warn('Signing failed or rejected, proceeding as anonymous if allowed', signErr);
          // If user rejects signature, we could either fail or fall back to anonymous.
          // For now, let's fail if they are connected but reject.
          if (signErr.message?.includes('rejected')) {
            throw signErr;
          }
        }
      }

      console.log('📡 Submitting to database...');

      // Submit to Supabase
      const result = await submitScamReport({
        scamAddress,
        reporterWallet,
        signature,
        reason: finalReason,
        evidenceUrl: evidenceUrl || null
      });

      console.log('✅ Report submitted successfully!', result);

      setSuccess(true);

      // Close and refresh after 2 seconds
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 3000);

    } catch (err) {
      console.error('❌ Error submitting report:', err);

      // User-friendly error messages
      let errorMsg = err.message || 'Failed to submit report';

      if (err.message?.includes('rejected')) {
        errorMsg = 'Transaction rejected by user';
      } else if (err.message?.includes('already reported')) {
        errorMsg = 'You already reported this address';
      }

      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <GlassCard className="max-w-md w-full p-6 max-h-[90vh] overflow-y-auto border-neon-red/30 shadow-[0_0_30px_rgba(255,59,48,0.2)]">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="filter drop-shadow-[0_0_5px_rgba(255,59,48,0.5)]">🚨</span>
            Report Scam
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {success ? (
          // ✅ SUCCESS STATE
          <div className="text-center py-8">
            <div className="text-6xl mb-4 filter drop-shadow-[0_0_10px_rgba(0,255,175,0.5)]">✅</div>
            <h4 className="text-xl font-bold text-neon-green mb-2">
              Report Submitted!
            </h4>
            <p className="text-white mb-2">
              Your report has been submitted and is <strong>pending review</strong>.
            </p>
            <p className="text-sm text-text-secondary">
              Thank you for helping keep the community safe.
            </p>
            <p className="text-xs text-text-muted mt-4 animate-pulse">
              Refreshing page...
            </p>
          </div>
        ) : (
          <>
            {/* ⚠️ WALLET CONNECTION INFO */}
            {!connected && (
              <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">ℹ️</span>
                  <p className="font-bold text-neon-blue">Reporting Anonymously</p>
                </div>
                <p className="text-sm text-text-primary mb-2">
                  You are reporting this address without connecting a wallet.
                  Your report will be marked as <strong>Anonymous</strong>.
                </p>
                <p className="text-xs text-neon-blue bg-neon-blue/5 rounded p-2 mt-2 border border-neon-blue/20">
                  💡 Connecting your wallet helps build reputation and trust.
                </p>
              </div>
            )}

            {/* Token Info */}
            <div className="bg-dark-bg/50 border border-white/5 rounded-lg p-4 mb-4">
              <p className="text-sm text-text-muted mb-1">Reporting:</p>
              <p className="font-semibold text-white">{tokenName || 'Unknown Token'}</p>
              <p className="text-xs font-mono text-text-secondary mt-1 break-all">
                {scamAddress}
              </p>
            </div>

            {/* Reason Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white mb-2">
                Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 bg-dark-bg border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-red focus:border-neon-red text-white outline-none transition-all"
              >
                <option value="">Select reason...</option>
                {reasonOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Custom Reason (if "Other" selected) */}
            {reason === 'Other' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-2">
                  Please describe:
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Describe the scam..."
                  className="w-full px-4 py-2 bg-dark-bg border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-red focus:border-neon-red text-white outline-none transition-all placeholder-text-muted"
                  rows={3}
                />
              </div>
            )}

            {/* Evidence URL */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-white mb-2">
                Evidence URL (optional)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-2 bg-dark-bg border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-red focus:border-neon-red text-white outline-none transition-all placeholder-text-muted"
              />
              <p className="text-xs text-text-muted mt-1">
                Link to tweet, screenshot, etc.
              </p>
            </div>

            {/* Info Box (only if connected) */}
            {connected && (
              <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-neon-blue">
                  ℹ️ You'll be asked to sign a message to prove you own this wallet.
                  This prevents spam reports.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-neon-red/10 border border-neon-red/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-neon-red font-semibold">
                  ❌ {error}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <NeonButton
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </NeonButton>

              <NeonButton
                variant="danger"
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>🚨</span>
                    <span>Submit Report</span>
                  </>
                )}
              </NeonButton>
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}