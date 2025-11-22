import React, { useState, useEffect } from 'react';
import CircularProgress from './CircularProgress';
import { fetchRiskScoreData, getRiskScoreHistory } from '../utils/riskScoreData';
import { getImprovementSuggestions, calculatePotentialScore } from '../utils/riskScore';
import ReportScamModal from './ReportScamModal';
import ExportButton from './ExportButton';
import ShareButton from './ShareButton';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RiskScoreDisplay({ walletAddress }) {
  const [riskData, setRiskData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      fetchRiskData();
    } else {
      setRiskData(null);
      setError(null);
    }
  }, [walletAddress]);

  async function fetchRiskData() {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchRiskScoreData(walletAddress);
      setRiskData(data);

      // Fetch history
      const history = await getRiskScoreHistory(walletAddress);
      // Format for chart
      const formattedHistory = history.map(h => ({
        date: new Date(h.calculated_at).toLocaleDateString(),
        score: h.score
      }));
      setHistoryData(formattedHistory);

    } catch (err) {
      console.error('Error fetching risk score:', err);
      setError('Failed to calculate risk score');
    } finally {
      setLoading(false);
    }
  }

  if (!walletAddress) return null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-lg text-gray-600">Calculating security score...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchRiskData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!riskData) return null;

  const suggestions = getImprovementSuggestions(riskData);
  const potentialScore = calculatePotentialScore(riskData.score, suggestions);

  // Calculate Milestones
  const milestones = [
    {
      id: 'safe_harbor',
      label: 'Safe Harbor',
      description: 'Risk Score > 80',
      icon: '🛡️',
      achieved: riskData.score >= 80
    },
    {
      id: 'first_step',
      label: 'First Step',
      description: 'First Scan Completed',
      icon: '🏁',
      achieved: true // If they are seeing this, they scanned
    },
    {
      id: 'clean_slate',
      label: 'Clean Slate',
      description: '0 Critical Risks',
      icon: '✨',
      achieved: riskData.breakdown.deductions.filter(d => d.severity === 'critical').length === 0
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg shadow-lg p-8 text-white">

        <div className="flex justify-between items-start mb-8">
          <h2 className="text-3xl font-bold">
            {riskData.levelEmoji} Wallet Security Score
          </h2>

          {/* Actions */}
          <div className="flex gap-3">
            <ShareButton score={riskData.score} />
            <ExportButton />
            <button
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-red-500 bg-opacity-20 hover:bg-opacity-30 border border-red-400 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
            >
              <span>🚨</span>
              <span className="hidden sm:inline">Report Wallet</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: Score Circle */}
          <div className="flex flex-col items-center justify-center">
            <CircularProgress score={riskData.score} size={200} strokeWidth={20} />

            <div className="mt-6 text-center">
              <p className="text-2xl font-bold">{riskData.levelLabel}</p>
              <p className="text-sm opacity-90 mt-1">
                {riskData.score >= 90 ? 'Your wallet is highly secure!' :
                  riskData.score >= 75 ? 'Your wallet is secure' :
                    riskData.score >= 60 ? 'Your wallet has some risks' :
                      riskData.score >= 40 ? 'Your wallet has several risks' :
                        'Your wallet has critical risks!'}
              </p>
            </div>
          </div>

          {/* Right: Breakdown */}
          <div className="space-y-4">

            {/* Deductions */}
            {riskData.breakdown.deductions.length > 0 && (
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">⚠️ Issues Found</h3>
                <div className="space-y-2">
                  {riskData.breakdown.deductions.map((item, index) => (
                    <div key={index} className="bg-white bg-opacity-10 rounded p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold">{item.category}</span>
                        <span className="text-red-300 font-bold">-{item.points}</span>
                      </div>
                      <p className="text-sm opacity-90">{item.description}</p>
                      {item.count && (
                        <p className="text-xs opacity-75 mt-1">Count: {item.count}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white border-opacity-30">
                  <div className="flex justify-between font-bold">
                    <span>Total Deducted:</span>
                    <span className="text-red-300">-{riskData.breakdown.totalDeducted}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bonuses */}
            {riskData.breakdown.bonuses.length > 0 && (
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">✨ Positive Factors</h3>
                <div className="space-y-2">
                  {riskData.breakdown.bonuses.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="text-sm">{item.description}</span>
                      </div>
                      <span className="text-green-300 font-bold">+{item.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No issues */}
            {riskData.breakdown.deductions.length === 0 && (
              <div className="bg-white bg-opacity-20 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="font-bold text-lg">Perfect Security!</p>
                <p className="text-sm opacity-90 mt-1">
                  No security issues detected in your wallet
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Improvement Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-8 bg-white bg-opacity-20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xl">💡 How to Improve</h3>
              <div className="text-sm">
                <span className="opacity-75">Potential score: </span>
                <span className="font-bold text-2xl">{potentialScore}</span>
              </div>
            </div>

            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-white text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      {suggestion.priority}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold mb-1">{suggestion.category}</p>
                      <p className="text-sm opacity-90">{suggestion.action}</p>
                    </div>
                    <div className="text-green-300 font-bold text-sm flex-shrink-0">
                      {suggestion.impact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk History Chart */}
        {historyData.length > 1 && (
          <div className="mt-8 bg-white bg-opacity-90 rounded-lg p-6 text-gray-800">
            <h3 className="font-bold text-xl mb-4 text-gray-900">📈 Security Score History</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ fill: '#4F46E5', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Milestones Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {milestones.map(milestone => (
            <div
              key={milestone.id}
              className={`p-4 rounded-lg border ${milestone.achieved
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`text-2xl ${milestone.achieved ? '' : 'grayscale'}`}>
                  {milestone.icon}
                </div>
                <div>
                  <h4 className={`font-bold ${milestone.achieved ? 'text-green-800' : 'text-gray-600'}`}>
                    {milestone.label}
                  </h4>
                  <p className="text-xs text-gray-500">{milestone.description}</p>
                </div>
                {milestone.achieved && (
                  <div className="ml-auto text-green-600">✓</div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Report Modal */}
      <ReportScamModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        scamAddress={walletAddress}
        tokenName="Wallet Address"
      />
    </div>
  );
}