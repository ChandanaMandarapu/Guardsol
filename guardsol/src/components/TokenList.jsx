// passes viewingAddress to ReportScamModal
import React, { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import ReportScamModal from './ReportScamModal';
import CommunityReports from './CommunityReports';
import { hasApproval, formatTokenBalance } from '../utils/tokens';
import { getScamScoreBadge, getScamScoreColor } from '../utils/scamDetection';
import GlassCard from './UI/GlassCard';
import NeonButton from './UI/NeonButton';

export default function TokenList({ tokens = [], loading = false, viewingAddress = null }) {
  const { connected } = useWallet();

  const [sortBy, setSortBy] = useState('scamScore');
  const [filterBy, setFilterBy] = useState('all');

  // Filter + Sort tokens
  const filteredAndSortedTokens = useMemo(() => {
    let filtered = [...tokens];

    if (filterBy === 'scam') {
      filtered = filtered.filter(t => t.scamScore >= 61);
    } else if (filterBy === 'suspicious') {
      filtered = filtered.filter(t => t.scamScore >= 31 && t.scamScore < 61);
    } else if (filterBy === 'safe') {
      filtered = filtered.filter(t => t.scamScore < 31);
    } else if (filterBy === 'approved') {
      filtered = filtered.filter(t => hasApproval(t));
    }

    filtered.sort((a, b) => {
      if (sortBy === 'scamScore') return b.scamScore - a.scamScore;
      if (sortBy === 'balance') return b.balance - a.balance;
      if (sortBy === 'name') {
        const nameA = a.metadata?.name || 'Unknown';
        const nameB = b.metadata?.name || 'Unknown';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return filtered;
  }, [tokens, sortBy, filterBy]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <GlassCard className="flex items-center justify-center gap-3 min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
          <p className="text-lg text-neon-blue animate-pulse">Loading tokens...</p>
        </GlassCard>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <GlassCard className="text-center py-12">
          <div className="text-6xl mb-4 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🪙</div>
          <h3 className="text-xl font-bold text-white mb-2">No Tokens Found</h3>
          <p className="text-text-secondary">
            {connected
              ? 'This wallet has no tokens'
              : 'Enter a wallet address to scan for tokens'}
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Controls */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Your Tokens</h2>
        <p className="text-text-secondary mb-4">
          Found <span className="text-neon-blue font-bold">{tokens.length}</span> token{tokens.length !== 1 ? 's' : ''}
        </p>

        <div className="flex flex-wrap gap-4">
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue text-white outline-none transition-all"
            >
              <option value="scamScore">Risk (High → Low)</option>
              <option value="balance">Balance (High → Low)</option>
              <option value="name">Name (A → Z)</option>
            </select>
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Filter by</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 bg-dark-bg border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue text-white outline-none transition-all"
            >
              <option value="all">All ({tokens.length})</option>
              <option value="scam">Likely Scams ({tokens.filter(t => t.scamScore >= 61).length})</option>
              <option value="suspicious">Suspicious ({tokens.filter(t => t.scamScore >= 31 && t.scamScore < 61).length})</option>
              <option value="safe">Safe ({tokens.filter(t => t.scamScore < 31).length})</option>
              <option value="approved">Approvals ({tokens.filter(t => hasApproval(t)).length})</option>
            </select>
          </div>
        </div>

        {filterBy !== 'all' && (
          <p className="text-sm text-text-muted mt-3">
            Showing {filteredAndSortedTokens.length} of {tokens.length} tokens
          </p>
        )}
      </div>

      {/* Token Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedTokens.map((token) => (
          <TokenCard
            key={token.id}
            token={token}
            viewingAddress={viewingAddress}
          />
        ))}
      </div>
    </div>
  );
}

function TokenCard({ token, viewingAddress }) {
  const [showReportModal, setShowReportModal] = useState(false);

  const metadata = token.metadata;
  const name = metadata?.name || 'Unknown Token';
  const symbol = metadata?.symbol || '???';
  const image = metadata?.image;

  const scamScore = token.scamScore || 0;
  const scamReasons = token.scamReasons || [];

  const badge = getScamScoreBadge(scamScore);
  const color = getScamScoreColor(scamScore);

  const borderColor = {
    red: 'border-neon-red',
    yellow: 'border-neon-yellow',
    green: 'border-neon-green',
  }[color];

  const bgColor = {
    red: 'bg-neon-red/10',
    yellow: 'bg-neon-yellow/10',
    green: 'bg-neon-green/10',
  }[color];

  const textColor = {
    red: 'text-neon-red',
    yellow: 'text-neon-yellow',
    green: 'text-neon-green',
  }[color];

  return (
    <>
      <GlassCard className={`border ${borderColor} hover:shadow-[0_0_15px_rgba(0,0,0,0.3)] transition-all duration-300 group`}>

        {/* Badge */}
        <div className="flex justify-end mb-2">
          <div className={`${bgColor} border border-white/5 px-3 py-1 rounded-full flex items-center gap-1`}>
            <span className="filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{badge.emoji}</span>
            <span className={`text-xs font-semibold ${textColor}`}>{badge.text}</span>
          </div>
        </div>

        {/* Token Info */}
        <div className="flex items-center gap-3 mb-4">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
              onError={(e) => (e.target.style.display = 'none')}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <span className="text-xl">🪙</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-neon-blue transition-colors">{name}</h3>
            <p className="text-sm text-text-secondary truncate">{symbol}</p>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-4 bg-dark-bg/30 p-3 rounded-lg border border-white/5">
          <p className="text-sm text-text-muted mb-1">Balance</p>
          <p className="text-2xl font-bold text-white font-mono">{formatTokenBalance(token)}</p>
          <p className="text-xs text-text-secondary mt-1">{symbol}</p>
        </div>

        {/* Scam Reasons */}
        {scamReasons.length > 0 && (
          <div className={`${bgColor} border ${borderColor} rounded-lg p-3 mb-4`}>
            <p className="text-xs font-semibold text-white mb-1">Why flagged:</p>
            <ul className="text-xs text-text-primary space-y-1">
              {scamReasons.map((reason, idx) => (
                <li key={idx}>• {reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Community Reports */}
        <CommunityReports address={token.mint} />

        {/* Report Button */}
        <NeonButton
          variant="danger"
          onClick={() => setShowReportModal(true)}
          className="w-full mt-4 flex items-center justify-center gap-2"
        >
          <span>🚨</span>
          <span>Report as Scam</span>
        </NeonButton>
      </GlassCard>

      {/* Report Modal - NOW WITH viewingAddress */}
      <ReportScamModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        scamAddress={token.mint}
        tokenName={name}
        viewingAddress={viewingAddress}
      />
    </>
  );
}