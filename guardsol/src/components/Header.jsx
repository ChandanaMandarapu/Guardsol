import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { isAdmin } from '../utils/admin';
import { getUserReputation, getReputationBadge } from '../utils/reputation';

export default function Header({ currentPage, setCurrentPage, onShowGuide }) {
  const { publicKey, connected } = useWallet();

  // Check if connected wallet is admin
  const adminWallet = publicKey?.toString();
  const isAdminUser = connected && isAdmin(adminWallet);

  const [reputation, setReputation] = useState(0);
  const badge = getReputationBadge(reputation);

  useEffect(() => {
    if (connected && publicKey) {
      getUserReputation(publicKey.toString()).then(setReputation);
    } else {
      setReputation(0);
    }
  }, [connected, publicKey]);

  return (
    <header className="glass-panel sticky top-0 z-50 border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* Left side: Logo */}
        <div className="flex items-center gap-3">
          <div className="text-3xl filter drop-shadow-[0_0_8px_rgba(0,246,255,0.5)]">🛡️</div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Guard<span className="text-neon-blue">Sol</span>
            </h1>
            <p className="text-xs text-text-secondary font-mono tracking-wider">
              SOLANA SECURITY SHIELD
            </p>
          </div>
        </div>

        {/* Middle: Navigation */}
        <div className="flex items-center gap-3 bg-dark-card/50 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setCurrentPage('home')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${currentPage === 'home'
              ? 'bg-neon-blue/10 text-neon-blue shadow-[0_0_10px_rgba(0,246,255,0.2)]'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
          >
            🏠 Home
          </button>

          <button
            onClick={() => setCurrentPage('admin')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${currentPage === 'admin'
              ? 'bg-neon-purple/10 text-neon-purple shadow-[0_0_10px_rgba(139,92,246,0.2)]'
              : 'text-text-secondary hover:text-white hover:bg-white/5'
              }`}
          >
            <span>🛡️</span>
            <span>Admin Panel</span>
            {isAdminUser && (
              <span className="px-2 py-0.5 bg-neon-purple/20 text-neon-purple text-[10px] rounded border border-neon-purple/30">
                ADMIN
              </span>
            )}
          </button>
        </div>

        {/* Right side: Wallet button and Reputation */}
        <div className="flex items-center gap-3">
          {connected && (
            <div
              onClick={onShowGuide}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-card border border-white/10 hover:border-neon-blue/50 transition-all cursor-pointer group`}
            >
              <span className="text-lg">{badge.icon}</span>
              <span className={`text-sm font-medium ${badge.color.replace('bg-', 'text-').replace('-500', '-400')}`}>{badge.label}</span>
              <span className="bg-white/5 px-2 py-0.5 rounded text-xs text-text-muted group-hover:text-white transition-colors">{reputation}</span>
            </div>
          )}
          <div className="wallet-adapter-button-trigger">
            <WalletMultiButton className="!bg-neon-gradient !text-black !font-semibold !rounded-xl !px-5 !py-2.5 hover:!shadow-neon-blue hover:!-translate-y-0.5 !transition-all !duration-300" />
          </div>
        </div>

      </div>
    </header>
  );
}