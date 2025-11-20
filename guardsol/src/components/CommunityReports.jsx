// src/components/CommunityReports.jsx
import React, { useState, useEffect } from 'react';
import { getCommunityReports } from '../utils/community-api';

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
  let badgeColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  let icon = '⚠️';
  let label = 'Community reports';

  if (reports.confidence >= 70 || reports.verifiedCount > 0) {
    badgeColor = 'bg-red-100 text-red-800 border-red-200';
    icon = '🚨';
    label = 'Confirmed scam';
  } else if (reports.confidence >= 50 || reports.reportCount >= 5) {
    badgeColor = 'bg-orange-100 text-orange-800 border-orange-200';
    icon = '⚠️';
    label = 'Likely scam';
  }

  return (
    <div className={`${badgeColor} border rounded-lg p-3 mb-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="text-sm font-semibold">{label}</p>
      </div>

      <p className="text-xs mb-2">
        {reports.reportCount} user{reports.reportCount !== 1 ? 's' : ''} reported this
      </p>

      {reports.verifiedCount > 0 && (
        <p className="text-xs font-semibold mb-2">
          ✅ {reports.verifiedCount} verified by moderators
        </p>
      )}

      {/* Confidence bar */}
      {reports.confidence > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Confidence:</span>
            <span className="font-bold">{reports.confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                reports.confidence >= 70
                  ? 'bg-red-600'
                  : reports.confidence >= 50
                  ? 'bg-orange-500'
                  : 'bg-yellow-500'
              }`}
              style={{ width: `${reports.confidence}%` }}
            />
          </div>
        </div>
      )}

      {/* Show recent reasons */}
      {reports.reports && reports.reports.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs font-semibold cursor-pointer hover:text-gray-900">
            View reasons ({reports.reports.length})
          </summary>
          <div className="mt-2 space-y-2">
            {reports.reports.slice(0, 3).map((report, idx) => (
              <div key={idx} className="bg-white bg-opacity-50 rounded p-2">
                <p className="text-xs">
                  <span className="font-semibold">{report.reason}</span>
                  {report.verified && <span className="ml-1 text-green-600">✅</span>}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(report.reportedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
