import React from 'react';
import WalletContextProvider from './components/WalletProvider';
import Header from './components/Header';
import WalletInfo from './components/WalletInfo';
import ScamTester from './components/ScamTester';

function App() {
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gray-50">
        
        {/* Header with wallet button */}
        <Header />
        
        {/* Main content */}
        <main>
          <WalletInfo />
          <ScamTester />
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <p className="text-center text-sm text-gray-500">
              🛡️ Guard Sol - Protecting Solana Wallets
            </p>
            <p className="text-center text-xs text-gray-400 mt-1">
              Not financial advice. Use at your own risk.
            </p>
          </div>
        </footer>
        
      </div>
    </WalletContextProvider>
  );
}

export default App;