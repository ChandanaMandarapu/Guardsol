import React, { useState } from 'react';
import VotingButton from './VotingButton';
import { approveReport, rejectReport, getReporterStats } from '../utils/admin';
import DisputeModal from './DisputeModal';
import { useWallet } from '@solana/wallet-adapter-react';

export default function ReportCard({ report, isAdmin, adminWallet, onUpdate }) {
  const [processing, setProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [reporterStats, setReporterStats] = useState(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const { connected } = useWallet();

  React.useEffect(() => {
    loadReporterStats();
  }, [report.reporter_wallet]);

  async function loadReporterStats() {
    const stats = await getReporterStats(report.reporter_wallet);
    setReporterStats(stats);
  }

  async function handleApprove() {
    if (!window.confirm('Approve this report?')) return;

    setProcessing(true);
    try {
      await approveReport(report.id, adminWallet);
      alert('✅ Report approved!');
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!window.confirm('Reject and delete this report?')) return;

    setProcessing(true);
    try {
      await rejectReport(report.id, adminWallet);
      alert('✅ Report rejected!');
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${report.verified ? 'border-green-200' : 'border-gray-200'
      }`}>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {report.verified ? (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                ✅ Verified
              </span>
            ) : (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-full">
                ⏳ Pending
              </span>
            )}
          </div>

          <h3 className="font-bold text-gray-900 mb-1">{report.reason}</h3>
          <p className="text-xs font-mono text-gray-600 break-all">
            {report.reported_address}
          </p>
        </div>

        {/* Voting and Dispute */}
        <div className="flex flex-col items-end gap-2">
          <VotingButton reportId={report.id} />

          {/* Dispute Button - Only for verified reports */}
          {report.verified && connected && (
            <button
              onClick={() => setShowDisputeModal(true)}
              className="text-xs text-gray-500 hover:text-red-600 underline"
            >
              Dispute this report
            </button>
          )}
        </div>
      </div>

      {/* Reporter Info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-500 mb-1">Reported by:</p>
        <p className="text-xs font-mono text-gray-700 break-all mb-2">
          {report.reporter_wallet || 'Anonymous'}
        </p>

        {reporterStats && (
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-gray-500">Reputation: </span>
              <span className="font-bold text-gray-900">
                {reporterStats.reputation_score}/100
              </span>
            </div>
            <div>
              <span className="text-gray-500">Reports: </span>
              <span className="font-bold text-gray-900">
                {reporterStats.total_reports}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Verified: </span>
              <span className="font-bold text-green-700">
                {reporterStats.verified_reports}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Evidence */}
      {report.evidence_url && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-700 mb-1">Evidence:</p>

          <a
            href={report.evidence_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline break-all"
          >
            {report.evidence_url}
          </a>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-gray-500 mb-4">
        Reported: {new Date(report.created_at).toLocaleString()}
      </p>

      {/* Admin Actions */}
      {isAdmin && !report.verified && (
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleApprove}
            disabled={processing}
            className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {processing ? 'Processing...' : '✅ Approve'}
          </button>

          <button
            onClick={handleReject}
            disabled={processing}
            className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {processing ? 'Processing...' : '❌ Reject'}
          </button>
        </div>
      )}

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        {showDetails ? '▼ Hide Details' : '▶ Show Details'}
      </button>

      {/* Details Section */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-mono text-gray-600 space-y-1">
            <p><strong>Report ID:</strong> {report.id}</p>
            <p><strong>Signature:</strong> {report.signature?.slice(0, 20)}...</p>
            <p><strong>Stake:</strong> {report.stake_amount} SOL</p>

            {report.verified_by && (
              <>
                <p><strong>Verified By:</strong> {report.verified_by}</p>
                <p><strong>Verified At:</strong> {new Date(report.verified_at).toLocaleString()}</p>
              </>
            )}
          </div>
        </div>
      )}

      <DisputeModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        reportId={report.id}
        reportedAddress={report.reported_address}
      />
    </div>
  );
}
