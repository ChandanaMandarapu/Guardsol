// src/components/TokenList.jsx
// FIXED: Passes viewingAddress to ReportScamModal
import React, { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import ReportScamModal from './ReportScamModal';
import CommunityReports from './CommunityReports';
import { hasApproval, formatTokenBalance } from '../utils/tokens';
import { getScamScoreBadge, getScamScoreColor } from '../utils/scamDetection';

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
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-lg text-gray-600">Loading tokens...</p>
          </div>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🪙</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Tokens Found</h3>
          <p className="text-gray-600">
            {connected 
              ? 'This wallet has no tokens'
              : 'Enter a wallet address to scan for tokens'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Controls */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Tokens</h2>
        <p className="text-gray-600 mb-4">
          Found {tokens.length} token{tokens.length !== 1 ? 's' : ''}
        </p>

        <div className="flex flex-wrap gap-4">
          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="scamScore">Risk (High → Low)</option>
              <option value="balance">Balance (High → Low)</option>
              <option value="name">Name (A → Z)</option>
            </select>
          </div>

          {/* Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
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
          <p className="text-sm text-gray-500 mt-3">
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
    red: 'border-red-200',
    yellow: 'border-yellow-200',
    green: 'border-green-200',
  }[color];

  const bgColor = {
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
    green: 'bg-green-50',
  }[color];

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 ${borderColor}`}>

        {/* Badge */}
        <div className="flex justify-end mb-2">
          <div className={`${bgColor} px-3 py-1 rounded-full flex items-center gap-1`}>
            <span>{badge.emoji}</span>
            <span className="text-xs font-semibold text-gray-700">{badge.text}</span>
          </div>
        </div>

        {/* Token Info */}
        <div className="flex items-center gap-3 mb-4">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => (e.target.style.display = 'none')}
            />
          ) : null}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
            <p className="text-sm text-gray-500 truncate">{symbol}</p>
          </div>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Balance</p>
          <p className="text-2xl font-bold text-gray-900">{formatTokenBalance(token)}</p>
          <p className="text-xs text-gray-500 mt-1">{symbol}</p>
        </div>

        {/* Scam Reasons */}
        {scamReasons.length > 0 && (
          <div className={`${bgColor} border ${borderColor} rounded-lg p-3 mb-4`}>
            <p className="text-xs font-semibold text-gray-700 mb-1">Why flagged:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {scamReasons.map((reason, idx) => (
                <li key={idx}>• {reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Community Reports */}
        <CommunityReports address={token.mint} />

        {/* Report Button */}
        <button
          onClick={() => setShowReportModal(true)}
          className="w-full px-4 py-2 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg hover:bg-red-100 flex items-center justify-center gap-2 transition-colors"
        >
          <span>🚨</span>
          <span>Report as Scam</span>
        </button>
      </div>

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