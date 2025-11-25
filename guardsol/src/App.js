import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletContextProvider from './components/WalletProvider';
import MainLayout from './components/Layout/MainLayout';
import Header from './components/Header';
import WalletInfo from './components/WalletInfo';
import RiskScoreDisplay from './components/RiskScoreDisplay';
import TokenStats from './components/TokenStats';
import ApprovalScanner from './components/ApprovalScanner';
import TokenList from './components/TokenList';
import AdminPanel from './components/AdminPanel';
import NetworkStats from './components/NetworkStats';
import ReputationGuide from './components/ReputationGuide';
import { validateConfig } from './utils/config';
import { initGA, trackPageView, trackWalletConnected, trackWalletDisconnected } from './utils/analytics';

function AppContent() {
  //Lift activeAddress state to App level
  const [activeAddress, setActiveAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' or 'admin'
  const [showReputationGuide, setShowReputationGuide] = useState(false);
  const { publicKey, connected, wallet } = useWallet();

  // Initialize analytics on mount
  useEffect(() => {
    initGA();
    trackPageView(window.location.pathname);
  }, []);

  // Track page changes
  useEffect(() => {
    trackPageView(`/${currentPage}`);
  }, [currentPage]);

  // Update activeAddress when wallet connects/disconnects
  useEffect(() => {
    if (connected && publicKey) {
      setActiveAddress(publicKey.toString());
      trackWalletConnected(wallet?.adapter?.name || 'Unknown');
    } else if (!connected) {
      // Don't clear if we're in manual mode
      // This will be handled by WalletInfo's clearManualMode
      trackWalletDisconnected();
    }
  }, [connected, publicKey, wallet]);

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
    <MainLayout>
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onShowGuide={() => setShowReputationGuide(true)}
      />

      {showReputationGuide && (
        <ReputationGuide onClose={() => setShowReputationGuide(false)} />
      )}

      {currentPage === 'admin' ? (
        // Admin Panel
        <main>
          <AdminPanel />
        </main>
      ) : (
        // Home Page
        <main>
          {/* Pass activeAddress state down to WalletInfo */}
          <WalletInfo
            activeAddress={activeAddress}
            setActiveAddress={setActiveAddress}
            onShowGuide={() => setShowReputationGuide(true)}
          />

          {/* Network Stats Dashboard (Day 11) */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <NetworkStats />
          </div>


          {/* Pass activeAddress to all components that need it */}
          <RiskScoreDisplay walletAddress={activeAddress} />

          <TokenStats tokens={tokens} />

          <ApprovalScanner
            walletAddress={activeAddress}
            tokens={tokens}
            tokensLoading={tokensLoading}
          />

          <TokenList tokens={tokens} loading={tokensLoading} />
        </main>
      )}
    </MainLayout>
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