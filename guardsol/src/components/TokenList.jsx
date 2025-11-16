import React, { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { hasApproval, formatTokenBalance } from '../utils/tokens';
import { getScamScoreBadge, getScamScoreColor } from '../utils/scamDetection';

export default function TokenList({ tokens = [], loading = false }) {
  const { connected } = useWallet();
  const [sortBy, setSortBy] = useState('scamScore');
  const [filterBy, setFilterBy] = useState('all');

  // Filter and sort
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
      if (sortBy === 'scamScore') {
        return b.scamScore - a.scamScore;
      } else if (sortBy === 'balance') {
        return b.balance - a.balance;
      } else if (sortBy === 'name') {
        const nameA = a.metadata?.name || 'Unknown';
        const nameB = b.metadata?.name || 'Unknown';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });
    
    return filtered;
  }, [tokens, sortBy, filterBy]);

  if (!connected) return null;

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
          <p className="text-gray-600">This wallet doesn't hold any SPL tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with controls */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Tokens</h2>
        <p className="text-gray-600 mb-4">
          Found {tokens.length} token{tokens.length !== 1 ? 's' : ''}
        </p>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-4">
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

      {/* Token grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedTokens.map((token) => (
          <TokenCard key={token.id} token={token} />
        ))}
      </div>

      {filteredAndSortedTokens.length === 0 && tokens.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No tokens match the filter</p>
          <button
            onClick={() => setFilterBy('all')}
            className="mt-3 text-primary hover:underline"
          >
            Show all tokens
          </button>
        </div>
      )}
    </div>
  );
}

function TokenCard({ token }) {
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
    green: 'border-green-200'
  }[color];
  
  const bgColor = {
    red: 'bg-red-50',
    yellow: 'bg-yellow-50',
    green: 'bg-green-50'
  }[color];
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 ${borderColor}`}>
      {/* Badge */}
      <div className="flex justify-end mb-2">
        <div className={`${bgColor} px-3 py-1 rounded-full flex items-center gap-1`}>
          <span>{badge.emoji}</span>
          <span className="text-xs font-semibold text-gray-700">{badge.text}</span>
        </div>
      </div>
      
      {/* Token info */}
      <div className="flex items-center gap-3 mb-4">
        {image ? (
          <img 
            src={image} 
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold"
          style={{ display: image ? 'none' : 'flex' }}
        >
          {symbol.charAt(0)}
        </div>
        
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

      {/* Scam reasons */}
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

      {/* Approval warning */}
      {hasApproval(token) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="text-sm font-medium text-orange-900">Has Approval</p>
          </div>
          <p className="text-xs text-orange-800 mt-1">
            Delegate: {token.delegate.slice(0, 8)}...
          </p>
          {token.isUnlimited && (
            <p className="text-xs font-bold text-red-600 mt-1">⚠️ UNLIMITED!</p>
          )}
        </div>
      )}

      {/* Details */}
      <details className="mt-4">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
          Show Details
        </summary>
        <div className="mt-2 text-xs font-mono text-gray-600 break-all space-y-1">
          <p><strong>Score:</strong> {scamScore}/100</p>
          <p><strong>Mint:</strong> {token.mint}</p>
          <p><strong>Balance:</strong> {token.balance}</p>
          {metadata?.mintAuthority && metadata.mintAuthority !== 'null' && (
            <p><strong>Mint Authority:</strong> Active ⚠️</p>
          )}
          {metadata?.freezeAuthority && metadata.freezeAuthority !== 'null' && (
            <p><strong>Freeze Authority:</strong> Active ⚠️</p>
          )}
        </div>
      </details>
    </div>
  );
}