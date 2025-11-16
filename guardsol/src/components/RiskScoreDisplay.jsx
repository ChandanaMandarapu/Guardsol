import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchRiskScoreData } from '../utils/riskScoreData';
import { getImprovementSuggestions, calculatePotentialScore } from '../utils/riskScore';
import CircularProgress from './CircularProgress';

// MAIN RISK SCORE DISPLAY COMPONENT

export default function RiskScoreDisplay() {
  const { publicKey, connected } = useWallet();
  
  const [riskScore, setRiskScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (connected && publicKey) {
      fetchScore();
    } else {
      setRiskScore(null);
      setError(null);
    }
  }, [connected, publicKey]);

  async function fetchScore() {
    setLoading(true);
    setError(null);
    console.log('🎯 Fetching risk score...');
    
    try {
      const address = publicKey.toString();
      const score = await fetchRiskScoreData(address);
      
      setRiskScore(score);
      console.log('✅ Risk score loaded:', score.score);
      
    } catch (err) {
      console.error('❌ Error loading risk score:', err);
      setError('Failed to calculate risk score. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Don't show if wallet not connected
  if (!connected) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-lg text-gray-600">Calculating your security score...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">❌</span>
            <h3 className="font-bold text-red-900">Error</h3>
          </div>
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchScore}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No score yet
  if (!riskScore) {
    return null;
  }

  // Get improvement suggestions
  const suggestions = getImprovementSuggestions(riskScore);
  const potentialScore = calculatePotentialScore(riskScore.score, suggestions);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      
      {/* Main Score Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-8 mb-6">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🛡️ Wallet Security Score
          </h2>
          <p className="text-gray-600">
            Your overall wallet security rating
          </p>
        </div>

        {/* Score Circle + Info */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
          
          {/* Circular Progress */}
          <div className="flex-shrink-0">
            <CircularProgress score={riskScore.score} size={240} strokeWidth={24} />
          </div>

          {/* Score Info */}
          <div className="flex-1 max-w-md">
            
            {/* Score Level */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{riskScore.levelEmoji}</span>
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: riskScore.levelColor }}>
                    {riskScore.levelLabel}
                  </h3>
                  <p className="text-sm text-gray-500">Security Level</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{riskScore.data.tokensCount}</p>
                <p className="text-xs text-gray-500">Tokens</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{riskScore.data.approvalsCount}</p>
                <p className="text-xs text-gray-500">Approvals</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center shadow-sm">
                <p className="text-2xl font-bold text-gray-900">{riskScore.data.walletAge}</p>
                <p className="text-xs text-gray-500">Days Old</p>
              </div>
            </div>

            {/* Potential Score */}
            {suggestions.length > 0 && potentialScore > riskScore.score && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  🎯 Potential Score
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {potentialScore}/100
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  By fixing top issues (+{potentialScore - riskScore.score} points)
                </p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Factors (Deductions) */}
        {riskScore.breakdown.deductions.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ⚠️ Risk Factors Found
            </h3>
            <div className="space-y-4">
              {riskScore.breakdown.deductions.map((item, index) => (
                <RiskFactor key={index} item={item} />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Total Deducted:</span>
                <span className="text-xl font-bold text-red-600">
                  -{riskScore.breakdown.totalDeducted} points
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Positive Factors (Bonuses) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            ✅ Positive Factors
          </h3>
          {riskScore.breakdown.bonuses.length > 0 ? (
            <div className="space-y-3">
              {riskScore.breakdown.bonuses.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">{item.category}</p>
                    <p className="text-sm text-green-700">{item.description}</p>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    +{item.points}
                  </span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total Bonuses:</span>
                  <span className="text-xl font-bold text-green-600">
                    +{riskScore.breakdown.totalBonuses} points
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No bonuses yet. Improve your security to earn bonus points!
            </p>
          )}
        </div>

      </div>

      {/* Improvement Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg shadow-lg p-6 mt-6 text-white">
          <h3 className="text-2xl font-bold mb-4">
            🎯 How to Improve Your Score
          </h3>
          <p className="text-white text-opacity-90 mb-6">
            Follow these recommendations to reach {potentialScore}/100
          </p>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary font-bold">
                    {suggestion.priority}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white mb-1">
                      {suggestion.category}
                    </p>
                    <p className="text-white text-opacity-90 text-sm">
                      {suggestion.action}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-xl font-bold text-white">
                      {suggestion.impact}
                    </span>
                    <p className="text-xs text-white text-opacity-75">impact</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
}

// Risk Factor Card Component
function RiskFactor({ item }) {
  const severityColors = {
    critical: 'bg-red-50 border-red-200 text-red-900',
    high: 'bg-orange-50 border-orange-200 text-orange-900',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    low: 'bg-blue-50 border-blue-200 text-blue-900'
  };
  
  const severityIcons = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🔵'
  };
  
  return (
    <div className={`border rounded-lg p-4 ${severityColors[item.severity]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{severityIcons[item.severity]}</span>
          <div>
            <p className="font-semibold">{item.category}</p>
            {item.count && (
              <p className="text-sm opacity-75">Count: {item.count}</p>
            )}
          </div>
        </div>
        <span className="text-lg font-bold">
          -{item.points}
        </span>
      </div>
      <p className="text-sm mb-2">{item.description}</p>
      <p className="text-xs font-semibold opacity-75">
        💡 {item.recommendation}
      </p>
    </div>
  );
}