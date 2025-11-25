import React, { useState, useEffect } from 'react';
import CircularProgress from './CircularProgress';
import { fetchRiskScoreData, getRiskScoreHistory } from '../utils/riskScoreData';
import { getImprovementSuggestions, calculatePotentialScore } from '../utils/riskScore';
import ReportScamModal from './ReportScamModal';
import ExportButton from './ExportButton';
import ShareButton from './ShareButton';
import CommunityReports from './CommunityReports';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from './UI/GlassCard';
import NeonButton from './UI/NeonButton';

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
        <GlassCard className="flex items-center justify-center gap-3 min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
          <p className="text-lg text-neon-blue animate-pulse">Scanning blockchain data...</p>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <GlassCard className="border-neon-red/50 bg-neon-red/5">
          <p className="text-neon-red text-center text-lg mb-4">{error}</p>
          <div className="flex justify-center">
            <NeonButton variant="danger" onClick={fetchRiskData}>
              Try Again
            </NeonButton>
          </div>
        </GlassCard>
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
      <GlassCard className="relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[100px] -z-10" />

        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{riskData.levelEmoji}</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Wallet Security Score
              </span>
            </h2>
            <p className="text-text-secondary mt-1 font-mono text-sm">
              {walletAddress}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <ShareButton score={riskData.score} />
            <ExportButton />
            <NeonButton
              variant="danger"
              onClick={() => setShowReportModal(true)}
              className="!py-2 !px-4 !text-sm"
            >
              <span>🚨</span>
              <span className="hidden sm:inline">Report Wallet</span>
            </NeonButton>
          </div>
        </div>

        {/* Community Reports Section */}
        <CommunityReports address={walletAddress} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

          {/* Left: Score Circle */}
          <div className="flex flex-col items-center justify-center p-8 bg-dark-card/30 rounded-2xl border border-white/5">
            <div className="relative">
              <div className="absolute inset-0 bg-neon-blue/20 blur-[40px] rounded-full" />
              <CircularProgress score={riskData.score} size={220} strokeWidth={20} />
            </div>

            <div className="mt-8 text-center">
              <p className="text-3xl font-bold text-white tracking-tight">{riskData.levelLabel}</p>
              <p className={`text-sm mt-2 font-medium px-4 py-1 rounded-full inline-block
                ${riskData.score >= 90 ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' :
                  riskData.score >= 75 ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20' :
                    riskData.score >= 60 ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20' :
                      'bg-neon-red/10 text-neon-red border border-neon-red/20'
                }`}>
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
              <div className="bg-dark-card/40 rounded-xl p-5 border border-white/5">
                <h3 className="font-bold text-lg mb-4 text-neon-red flex items-center gap-2">
                  ⚠️ Issues Found
                </h3>
                <div className="space-y-3">
                  {riskData.breakdown.deductions.map((item, index) => (
                    <div key={index} className="bg-dark-bg/50 rounded-lg p-3 border border-white/5 hover:border-neon-red/30 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-white">{item.category}</span>
                        <span className="text-neon-red font-bold font-mono">-{item.points}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{item.description}</p>
                      {item.count && (
                        <p className="text-xs text-text-muted mt-1 font-mono">Count: {item.count}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex justify-between font-bold">
                    <span className="text-text-primary">Total Deducted:</span>
                    <span className="text-neon-red font-mono">-{riskData.breakdown.totalDeducted}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bonuses */}
            {riskData.breakdown.bonuses.length > 0 && (
              <div className="bg-dark-card/40 rounded-xl p-5 border border-white/5">
                <h3 className="font-bold text-lg mb-4 text-neon-green flex items-center gap-2">
                  ✨ Positive Factors
                </h3>
                <div className="space-y-3">
                  {riskData.breakdown.bonuses.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-dark-bg/50 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm text-text-primary">{item.description}</span>
                      </div>
                      <span className="text-neon-green font-bold font-mono">+{item.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No issues */}
            {riskData.breakdown.deductions.length === 0 && (
              <div className="bg-neon-green/10 rounded-xl p-8 text-center border border-neon-green/20">
                <div className="text-5xl mb-4 filter drop-shadow-[0_0_10px_rgba(0,255,175,0.5)]">🎉</div>
                <p className="font-bold text-xl text-white">Perfect Security!</p>
                <p className="text-neon-green mt-2">
                  No security issues detected in your wallet
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Improvement Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-8 bg-dark-card/40 rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-xl text-white flex items-center gap-2">
                💡 How to Improve
              </h3>
              <div className="text-sm bg-dark-bg/50 px-4 py-2 rounded-lg border border-white/10">
                <span className="text-text-secondary">Potential score: </span>
                <span className="font-bold text-2xl text-neon-blue font-mono ml-2">{potentialScore}</span>
              </div>
            </div>

            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-dark-bg/50 rounded-lg p-4 border border-white/5 hover:border-neon-blue/30 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="bg-neon-blue/10 text-neon-blue rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0 border border-neon-blue/20 group-hover:bg-neon-blue group-hover:text-black transition-colors">
                      {suggestion.priority}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold mb-1 text-white">{suggestion.category}</p>
                      <p className="text-sm text-text-secondary">{suggestion.action}</p>
                    </div>
                    <div className="text-neon-green font-bold text-sm flex-shrink-0 font-mono bg-neon-green/10 px-2 py-1 rounded">
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
          <div className="mt-8 bg-dark-card/40 rounded-xl p-6 border border-white/5">
            <h3 className="font-bold text-xl mb-6 text-white">📈 Security Score History</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <XAxis
                    dataKey="date"
                    stroke="#5A6273"
                    fontSize={12}
                    tick={{ fill: '#98A1B3' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#5A6273"
                    fontSize={12}
                    tick={{ fill: '#98A1B3' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D111C',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#00F6FF' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#00F6FF"
                    strokeWidth={3}
                    dot={{ fill: '#05070D', stroke: '#00F6FF', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#00F6FF', stroke: '#fff' }}
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
              className={`p-5 rounded-xl border transition-all duration-300 ${milestone.achieved
                ? 'bg-neon-green/5 border-neon-green/30 shadow-[0_0_15px_rgba(0,255,175,0.05)]'
                : 'bg-dark-card/30 border-white/5 opacity-50 grayscale'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`text-3xl ${milestone.achieved ? 'filter drop-shadow-[0_0_5px_rgba(0,255,175,0.5)]' : ''}`}>
                  {milestone.icon}
                </div>
                <div>
                  <h4 className={`font-bold ${milestone.achieved ? 'text-neon-green' : 'text-text-muted'}`}>
                    {milestone.label}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">{milestone.description}</p>
                </div>
                {milestone.achieved && (
                  <div className="ml-auto text-neon-green text-xl font-bold">✓</div>
                )}
              </div>
            </div>
          ))}
        </div>

      </GlassCard>

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