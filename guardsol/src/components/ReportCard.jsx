import React, { useState } from 'react';
import VotingButton from './VotingButton';
import { approveReport, rejectReport, getReporterStats } from '../utils/admin';
import DisputeModal from './DisputeModal';
import { useWallet } from '@solana/wallet-adapter-react';
import GlassCard from './UI/GlassCard';
import NeonButton from './UI/NeonButton';

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
    <GlassCard className={`border ${report.verified ? 'border-neon-green/50 bg-neon-green/5' : 'border-neon-yellow/50 bg-neon-yellow/5'}`}>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {report.verified ? (
              <span className="px-3 py-1 bg-neon-green/20 text-neon-green text-sm font-bold rounded-full border border-neon-green/30">
                ✅ Verified
              </span>
            ) : (
              <span className="px-3 py-1 bg-neon-yellow/20 text-neon-yellow text-sm font-bold rounded-full border border-neon-yellow/30">
                ⏳ Pending
              </span>
            )}
          </div>

          <h3 className="font-bold text-white mb-1">{report.reason}</h3>
          <p className="text-xs font-mono text-text-secondary break-all">
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
              className="text-xs text-text-muted hover:text-neon-red underline transition-colors"
            >
              Dispute this report
            </button>
          )}
        </div>
      </div>

      {/* Reporter Info */}
      <div className="bg-dark-bg/50 rounded-lg p-3 mb-4 border border-white/5">
        <p className="text-xs text-text-muted mb-1">Reported by:</p>
        <p className="text-xs font-mono text-text-secondary break-all mb-2">
          {report.reporter_wallet || 'Anonymous'}
        </p>

        {reporterStats && (
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-text-muted">Reputation: </span>
              <span className="font-bold text-white">
                {reporterStats.reputation_score}/100
              </span>
            </div>
            <div>
              <span className="text-text-muted">Reports: </span>
              <span className="font-bold text-white">
                {reporterStats.total_reports}
              </span>
            </div>
            <div>
              <span className="text-text-muted">Verified: </span>
              <span className="font-bold text-neon-green">
                {reporterStats.verified_reports}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Evidence */}
      {report.evidence_url && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-white mb-1">Evidence:</p>

          <a
            href={report.evidence_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neon-blue hover:text-neon-blue/80 hover:underline break-all transition-colors"
          >
            {report.evidence_url}
          </a>
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-text-muted mb-4">
        Reported: {new Date(report.created_at).toLocaleString()}
      </p>

      {/* Admin Actions */}
      {isAdmin && !report.verified && (
        <div className="flex gap-3 mb-4">
          <NeonButton
            onClick={handleApprove}
            disabled={processing}
            variant="primary"
            className="flex-1 bg-neon-green/20 text-neon-green border-neon-green hover:bg-neon-green/30"
          >
            {processing ? 'Processing...' : '✅ Approve'}
          </NeonButton>

          <NeonButton
            onClick={handleReject}
            disabled={processing}
            variant="danger"
            className="flex-1"
          >
            {processing ? 'Processing...' : '❌ Reject'}
          </NeonButton>
        </div>
      )}

      {/* Details Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-text-muted hover:text-white transition-colors"
      >
        {showDetails ? '▼ Hide Details' : '▶ Show Details'}
      </button>

      {/* Details Section */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs font-mono text-text-secondary space-y-1">
            <p><strong className="text-white">Report ID:</strong> {report.id}</p>
            <p><strong className="text-white">Signature:</strong> {report.signature?.slice(0, 20)}...</p>
            <p><strong className="text-white">Stake:</strong> {report.stake_amount} SOL</p>

            {report.verified_by && (
              <>
                <p><strong className="text-white">Verified By:</strong> {report.verified_by}</p>
                <p><strong className="text-white">Verified At:</strong> {new Date(report.verified_at).toLocaleString()}</p>
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
    </GlassCard>
  );
}
