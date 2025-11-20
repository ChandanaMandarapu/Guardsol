// src/components/Header.jsx
// FIXED: Admin Panel always visible, not just for connected admin wallet
import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { isAdmin } from '../utils/admin';

export default function Header({ currentPage, setCurrentPage }) {
  const { publicKey, connected } = useWallet();
  
  // Check if connected wallet is admin
  const adminWallet = publicKey?.toString();
  const isAdminUser = connected && isAdmin(adminWallet);

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

        {/* Middle: Navigation - ALWAYS SHOW BOTH BUTTONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('home')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              currentPage === 'home'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏠 Home
          </button>

          {/* FIXED: Always show Admin Panel button */}
          <button
            onClick={() => setCurrentPage('admin')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              currentPage === 'admin'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <span>🛡️</span>
            <span>Admin Panel</span>
            {/* Show ADMIN badge only if connected wallet is admin */}
            {isAdminUser && (
              <span className="px-2 py-0.5 bg-purple-800 text-white text-xs rounded">
                ADMIN
              </span>
            )}
          </button>
        </div>
        
        {/* Right side: Wallet button */}
        <WalletMultiButton className="!bg-primary hover:!bg-primaryHover" />
        
      </div>
    </header>
  );
}