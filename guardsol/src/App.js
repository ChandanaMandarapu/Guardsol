import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletContextProvider from './components/WalletProvider';
import Header from './components/Header';
import WalletInfo from './components/WalletInfo';
import TokenStats from './components/TokenStats';
import ApprovalScanner from './components/ApprovalScanner';
import TokenList from './components/TokenList';
import { validateConfig } from './utils/config';

export const DemoContext = React.createContext({
  demoMode: false,
  setDemoMode: () => {}
});

function App() {
  const [demoMode, setDemoMode] = useState(false);
  
  React.useEffect(() => {
    validateConfig();
  }, []);
  
  return (
    <DemoContext.Provider value={{ demoMode, setDemoMode }}>
      <WalletContextProvider>
        <div className="min-h-screen bg-gray-50">
          
          <Header />
          
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-blue-900">🎭 Demo Mode</h3>
                <p className="text-sm text-blue-700">
                  {demoMode ? 'Showing sample data' : 'Enable to see all features'}
                </p>
              </div>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`px-6 py-3 rounded-lg font-bold ${
                  demoMode 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {demoMode ? '❌ Exit Demo' : '🎭 Try Demo'}
              </button>
            </div>
          </div>
          
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
    </DemoContext.Provider>
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