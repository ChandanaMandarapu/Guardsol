import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Header with logo and wallet connect button
export default function Header() {
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
              Protect your Solana wallet
            </p>
          </div>
        </div>
        
        {/* Right side: Wallet button */}
        <WalletMultiButton className="!bg-primary hover:!bg-primaryHover" />
        
      </div>
    </header>
  );
}