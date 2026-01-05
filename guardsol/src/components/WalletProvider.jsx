import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// wallet adapter css
import '@solana/wallet-adapter-react-ui/styles.css';

// wraps entire app and provides wallet functionality
export default function WalletContextProvider({ children }) {

  // ✅ Use Helius RPC via environment variable (SECURE)
  const endpoint = useMemo(() => {
    const heliusKey = process.env.REACT_APP_HELIUS_KEY;

    if (!heliusKey) {
      console.warn('⚠️ REACT_APP_HELIUS_KEY not found! Falling back to public RPC.');
      return 'https://api.mainnet-beta.solana.com';
    }

    return `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`;
  }, []);

  // Wallets we support
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
