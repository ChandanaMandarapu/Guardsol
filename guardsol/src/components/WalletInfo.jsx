import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getSolBalance, getWalletAge } from '../utils/solana';
import { getUserReputation, getReputationBadge } from '../utils/reputation';
import GlassCard from './UI/GlassCard';
import NeonButton from './UI/NeonButton';

// Now receives activeAddress and setActiveAddress as props
export default function WalletInfo({ activeAddress, setActiveAddress, onShowGuide }) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  // Manual address input
  const [manualAddress, setManualAddress] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);

  const [balance, setBalance] = useState(null);
  const [walletAge, setWalletAge] = useState(null);
  const [reputationScore, setReputationScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data when activeAddress changes
  useEffect(() => {
    if (activeAddress) {
      fetchWalletData(activeAddress);
    } else {
      setBalance(null);
      setWalletAge(null);
      setReputationScore(0);
    }
  }, [activeAddress]);

  async function fetchWalletData(address) {
    setLoading(true);
    setError(null);
    console.log('🚀 Starting wallet data fetch for:', address);

    try {
      const bal = await getSolBalance(address);
      setBalance(bal);

      const age = await getWalletAge(address);
      setWalletAge(age);

      const rep = await getUserReputation(address);
      setReputationScore(rep);

      console.log('✅ All wallet data fetched!');

    } catch (error) {
      console.error('❌ Error fetching wallet data:', error);
      setError('Failed to fetch wallet data. Check if address is valid.');
    } finally {
      setLoading(false);
    }
  }

  // Handle manual scan
  function handleManualScan() {
    if (!manualAddress || manualAddress.trim() === '') {
      alert('Please enter a wallet address');
      return;
    }

    try {
      // Validate address
      new PublicKey(manualAddress.trim());

      setIsManualMode(true);
      setActiveAddress(manualAddress.trim());

    } catch (err) {
      alert('Invalid wallet address! Please check and try again.');
    }
  }

  // Clear manual mode
  function clearManualMode() {
    setIsManualMode(false);
    setManualAddress('');
    setActiveAddress(connected && publicKey ? publicKey.toString() : null);
    setBalance(null);
    setWalletAge(null);
    setReputationScore(0);
    setError(null);
  }

  // Not connected AND no manual address
  if (!connected && !isManualMode && !activeAddress) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <GlassCard className="p-8">

          {/* Connect Wallet */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 filter drop-shadow-[0_0_10px_rgba(0,246,255,0.5)]">🔗</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-text-secondary">
              Click "Connect Wallet" button above
            </p>
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="text-text-muted font-semibold">OR</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          {/* Manual Address Input */}
          <div className="bg-neon-blue/5 border border-neon-blue/30 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(0,246,255,0.5)]">🔍</span>
              <h3 className="text-lg font-bold text-white">
                Scan Any Public Wallet
              </h3>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Enter any Solana wallet address to view its security status (no connection needed!)
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Paste wallet address here (e.g., 12UJoD4VRHneWXoy...)"
                className="flex-1 px-4 py-3 bg-dark-bg border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue text-white text-sm font-mono outline-none transition-all placeholder-text-muted"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleManualScan();
                }}
              />
              <NeonButton
                onClick={handleManualScan}
                className="!py-3"
              >
                Scan 🔍
              </NeonButton>
            </div>

            <div className="mt-4 bg-dark-bg/50 rounded p-3 border border-white/5">
              <p className="text-xs text-text-muted mb-2 font-semibold">
                💡 Try this example wallet:
              </p>
              <button
                onClick={() => {
                  setManualAddress('12UJoD4VRHneWXoy1j4k3KTACP8ZYX55sS4sbwzuk8KF');
                  setTimeout(() => handleManualScan(), 100);
                }}
                className="text-xs font-mono text-neon-blue hover:text-neon-blue/80 hover:underline break-all text-left transition-colors"
              >
                12UJoD4VRHneWXoy1j4k3KTACP8ZYX55sS4sbwzuk8KF
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <GlassCard className="flex items-center justify-center gap-3 min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
          <p className="text-lg text-neon-blue animate-pulse">Loading wallet data...</p>
        </GlassCard>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <GlassCard className="border-neon-red/50 bg-neon-red/5 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,59,48,0.5)]">❌</span>
            <h3 className="font-bold text-neon-red">Error</h3>
          </div>
          <p className="text-white/90 mb-4">{error}</p>
          <NeonButton
            variant="danger"
            onClick={clearManualMode}
          >
            Try Another Address
          </NeonButton>
        </GlassCard>
      </div>
    );
  }

  // Show data
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <GlassCard className="p-8">

        {/* Manual Mode Banner */}
        {isManualMode && (
          <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(0,246,255,0.5)]">🔍</span>
                <div>
                  <p className="font-semibold text-neon-blue">Viewing Public Wallet</p>
                  <p className="text-xs text-text-secondary">This is read-only mode (no transactions possible)</p>
                </div>
              </div>
              <NeonButton
                variant="outline"
                onClick={clearManualMode}
                className="!py-1 !px-3 text-sm"
              >
                Clear
              </NeonButton>
            </div>
          </div>
        )}

        {/* Wallet Address */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-text-muted mb-1">
            Wallet Address
          </h3>
          <p className="text-lg font-mono text-white break-all bg-dark-bg/50 p-3 rounded border border-white/5">
            {activeAddress}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Balance */}
          <div className="bg-dark-bg/50 border border-white/5 rounded-lg p-6 hover:border-neon-blue/30 transition-colors group">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">💰</span>
              <h4 className="text-sm font-medium text-text-secondary group-hover:text-neon-blue transition-colors">
                SOL Balance
              </h4>
            </div>
            <p className="text-3xl font-bold text-white font-mono">
              {balance !== null ? balance.toFixed(4) : '---'}
            </p>
            <p className="text-sm text-text-muted mt-1">SOL</p>
          </div>

          {/* Age */}
          <div className="bg-dark-bg/50 border border-white/5 rounded-lg p-6 hover:border-neon-purple/30 transition-colors group">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">📅</span>
              <h4 className="text-sm font-medium text-text-secondary group-hover:text-neon-purple transition-colors">
                Wallet Age
              </h4>
            </div>
            <p className="text-3xl font-bold text-white font-mono">
              {walletAge !== null ? walletAge : '---'}
            </p>
            <p className="text-sm text-text-muted mt-1">days old</p>
          </div>

          {/* Reputation Badge */}
          <div className="bg-dark-bg/50 border border-white/5 rounded-lg p-6 hover:border-neon-yellow/30 transition-colors group">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">⭐</span>
              <h4 className="text-sm font-medium text-text-secondary group-hover:text-neon-yellow transition-colors">
                Community Rank
              </h4>
            </div>

            {(() => {
              const badge = getReputationBadge(reputationScore);
              return (
                <div
                  onClick={onShowGuide}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${badge.color} text-white font-bold mb-2 shadow-lg`}>
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    Score: <span className="font-bold text-white">{reputationScore}</span>
                  </p>
                  <p className="text-xs text-neon-blue mt-1 hover:underline">
                    What is this?
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}