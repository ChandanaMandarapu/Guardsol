// src/components/ReportScamModal.jsx
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { submitScamReport, signMessageWithWallet } from '../utils/community-api';

export default function ReportScamModal({ isOpen, onClose, scamAddress, tokenName }) {
  const { wallet, publicKey } = useWallet();
  
  const [reason, setReason] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    // Validate
    if (!reason) {
      alert('Please select a reason');
      return;
    }

    if (reason === 'Other' && !customReason.trim()) {
      alert('Please describe the issue');
      return;
    }

    if (!wallet || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log('🚨 Submitting report for:', scamAddress);

      const finalReason = reason === 'Other' ? customReason : reason;
      const message = `Report scam: ${scamAddress} - ${finalReason}`;

      console.log('✍️ Requesting signature...');

      // Sign message
      const signature = await signMessageWithWallet(message, wallet);

      console.log('📡 Submitting to database...');

      // Submit directly to Supabase
      const result = await submitScamReport({
        scamAddress,
        reporterWallet: publicKey.toString(),
        signature,
        reason: finalReason,
        evidenceUrl: evidenceUrl || null
      });

      console.log('✅ Report submitted!', result);

      setSuccess(true);
      
      // Close after 2 seconds and refresh
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error('❌ Error submitting report:', err);
      setError(err.message || 'Failed to submit report');
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
          // Success message
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h4 className="text-xl font-bold text-green-900 mb-2">
              Report Submitted!
            </h4>
            <p className="text-green-700">
              Thank you for protecting the community
            </p>
          </div>
        ) : (
          <>
            {/* Token Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500 mb-1">Reporting:</p>
              <p className="font-semibold text-gray-900">{tokenName || 'Unknown Token'}</p>
              <p className="text-xs font-mono text-gray-600 mt-1 break-all">
                {scamAddress}
              </p>
            </div>

            {/* Reason */}
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

            {/* Custom reason */}
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

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-900">
                ℹ️ You'll be asked to sign a message to prove you own this wallet.
                This prevents spam reports.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  ❌ {error}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !reason}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
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