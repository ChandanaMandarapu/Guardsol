import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getSolBalance, getWalletAge, calculateWalletReputation } from '../utils/solana';

// Shows wallet info after connection
export default function WalletInfo() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  
  const [balance, setBalance] = useState(null);
  const [walletAge, setWalletAge] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch data when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchWalletData();
    } else {
      setBalance(null);
      setWalletAge(null);
      setReputation(null);
    }
  }, [connected, publicKey]);

  async function fetchWalletData() {
    setLoading(true);
    console.log('🚀 Starting wallet data fetch...');
    
    try {
      const address = publicKey.toString();
      
      const bal = await getSolBalance(address);
      setBalance(bal);
      
      const age = await getWalletAge(address);
      setWalletAge(age);
      
      const rep = calculateWalletReputation(age);
      setReputation(rep);
      
      console.log('✅ All wallet data fetched!');
      
    } catch (error) {
      console.error('❌ Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Not connected
  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600">
            Click the "Connect Wallet" button above to get started
          </p>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-lg text-gray-600">Loading wallet data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show data
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        
        {/* Wallet Address */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Wallet Address
          </h3>
          <p className="text-lg font-mono text-gray-900 break-all">
            {publicKey.toString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Balance */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <h4 className="text-sm font-medium text-gray-500">
                SOL Balance
              </h4>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {balance !== null ? balance.toFixed(4) : '---'}
            </p>
            <p className="text-sm text-gray-500 mt-1">SOL</p>
          </div>

          {/* Age */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📅</span>
              <h4 className="text-sm font-medium text-gray-500">
                Wallet Age
              </h4>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {walletAge !== null ? walletAge : '---'}
            </p>
            <p className="text-sm text-gray-500 mt-1">days old</p>
          </div>

          {/* Reputation */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <h4 className="text-sm font-medium text-gray-500">
                Reputation
              </h4>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {reputation !== null ? (reputation * 100).toFixed(0) : '---'}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {reputation >= 1 ? 'Veteran' : 
               reputation >= 0.6 ? 'Trusted' :
               reputation >= 0.3 ? 'Growing' : 'New'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}