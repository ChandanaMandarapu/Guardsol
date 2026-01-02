import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// wallet adapter css
import '@solana/wallet-adapter-react-ui/styles.css';

// wraps entire app and provides wallet functionality
export default function WalletContextProvider({ children }) {
  // Using Helius RPC (User Provided Key) for reliable Token-2022 scanning
  const endpoint = useMemo(() => 'https://mainnet.helius-rpc.com/?api-key=6182eb9f-228b-4625-a950-515ac4d00748', []);

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