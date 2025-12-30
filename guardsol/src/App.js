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
import TxSimulator from './components/TxSimulator';

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
  const [currentPage, setCurrentPage] = useState('home'); // home | simulator | admin
  const [showReputationGuide, setShowReputationGuide] = useState(false);

  const { publicKey, connected, wallet } = useWallet();

  // Init analytics once
  useEffect(() => {
    initGA();
    trackPageView('/');
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
      setActiveAddress(null);
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
      {/* 🔒 GLOBAL SECURITY TICKER */}
      <SecurityTicker />

      {/* 🔝 HEADER */}
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onShowGuide={() => setShowReputationGuide(true)}
      />

      {/* 🧠 REPUTATION GUIDE MODAL */}
      {showReputationGuide && (
        <ReputationGuide onClose={() => setShowReputationGuide(false)} />
      )}

      {/* 🛡️ ADMIN PANEL */}
      {currentPage === 'admin' && (
        <main className="min-h-screen">
          <AdminPanel />
        </main>
      )}

      {/* 🧪 TRANSACTION SIMULATOR (SEPARATE PAGE) */}
      {currentPage === 'simulator' && (
        <main className="min-h-screen flex items-center justify-center px-4">
          <TxSimulator />
        </main>
      )}

      {/* 🏠 HOME / WALLET SCAN */}
      {currentPage === 'home' && (
        <main>
          <WalletInfo
            activeAddress={activeAddress}
            setActiveAddress={setActiveAddress}
            onShowGuide={() => setShowReputationGuide(true)}
          />

          <div className="max-w-7xl mx-auto px-4 mt-8">
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
