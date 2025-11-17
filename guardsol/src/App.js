import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletContextProvider from './components/WalletProvider';
import Header from './components/Header';
import WalletInfo from './components/WalletInfo';
import RiskScoreDisplay from './components/RiskScoreDisplay';
import TokenStats from './components/TokenStats';
import ApprovalScanner from './components/ApprovalScanner';
import TokenList from './components/TokenList';
import { validateConfig } from './utils/config';

function AppContent() {
  // THIS IS THE KEY FIX: Lift activeAddress state to App level
  const [activeAddress, setActiveAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const { publicKey, connected } = useWallet();

  // Update activeAddress when wallet connects/disconnects
  useEffect(() => {
    if (connected && publicKey) {
      setActiveAddress(publicKey.toString());
    } else if (!connected) {
      // Don't clear if we're in manual mode
      // This will be handled by WalletInfo's clearManualMode
    }
  }, [connected, publicKey]);

  // Fetch tokens whenever activeAddress changes
  useEffect(() => {
    if (activeAddress) {
      setTokensLoading(true);
      import('./utils/tokens').then(({ fetchAllTokens }) => {
        fetchAllTokens(activeAddress)
          .then(setTokens)
          .catch(console.error)
          .finally(() => setTokensLoading(false));
      });
    } else {
      setTokens([]);
    }
  }, [activeAddress]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Pass activeAddress state down to WalletInfo */}
        <WalletInfo 
          activeAddress={activeAddress}
          setActiveAddress={setActiveAddress}
        />
        
        {/* Pass activeAddress to all components that need it */}
        <RiskScoreDisplay walletAddress={activeAddress} />
        
        <TokenStats tokens={tokens} />
        
        <ApprovalScanner 
          walletAddress={activeAddress}
          tokens={tokens}
          tokensLoading={tokensLoading}
        />
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            🛡️ Guard Sol - Your Solana Security Shield
          </p>
          <p className="text-center text-xs text-gray-400 mt-1">
            Not financial advice. Use at your own risk.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  useEffect(() => {
    validateConfig();
  }, []);
  
  return (
    <WalletContextProvider>
      <AppContent />
    </WalletContextProvider>
  );
}

export default App;