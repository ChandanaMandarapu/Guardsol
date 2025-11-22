import { Connection, PublicKey } from '@solana/web3.js';
import { config } from './config';

// Using Helius RPC 
export const connection = new Connection(
  config.heliusRpcUrl,
  'confirmed'
);

console.log('🔗 Connected to Solana via Helius');

// Get SOL balance
export async function getSolBalance(walletAddress) {
  try {
    console.log('🔍 Fetching balance for:', walletAddress);
    
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / 1000000000;
    
    console.log('✅ Balance:', solBalance, 'SOL');
    return solBalance;
    
  } catch (error) {
    console.error('❌ Error fetching balance:', error);
    throw error;
  }
}

// Get wallet age
export async function getWalletAge(walletAddress) {
  try {
    console.log('🔍 Fetching wallet age...');
    
    const publicKey = new PublicKey(walletAddress);
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: 1,
    }, 'confirmed');
    
    if (signatures.length === 0) {
      console.log('⚠️ No transactions found');
      return 0;
    }
    
    const firstTxTimestamp = signatures[0].blockTime;
    const createdDate = new Date(firstTxTimestamp * 1000);
    const now = new Date();
    const ageInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    
    console.log('✅ Wallet age:', ageInDays, 'days');
    return ageInDays;
    
  } catch (error) {
    console.error('❌ Error fetching wallet age:', error);
    return 0;
  }
}

// Calculate reputation
export function calculateWalletReputation(ageInDays) {
  if (ageInDays < 7) return 0.1;
  if (ageInDays < 30) return 0.3;
  if (ageInDays < 90) return 0.6;
  return 1.0;
}