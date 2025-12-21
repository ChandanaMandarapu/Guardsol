import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import WalletContextProvider from './components/WalletProvider';
import MainLayout from './components/Layout/MainLayout';
import Header from './components/Header';
import WalletInfo from './components/WalletInfo';
import RiskScoreDisplay from './components/RiskScoreDisplay';
import SecurityTicker from './components/SecurityTicker';
import TokenStats from './components/TokenStats';
import ApprovalScanner from './components/ApprovalScanner';
import TokenList from './components/TokenList';
import AdminPanel from './components/AdminPanel';
import NetworkStats from './components/NetworkStats';
import ReputationGuide from './components/ReputationGuide';

import { validateConfig } from './utils/config';
import {
  initGA,
  trackPageView,
  trackWalletConnected,
  trackWalletDisconnected,
} from './utils/analytics';

function AppContent() {
  // Global state
  const [activeAddress, setActiveAddress] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [tokensLoading, setTokensLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'admin'
  const [showReputationGuide, setShowReputationGuide] = useState(false);

  const { publicKey, connected, wallet } = useWallet();

  // Init analytics once
  useEffect(() => {
    initGA();
    trackPageView(window.location.pathname);
  }, []);

  // Track page changes
  useEffect(() => {
    trackPageView(`/${currentPage}`);
  }, [currentPage]);

  // Wallet connect / disconnect tracking
  useEffect(() => {
    if (connected && publicKey) {
      setActiveAddress(publicKey.toString());
      trackWalletConnected(wallet?.adapter?.name || 'Unknown');
    } else if (!connected) {
      trackWalletDisconnected();
    }
  }, [connected, publicKey, wallet]);

  // Fetch tokens when wallet changes
  useEffect(() => {
    if (!activeAddress) {
      setTokens([]);
      return;
    }

    setTokensLoading(true);

    import('./utils/tokens')
      .then(({ fetchAllTokens }) =>
        fetchAllTokens(activeAddress)
          .then(setTokens)
          .catch(console.error)
          .finally(() => setTokensLoading(false))
      );
  }, [activeAddress]);

  return (
    <MainLayout>
      {/* 🔒 SECURITY TICKER — GLOBAL, TOP */}
      <SecurityTicker />

      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onShowGuide={() => setShowReputationGuide(true)}
      />

      {showReputationGuide && (
        <ReputationGuide onClose={() => setShowReputationGuide(false)} />
      )}

      {currentPage === 'admin' ? (
        <main>
          <AdminPanel />
        </main>
      ) : (
        <main>
          <WalletInfo
            activeAddress={activeAddress}
            setActiveAddress={setActiveAddress}
            onShowGuide={() => setShowReputationGuide(true)}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <NetworkStats />
          </div>

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
