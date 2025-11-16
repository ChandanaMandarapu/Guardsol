import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchAllTokens, hasApproval, formatTokenBalance } from '../utils/tokens';
import { getScamScoreBadge, getScamScoreColor } from '../utils/scamDetection';
import { DemoContext } from '../App';

const DEMO_TOKENS = [
  {
    id: 'demo1', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    balance: 1000000, decimals: 5, delegate: null, delegatedAmount: '0', isUnlimited: false,
    metadata: { name: 'Bonk', symbol: 'BONK', image: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSd7I' },
    scamScore: 5, scamReasons: [], scamConfidence: 'safe'
  },
  {
    id: 'demo2', mint: '6vfn2EF1Gd3sGRYqLPp5k9B3LJCvz6wD8nk5yxKQpump',
    balance: 999999, decimals: 6, delegate: null, delegatedAmount: '0', isUnlimited: false,
    metadata: { name: 'Fake BONK', symbol: 'FBONK', image: null, mintAuthority: 'active' },
    scamScore: 100, scamReasons: ['⚠️ In scam database'], scamConfidence: 'confirmed'
  },
  {
    id: 'demo3', mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    balance: 42.69, decimals: 6, delegate: 'ScamAddr123', delegatedAmount: '18446744073709551615', isUnlimited: true,
    metadata: { name: 'Jupiter', symbol: 'JUP', image: null },
    scamScore: 15, scamReasons: [], scamConfidence: 'safe'
  },
  {
    id: 'demo4', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    balance: 100, decimals: 6, delegate: null, delegatedAmount: '0', isUnlimited: false,
    metadata: { name: 'USD Coin', symbol: 'USDC', image: null },
    scamScore: 0, scamReasons: [], scamConfidence: 'safe'
  },
  {
    id: 'demo5', mint: 'So11111111111111111111111111111111111111112',
    balance: 5.5, decimals: 9, delegate: null, delegatedAmount: '0', isUnlimited: false,
    metadata: { name: 'Wrapped SOL', symbol: 'SOL', image: null },
    scamScore: 0, scamReasons: [], scamConfidence: 'safe'
  }
];

export default function TokenList() {
  const { publicKey, connected } = useWallet();
  const { demoMode } = useContext(DemoContext);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('scamScore');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    if (demoMode) {
      setTokens(DEMO_TOKENS);
      return;
    }
    if (connected && publicKey) {
      fetchTokens();
    } else {
      setTokens([]);
    }
  }, [connected, publicKey, demoMode]);

  async function fetchTokens() {
    setLoading(true);
    setError(null);
    try {
      const address = publicKey.toString();
      const fetchedTokens = await fetchAllTokens(address);
      setTokens(fetchedTokens);
    } catch (err) {
      setError('Failed to load tokens');
    } finally {
      setLoading(false);
    }
  }

  const filteredAndSortedTokens = useMemo(() => {
    let filtered = [...tokens];
    if (filterBy === 'scam') filtered = filtered.filter(t => t.scamScore >= 61);
    else if (filterBy === 'suspicious') filtered = filtered.filter(t => t.scamScore >= 31 && t.scamScore < 61);
    else if (filterBy === 'safe') filtered = filtered.filter(t => t.scamScore < 31);
    else if (filterBy === 'approved') filtered = filtered.filter(t => hasApproval(t));
    
    filtered.sort((a, b) => {
      if (sortBy === 'scamScore') return b.scamScore - a.scamScore;
      else if (sortBy === 'balance') return b.balance - a.balance;
      else if (sortBy === 'name') {
        const nameA = a.metadata?.name || 'Unknown';
        const nameB = b.metadata?.name || 'Unknown';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });
    return filtered;
  }, [tokens, sortBy, filterBy]);

  if (!connected && !demoMode) return null;
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
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">❌</span>
            <h3 className="font-bold text-red-900">Error</h3>
          </div>
          <p className="text-red-800">{error}</p>
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Tokens</h2>
        <p className="text-gray-600 mb-4">Found {tokens.length} tokens</p>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
              <option value="scamScore">Risk (High → Low)</option>
              <option value="balance">Balance (High → Low)</option>
              <option value="name">Name (A → Z)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by</label>
            <select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
              <option value="all">All ({tokens.length})</option>
              <option value="scam">Scams ({tokens.filter(t => t.scamScore >= 61).length})</option>
              <option value="suspicious">Suspicious ({tokens.filter(t => t.scamScore >= 31 && t.scamScore < 61).length})</option>
              <option value="safe">Safe ({tokens.filter(t => t.scamScore < 31).length})</option>
              <option value="approved">Approvals ({tokens.filter(t => hasApproval(t)).length})</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedTokens.map((token) => <TokenCard key={token.id} token={token} />)}
      </div>
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
  
  const borderColor = { red: 'border-red-200', yellow: 'border-yellow-200', green: 'border-green-200' }[color];
  const bgColor = { red: 'bg-red-50', yellow: 'bg-yellow-50', green: 'bg-green-50' }[color];
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 ${borderColor}`}>
      <div className="flex justify-end mb-2">
        <div className={`${bgColor} px-3 py-1 rounded-full flex items-center gap-1`}>
          <span>{badge.emoji}</span>
          <span className="text-xs font-semibold text-gray-700">{badge.text}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        {image ? (
          <img src={image} alt={name} className="w-12 h-12 rounded-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold"
          style={{ display: image ? 'none' : 'flex' }}>
          {symbol.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          <p className="text-sm text-gray-500 truncate">{symbol}</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Balance</p>
        <p className="text-2xl font-bold text-gray-900">{formatTokenBalance(token)}</p>
        <p className="text-xs text-gray-500 mt-1">{symbol}</p>
      </div>

      {scamReasons.length > 0 && (
        <div className={`${bgColor} border ${borderColor} rounded-lg p-3 mb-4`}>
          <p className="text-xs font-semibold text-gray-700 mb-1">Why flagged:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {scamReasons.map((reason, idx) => <li key={idx}>• {reason}</li>)}
          </ul>
        </div>
      )}

      {hasApproval(token) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="text-sm font-medium text-orange-900">Has Approval</p>
          </div>
          {token.isUnlimited && (
            <p className="text-xs font-bold text-red-600 mt-1">⚠️ UNLIMITED!</p>
          )}
        </div>
      )}
    </div>
  );
}