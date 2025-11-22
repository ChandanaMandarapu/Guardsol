import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getSolBalance, getWalletAge, calculateWalletReputation } from '../utils/solana';

// Now receives activeAddress and setActiveAddress as props
export default function WalletInfo({ activeAddress, setActiveAddress }) {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  
  // Manual address input
  const [manualAddress, setManualAddress] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  
  const [balance, setBalance] = useState(null);
  const [walletAge, setWalletAge] = useState(null);
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data when activeAddress changes
  useEffect(() => {
    if (activeAddress) {
      fetchWalletData(activeAddress);
    } else {
      setBalance(null);
      setWalletAge(null);
      setReputation(null);
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
      
      const rep = calculateWalletReputation(age);
      setReputation(rep);
      
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
    setReputation(null);
    setError(null);
  }

  // Not connected AND no manual address
  if (!connected && !isManualMode && !activeAddress) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          
          {/* Connect Wallet */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600">
              Click "Connect Wallet" button above
            </p>
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-gray-500 font-semibold">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Manual Address Input */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔍</span>
              <h3 className="text-lg font-bold text-gray-900">
                Scan Any Public Wallet
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Enter any Solana wallet address to view its security status (no connection needed!)
            </p>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Paste wallet address here (e.g., 12UJoD4VRHneWXoy...)"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm font-mono"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleManualScan();
                }}
              />
              <button
                onClick={handleManualScan}
                className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primaryHover transition-colors"
              >
                Scan 🔍
              </button>
            </div>

            <div className="mt-4 bg-white rounded p-3">
              <p className="text-xs text-gray-600 mb-2 font-semibold">
                💡 Try this example wallet:
              </p>
              <button
                onClick={() => {
                  setManualAddress('12UJoD4VRHneWXoy1j4k3KTACP8ZYX55sS4sbwzuk8KF');
                  setTimeout(() => handleManualScan(), 100);
                }}
                className="text-xs font-mono text-primary hover:underline break-all text-left"
              >
                12UJoD4VRHneWXoy1j4k3KTACP8ZYX55sS4sbwzuk8KF
              </button>
            </div>
          </div>
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

  // Error
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">❌</span>
            <h3 className="font-bold text-red-900">Error</h3>
          </div>
          <p className="text-red-800">{error}</p>
          <button
            onClick={clearManualMode}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Another Address
          </button>
        </div>
      </div>
    );
  }

  // Show data
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        
        {/* Manual Mode Banner */}
        {isManualMode && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                <div>
                  <p className="font-semibold text-blue-900">Viewing Public Wallet</p>
                  <p className="text-xs text-blue-700">This is read-only mode (no transactions possible)</p>
                </div>
              </div>
              <button
                onClick={clearManualMode}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Wallet Address */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Wallet Address
          </h3>
          <p className="text-lg font-mono text-gray-900 break-all">
            {activeAddress}
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