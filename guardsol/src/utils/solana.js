import { Connection, PublicKey } from '@solana/web3.js';
import { config } from './config';
import { rpcCache } from './rpcCache';

export const connection = new Connection(
  config.heliusRpcUrl,
  'confirmed'
);

// CACHED VERSION of getBalance
export async function getSolBalance(walletAddress) {
  try {
    // Check cache first
    const cached = rpcCache.get('getBalance', walletAddress);
    if (cached !== null) {
      return cached;
    }

    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / 1000000000;

    // Cache the result
    rpcCache.set('getBalance', walletAddress, solBalance);

    return solBalance;

  } catch (error) {
    console.error('❌ Error fetching balance:', error);
    throw error;
  }
}

// CACHED VERSION of getWalletAge
export async function getWalletAge(walletAddress) {
  try {
    // Check cache first
    const cached = rpcCache.get('getWalletAge', walletAddress);
    if (cached !== null) {
      return cached;
    }

    const publicKey = new PublicKey(walletAddress);
    const signatures = await connection.getSignaturesForAddress(publicKey, {
      limit: 1,
    }, 'confirmed');

    if (signatures.length === 0) {
      return 0;
    }

    const firstTxTimestamp = signatures[0].blockTime;
    const createdDate = new Date(firstTxTimestamp * 1000);
    const now = new Date();
    const ageInDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

    // Cache the result
    rpcCache.set('getWalletAge', walletAddress, ageInDays);

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