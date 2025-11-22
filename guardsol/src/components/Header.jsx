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
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

        {/* Left side: Logo */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">🛡️</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              GuardSol
            </h1>
            <p className="text-sm text-gray-500">
              Your Solana Security Shield
            </p>
          </div>
        </div>

        {/* Middle: Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('home')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === 'home'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            🏠 Home
          </button>

          <button
            onClick={() => setCurrentPage('admin')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${currentPage === 'admin'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
          >
            <span>🛡️</span>
            <span>Admin Panel</span>
            {isAdminUser && (
              <span className="px-2 py-0.5 bg-purple-800 text-white text-xs rounded">
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
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full ${badge.color} text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity`}
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
              <span className="bg-white bg-opacity-20 px-1.5 rounded text-xs">{reputation}</span>
            </div>
          )}
          <WalletMultiButton className="!bg-primary hover:!bg-primaryHover" />
        </div>

      </div>
    </header>
  );
}