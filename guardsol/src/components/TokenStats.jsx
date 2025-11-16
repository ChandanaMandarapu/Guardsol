import React, { useContext } from 'react';
import { hasApproval } from '../utils/tokens';
import { DemoContext } from '../App';

export default function TokenStats({ tokens }) {
  const { demoMode } = useContext(DemoContext);
  
  if (demoMode) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">📊 Wallet Security Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm opacity-90">Total</p>
            </div>
            <div className="bg-green-500 bg-opacity-30 rounded-lg p-4">
              <p className="text-2xl font-bold">3</p>
              <p className="text-sm opacity-90">🟢 Safe</p>
            </div>
            <div className="bg-yellow-500 bg-opacity-30 rounded-lg p-4">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm opacity-90">🟡 Suspicious</p>
            </div>
            <div className="bg-red-500 bg-opacity-30 rounded-lg p-4">
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm opacity-90">🔴 Scams</p>
            </div>
            <div className="bg-orange-500 bg-opacity-30 rounded-lg p-4">
              <p className="text-2xl font-bold">2</p>
              <p className="text-sm opacity-90">⚠️ Approvals</p>
            </div>
            <div className="bg-red-600 bg-opacity-40 rounded-lg p-4">
              <p className="text-2xl font-bold">1</p>
              <p className="text-sm opacity-90">🚨 Unlimited</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!tokens || tokens.length === 0) return null;
  
  const totalTokens = tokens.length;
  const scamTokens = tokens.filter(t => t.scamScore >= 61).length;
  const suspiciousTokens = tokens.filter(t => t.scamScore >= 31 && t.scamScore < 61).length;
  const safeTokens = tokens.filter(t => t.scamScore < 31).length;
  const approvedTokens = tokens.filter(t => hasApproval(t)).length;
  const unlimitedApprovals = tokens.filter(t => t.isUnlimited).length;
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">📊 Wallet Security Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <p className="text-2xl font-bold">{totalTokens}</p>
            <p className="text-sm opacity-90">Total</p>
          </div>
          <div className="bg-green-500 bg-opacity-30 rounded-lg p-4">
            <p className="text-2xl font-bold">{safeTokens}</p>
            <p className="text-sm opacity-90">🟢 Safe</p>
          </div>
          <div className="bg-yellow-500 bg-opacity-30 rounded-lg p-4">
            <p className="text-2xl font-bold">{suspiciousTokens}</p>
            <p className="text-sm opacity-90">🟡 Suspicious</p>
          </div>
          <div className="bg-red-500 bg-opacity-30 rounded-lg p-4">
            <p className="text-2xl font-bold">{scamTokens}</p>
            <p className="text-sm opacity-90">🔴 Scams</p>
          </div>
          <div className="bg-orange-500 bg-opacity-30 rounded-lg p-4">
            <p className="text-2xl font-bold">{approvedTokens}</p>
            <p className="text-sm opacity-90">⚠️ Approvals</p>
          </div>
          <div className="bg-red-600 bg-opacity-40 rounded-lg p-4">
            <p className="text-2xl font-bold">{unlimitedApprovals}</p>
            <p className="text-sm opacity-90">🚨 Unlimited</p>
          </div>
        </div>
        {(scamTokens > 0 || unlimitedApprovals > 0) && (
          <div className="mt-4 bg-red-500 bg-opacity-20 border border-red-300 rounded-lg p-4">
            <p className="font-semibold mb-2">⚠️ Security Warnings:</p>
            <ul className="text-sm space-y-1">
              {scamTokens > 0 && <li>• {scamTokens} likely scam token{scamTokens !== 1 ? 's' : ''}</li>}
              {unlimitedApprovals > 0 && <li>• {unlimitedApprovals} UNLIMITED approval{unlimitedApprovals !== 1 ? 's' : ''}</li>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}