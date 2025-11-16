import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletContextProvider from './components/WalletProvider';
import Header from './components/Header';
import WalletInfo from './components/WalletInfo';
import TokenStats from './components/TokenStats';
import TokenList from './components/TokenList';
import { validateConfig } from './utils/config';

function App() {
  // Validate config on startup
  React.useEffect(() => {
    validateConfig();
  }, []);
  
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <WalletInfo />
          <TokenStatsAndList />
        </main>
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <p className="text-center text-sm text-gray-500">
              🛡️ GuardSOL - Your Solana Security Shield
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

function TokenStatsAndList() {
  const { publicKey, connected } = useWallet();
  const [tokens, setTokens] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  
  React.useEffect(() => {
    if (connected && publicKey) {
      console.log('🔍 Fetching tokens for:', publicKey.toString());
      setLoading(true);
      
      import('./utils/tokens').then(({ fetchAllTokens }) => {
        fetchAllTokens(publicKey.toString())
          .then((fetchedTokens) => {
            console.log('✅ Fetched', fetchedTokens.length, 'tokens');
            setTokens(fetchedTokens);
          })
          .catch((error) => {
            console.error('❌ Error fetching tokens:', error);
          })
          .finally(() => {
            setLoading(false);
          });
      });
    } else {
      setTokens([]);
      setLoading(false);
    }
  }, [connected, publicKey]);
  
  if (!connected) return null;
  
  return (
    <>
      <TokenStats tokens={tokens} />
      <TokenList tokens={tokens} loading={loading} />
    </>
  );
}

export default App;