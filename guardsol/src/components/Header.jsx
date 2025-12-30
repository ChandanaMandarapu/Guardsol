import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { isAdmin } from '../utils/admin';
import { getUserReputation, getReputationBadge } from '../utils/reputation';

export default function Header({ currentPage, setCurrentPage, onShowGuide }) {
  const { publicKey, connected } = useWallet();

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

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="text-3xl drop-shadow-[0_0_8px_rgba(0,246,255,0.5)]">🛡️</div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Guard<span className="text-neon-blue">Sol</span>
            </h1>
            <p className="text-xs text-text-secondary font-mono">
              SOLANA SECURITY SHIELD
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 bg-dark-card/50 p-1 rounded-xl border border-white/5">

          <NavButton
            active={currentPage === 'home'}
            onClick={() => setCurrentPage('home')}
            activeClass="bg-neon-blue/10 text-neon-blue"
          >
            🏠 Home
          </NavButton>

          <NavButton
            active={currentPage === 'simulator'}
            onClick={() => setCurrentPage('simulator')}
            activeClass="bg-neon-green/10 text-neon-green"
          >
            🧪 Transaction Simulator
          </NavButton>

          <NavButton
            active={currentPage === 'admin'}
            onClick={() => setCurrentPage('admin')}
            activeClass="bg-neon-purple/10 text-neon-purple"
          >
            🛡️ Admin
            {isAdminUser && (
              <span className="ml-2 px-2 py-0.5 text-[10px] bg-neon-purple/20 border border-neon-purple/30 rounded">
                ADMIN
              </span>
            )}
          </NavButton>
        </div>

        {/* Wallet + Reputation */}
        <div className="flex items-center gap-3">
          {connected && (
            <div
              onClick={onShowGuide}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-card border border-white/10 hover:border-neon-blue/50 cursor-pointer"
            >
              <span>{badge.icon}</span>
              <span className="text-sm">{badge.label}</span>
              <span className="text-xs bg-white/5 px-2 py-0.5 rounded">{reputation}</span>
            </div>
          )}
          <WalletMultiButton className="!bg-neon-gradient !text-black !rounded-xl" />
        </div>
      </div>
    </header>
  );
}

function NavButton({ children, active, onClick, activeClass }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? `${activeClass} shadow-[0_0_10px_rgba(0,255,255,0.15)]`
          : 'text-text-secondary hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}
