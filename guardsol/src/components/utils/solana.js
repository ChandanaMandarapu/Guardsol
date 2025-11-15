import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

// connection to Solana blockchain
const NETWORK = 'mainnet-beta';

// creating a connection
export const connection = new Connection(
  clusterApiUrl(NETWORK),
  'confirmed'
);

// Getting SOL balance of any wallet
export async function getSolBalance(walletAddress) {
  try {
    console.log('🔍 Fetching balance for:', walletAddress);
    
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / 1000000000; // Convert lamports to SOL
    
    console.log('✅ Balance found:', solBalance, 'SOL');
    return solBalance;
    
  } catch (error) {
    console.error('❌ Error fetching balance:', error);
    throw error;
  }
}

// Get wallet age (when it was created)
export async function getWalletAge(walletAddress) {
  try {
    console.log('🔍 Fetching wallet age for:', walletAddress);
    
    const publicKey = new PublicKey(walletAddress);
    
    // Get first transaction
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: 1,
    }, 'confirmed');
    
    if (signatures.length === 0) {
      console.log('⚠️ No transactions found (brand new wallet)');
      return 0;
    }
    
    const firstTxTimestamp = signatures[0].blockTime;
    const createdDate = new Date(firstTxTimestamp * 1000);
    
    // Calculate age in days
    const now = new Date();
    const ageInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    
    console.log('✅ Wallet age:', ageInDays, 'days');
    return ageInDays;
    
  } catch (error) {
    console.error('❌ Error fetching wallet age:', error);
    return 0;
  }
}

// Calculating reputation based on wallet age
export function calculateWalletReputation(ageInDays) {
  if (ageInDays < 7) return 0.1;   // Less than a week = 10%
  if (ageInDays < 30) return 0.3;  // Less than a month = 30%
  if (ageInDays < 90) return 0.6;  // Less than 3 months = 60%
  return 1.0;                       // 3+ months = 100%
}