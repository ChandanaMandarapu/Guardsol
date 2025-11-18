import React, { useState, useEffect } from 'react';
import CircularProgress from './CircularProgress';
import { fetchRiskScoreData } from '../utils/riskScoreData';
import { getImprovementSuggestions, calculatePotentialScore } from '../utils/riskScore';

// FIXED: Now accepts walletAddress as prop
export default function RiskScoreDisplay({ walletAddress }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg shadow-lg p-8 text-white">
        
        <h2 className="text-3xl font-bold mb-8 text-center">
          {riskData.levelEmoji} Wallet Security Score
        </h2>

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

      </div>
    </div>
  );
}