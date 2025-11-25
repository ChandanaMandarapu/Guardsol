import React, { useState, useEffect } from 'react';
import { getCommunityReports } from '../utils/community-api';
import VotingButton from './VotingButton';

export default function CommunityReports({ address }) {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    async function fetchReports() {
      try {
        const data = await getCommunityReports(address);
        setReports(data);
      } catch (err) {
        console.error("Error fetching community reports", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [address]);

  if (loading) return null;
  if (!reports || reports.reportCount === 0) return null;

  // Determine badge style based on severity
  let badgeColor = 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30';
  let icon = '⚠️';
  let label = 'Community reports';
  let barColor = 'bg-neon-yellow';

  if (reports.confidence >= 70 || reports.verifiedCount > 0) {
    badgeColor = 'bg-neon-red/10 text-neon-red border-neon-red/30';
    icon = '🚨';
    label = 'Confirmed scam';
    barColor = 'bg-neon-red';
  } else if (reports.confidence >= 50 || reports.reportCount >= 5) {
    badgeColor = 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30';
    icon = '⚠️';
    label = 'Likely scam';
    barColor = 'bg-neon-yellow';
  }

  return (
    <div className={`${badgeColor} border rounded-lg p-3 mb-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{icon}</span>
        <p className="text-sm font-semibold">{label}</p>
      </div>

      <p className="text-xs mb-2 opacity-90">
        {reports.reportCount} user{reports.reportCount !== 1 ? 's' : ''} reported this
      </p>

      {reports.verifiedCount > 0 && (
        <p className="text-xs font-semibold mb-2 text-neon-green">
          ✅ {reports.verifiedCount} verified by moderators
        </p>
      )}

      {/* Confidence bar */}
      {reports.confidence > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="opacity-80">Confidence:</span>
            <span className="font-bold">{reports.confidence}%</span>
          </div>
          <div className="w-full bg-dark-bg/50 rounded-full h-2 border border-white/5">
            <div
              className={`h-2 rounded-full transition-all ${barColor} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
              style={{ width: `${reports.confidence}%` }}
            />
          </div>
        </div>
      )}

      {/* Show recent reasons */}
      {reports.reports && reports.reports.length > 0 && (
        <details className="mt-3 group">
          <summary className="text-xs font-semibold cursor-pointer hover:text-white transition-colors list-none flex items-center gap-1">
            <span className="group-open:rotate-90 transition-transform">▶</span> View reasons ({reports.reports.length})
          </summary>
          <div className="mt-2 space-y-2">
            {reports.reports.slice(0, 3).map((report, idx) => (
              <div key={idx} className="bg-dark-bg/50 border border-white/5 rounded p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-text-primary">
                      <span className="font-semibold text-white">{report.reason}</span>
                      {report.verified && <span className="ml-1 text-neon-green">✅</span>}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(report.reportedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <VotingButton reportId={report.id} />
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
