import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletContextProvider from './components/WalletProvider';
import Header from './components/Header';
import WalletInfo from './components/WalletInfo';
import TokenStats from './components/TokenStats';
import ApprovalScanner from './components/ApprovalScanner';
import TokenList from './components/TokenList';
import { validateConfig } from './utils/config';

function App() {
  React.useEffect(() => {
    validateConfig();
  }, []);
  
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gray-50">
        
        <Header />
        
        <main>
          <WalletInfo />
          <TokenStatsWrapper />
          <ApprovalScanner />
          <TokenList />
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
    </WalletContextProvider>
  );
}

function TokenStatsWrapper() {
  const { publicKey, connected } = useWallet();
  const [tokens, setTokens] = React.useState([]);
  
  React.useEffect(() => {
    if (connected && publicKey) {
      import('./utils/tokens').then(({ fetchAllTokens }) => {
        fetchAllTokens(publicKey.toString())
          .then(setTokens)
          .catch(console.error);
      });
    } else {
      setTokens([]);
    }
  }, [connected, publicKey]);
  
  return <TokenStats tokens={tokens} />;
}

export default App;