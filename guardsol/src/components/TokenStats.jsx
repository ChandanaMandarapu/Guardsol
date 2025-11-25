import React from 'react';
import { hasApproval } from '../utils/tokens';
import GlassCard from './UI/GlassCard';

// collecting tokenstats 
export default function TokenStats({ tokens }) {
  if (!tokens || tokens.length === 0) return null;

  const totalTokens = tokens.length;
  const scamTokens = tokens.filter(t => t.scamScore >= 61).length;
  const suspiciousTokens = tokens.filter(t => t.scamScore >= 31 && t.scamScore < 61).length;
  const safeTokens = tokens.filter(t => t.scamScore < 31).length;
  const approvedTokens = tokens.filter(t => hasApproval(t)).length;
  const unlimitedApprovals = tokens.filter(t => t.isUnlimited).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <GlassCard className="p-6">

        <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <span>📊</span> Wallet Security Summary
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center hover:bg-white/10 transition-colors">
            <p className="text-2xl font-bold text-white">{totalTokens}</p>
            <p className="text-sm text-text-secondary">Total</p>
          </div>

          <div className="bg-neon-green/10 border border-neon-green/30 rounded-lg p-4 text-center hover:bg-neon-green/20 transition-colors">
            <p className="text-2xl font-bold text-neon-green">{safeTokens}</p>
            <p className="text-sm text-neon-green/80">🟢 Safe</p>
          </div>

          <div className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-lg p-4 text-center hover:bg-neon-yellow/20 transition-colors">
            <p className="text-2xl font-bold text-neon-yellow">{suspiciousTokens}</p>
            <p className="text-sm text-neon-yellow/80">🟡 Suspicious</p>
          </div>

          <div className="bg-neon-red/10 border border-neon-red/30 rounded-lg p-4 text-center hover:bg-neon-red/20 transition-colors">
            <p className="text-2xl font-bold text-neon-red">{scamTokens}</p>
            <p className="text-sm text-neon-red/80">🔴 Scams</p>
          </div>

          <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-4 text-center hover:bg-neon-blue/20 transition-colors">
            <p className="text-2xl font-bold text-neon-blue">{approvedTokens}</p>
            <p className="text-sm text-neon-blue/80">⚠️ Approvals</p>
          </div>

          <div className="bg-neon-red/20 border border-neon-red/50 rounded-lg p-4 text-center hover:bg-neon-red/30 transition-colors animate-pulse-slow">
            <p className="text-2xl font-bold text-neon-red">{unlimitedApprovals}</p>
            <p className="text-sm text-neon-red/80">🚨 Unlimited</p>
          </div>

        </div>

        {(scamTokens > 0 || unlimitedApprovals > 0) && (
          <div className="mt-4 bg-neon-red/10 border border-neon-red/30 rounded-lg p-4">
            <p className="font-semibold mb-2 text-neon-red flex items-center gap-2">
              <span className="animate-pulse">⚠️</span> Security Warnings:
            </p>
            <ul className="text-sm space-y-1 text-white">
              {scamTokens > 0 && (
                <li>• <span className="text-neon-red font-bold">{scamTokens}</span> likely scam token{scamTokens !== 1 ? 's' : ''}</li>
              )}
              {unlimitedApprovals > 0 && (
                <li>• <span className="text-neon-red font-bold">{unlimitedApprovals}</span> UNLIMITED approval{unlimitedApprovals !== 1 ? 's' : ''} (HIGH RISK!)</li>
              )}
            </ul>
          </div>
        )}

      </GlassCard>
    </div>
  );
}