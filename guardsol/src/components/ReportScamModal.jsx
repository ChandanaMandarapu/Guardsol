// Works for both connected wallet AND public viewing
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { submitScamReport, signMessageWithWallet } from '../utils/community-api';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">🚨 Report Scam</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {success ? (
          // ✅ SUCCESS STATE
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h4 className="text-xl font-bold text-green-900 mb-2">
              Report Submitted!
            </h4>
            <p className="text-green-700 mb-2">
              Your report has been submitted and is <strong>pending review</strong>.
            </p>
            <p className="text-sm text-gray-600">
              Thank you for helping keep the community safe.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Refreshing page...
            </p>
          </div>
        ) : (
          <>
            {/* ⚠️ WALLET CONNECTION INFO */}
            {!connected && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">ℹ️</span>
                  <p className="font-bold text-blue-900">Reporting Anonymously</p>
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  You are reporting this address without connecting a wallet.
                  Your report will be marked as <strong>Anonymous</strong>.
                </p>
                <p className="text-xs text-blue-700 bg-blue-100 rounded p-2 mt-2">
                  💡 Connecting your wallet helps build reputation and trust.
                </p>
              </div>
            )}

            {/* Token Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500 mb-1">Reporting:</p>
              <p className="font-semibold text-gray-900">{tokenName || 'Unknown Token'}</p>
              <p className="text-xs font-mono text-gray-600 mt-1 break-all">
                {scamAddress}
              </p>
            </div>

            {/* Reason Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Please describe:
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Describe the scam..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  rows={3}
                />
              </div>
            )}

            {/* Evidence URL */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Evidence URL (optional)
              </label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                Link to tweet, screenshot, etc.
              </p>
            </div>

            {/* Info Box (only if connected) */}
            {connected && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-900">
                  ℹ️ You'll be asked to sign a message to prove you own this wallet.
                  This prevents spam reports.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 font-semibold">
                  ❌ {error}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
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
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}