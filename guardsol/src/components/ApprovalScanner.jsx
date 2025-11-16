import React, { useState, useEffect, useContext } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchAllTokens } from '../utils/tokens';
import { getApprovalsWithRisk, groupApprovalsByRisk } from '../utils/approvals';
import { getRiskColor, getRiskEmoji } from '../utils/approvalRisk';
import { DemoContext } from '../App';

const DEMO_APPROVALS = [
  {
    tokenName: 'Jupiter', tokenSymbol: 'JUP', tokenImage: null, balance: 42.69,
    delegate: 'ScamContract123abc456def789xyz', delegatedAmount: '18446744073709551615',
    isUnlimited: true, riskScore: 90, riskLevel: 'critical',
    riskFactors: [
      { factor: 'Unlimited Approval', description: 'Delegate can transfer ALL tokens', points: 60 },
      { factor: 'Very New Delegate', description: 'Created 3 days ago', points: 20 },
      { factor: 'Few Transactions', description: 'Only 5 transactions', points: 10 }
    ],
    delegateInfo: { age: 3, ageLabel: 'Very New (<1 week)', txCount: 5, txCountLabel: 'Very Few (<10)', isScammer: false }
  },
  {
    tokenName: 'USDC', tokenSymbol: 'USDC', tokenImage: null, balance: 100,
    delegate: 'TrustedDEX789xyz123abc', delegatedAmount: '1000000',
    isUnlimited: false, riskScore: 25, riskLevel: 'low',
    riskFactors: [
      { factor: 'Limited Approval', description: 'Can transfer up to 1000000 tokens', points: 20 }
    ],
    delegateInfo: { age: 180, ageLabel: 'Established (3+ months)', txCount: 5000, txCountLabel: 'Many (1000+)', isScammer: false }
  }
];

export default function ApprovalScanner() {
  const { publicKey, connected } = useWallet();
  const { demoMode } = useContext(DemoContext);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (demoMode) {
      setApprovals(DEMO_APPROVALS);
      return;
    }
    if (connected && publicKey) {
      scanApprovals();
    } else {
      setApprovals([]);
    }
  }, [connected, publicKey, demoMode]);

  async function scanApprovals() {
    setLoading(true);
    setError(null);
    try {
      const address = publicKey.toString();
      const tokens = await fetchAllTokens(address);
      const approvalsWithRisk = await getApprovalsWithRisk(tokens);
      setApprovals(approvalsWithRisk);
    } catch (err) {
      setError('Failed to scan approvals');
    } finally {
      setLoading(false);
    }
  }

  if (!connected && !demoMode) return null;
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-lg text-gray-600">Scanning approvals...</p>
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
        </div>
      </div>
    );
  }
  if (approvals.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">Great News!</h3>
          <p className="text-green-800 text-lg">No token approvals found</p>
        </div>
      </div>
    );
  }

  const grouped = groupApprovalsByRisk(approvals);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🔍 Approval Scanner</h2>
        <p className="text-gray-600">Found {approvals.length} approval{approvals.length !== 1 ? 's' : ''}</p>
      </div>

      {(grouped.critical?.length > 0 || grouped.high?.length > 0) && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-xl font-bold text-red-900">Action Required!</h3>
          </div>
          <div className="space-y-2 text-red-800">
            {grouped.critical?.length > 0 && (
              <p className="font-semibold">🔴 {grouped.critical.length} CRITICAL risk - Revoke immediately!</p>
            )}
            {grouped.high?.length > 0 && (
              <p className="font-semibold">🟠 {grouped.high.length} High risk - Review urgently</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {grouped.critical?.length > 0 && <ApprovalGroup title="🔴 CRITICAL RISK" approvals={grouped.critical} />}
        {grouped.high?.length > 0 && <ApprovalGroup title="🟠 High Risk" approvals={grouped.high} />}
        {grouped.medium?.length > 0 && <ApprovalGroup title="🟡 Medium Risk" approvals={grouped.medium} />}
        {grouped.low?.length > 0 && <ApprovalGroup title="🔵 Low Risk" approvals={grouped.low} />}
      </div>
    </div>
  );
}

function ApprovalGroup({ title, approvals }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 gap-4">
        {approvals.map((approval, idx) => <ApprovalCard key={idx} approval={approval} />)}
      </div>
    </div>
  );
}

function ApprovalCard({ approval }) {
  const { demoMode } = useContext(DemoContext);
  const riskColor = getRiskColor(approval.riskLevel);
  const borderColors = { red: 'border-red-300', orange: 'border-orange-300', yellow: 'border-yellow-300', blue: 'border-blue-300' };
  const bgColors = { red: 'bg-red-50', orange: 'bg-orange-50', yellow: 'bg-yellow-50', blue: 'bg-blue-50' };

  return (
    <div className={`bg-white border-2 ${borderColors[riskColor]} rounded-lg shadow-md p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {approval.tokenSymbol.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{approval.tokenName}</h4>
            <p className="text-sm text-gray-500">{approval.tokenSymbol}</p>
            <p className="text-xs text-gray-400 mt-1">Balance: {approval.balance.toFixed(4)}</p>
          </div>
        </div>
        <div className={`${bgColors[riskColor]} px-4 py-2 rounded-lg`}>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getRiskEmoji(approval.riskLevel)}</span>
            <div>
              <p className="text-xs font-semibold text-gray-600">Risk</p>
              <p className="text-xl font-bold text-gray-900">{approval.riskScore}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        {approval.isUnlimited ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm font-bold rounded-full">
            ⚠️ UNLIMITED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
            Limited
          </span>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Delegate:</p>
        <p className="text-xs font-mono text-gray-600 break-all">{approval.delegate}</p>
        {approval.delegateInfo && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Age</p>
              <p className="text-sm font-semibold text-gray-700">{approval.delegateInfo.ageLabel}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Transactions</p>
              <p className="text-sm font-semibold text-gray-700">{approval.delegateInfo.txCountLabel}</p>
            </div>
          </div>
        )}
      </div>

      {approval.riskFactors?.length > 0 && (
        <div className={`${bgColors[riskColor]} border ${borderColors[riskColor]} rounded-lg p-4 mb-4`}>
          <p className="text-sm font-semibold text-gray-700 mb-2">Why risky?</p>
          <ul className="space-y-2">
            {approval.riskFactors.map((factor, idx) => (
              <li key={idx} className="text-sm text-gray-700">
                <span className="font-semibold">{factor.factor}:</span> {factor.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        disabled={!demoMode}
        className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {demoMode ? '🎭 Demo Mode (No Action)' : '🗑️ Revoke Approval'}
      </button>
    </div>
  );
}