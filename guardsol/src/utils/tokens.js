import { PublicKey } from '@solana/web3.js';
import { connection } from './solana';
import { config } from './config';
import { getCachedData, setCachedData } from './cache';

const TOKEN_PROGRAM_ID = new PublicKey(config.tokenProgramId);

// Fetch all SPL tokens for a wallet
export async function fetchAllTokens(walletAddress) {
  try {
    console.log('🎯 Starting token fetch for:', walletAddress);
    
    // Check cache first
    const cached = getCachedData('tokens', walletAddress);
    if (cached) {
      console.log('✅ Returning', cached.length, 'tokens from cache');
      return cached;
    }
    
    console.log('📡 Fetching from blockchain...');
    
    const publicKey = new PublicKey(walletAddress);
    
    // - gets all token accounts
    const response = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID },
      'confirmed'
    );
    
    console.log('✅ Found', response.value.length, 'token accounts');
    
    // Parse tokens
    const tokens = response.value.map((item, index) => {
      const accountData = item.account.data.parsed.info;
      
      return {
        id: `${accountData.mint}_${index}`,
        accountAddress: item.pubkey.toString(),
        mint: accountData.mint,
        rawBalance: accountData.tokenAmount.amount,
        balance: parseFloat(accountData.tokenAmount.uiAmountString || '0'),
        decimals: accountData.tokenAmount.decimals,
        delegate: accountData.delegate || null,
        delegatedAmount: accountData.delegatedAmount?.amount || '0',
        isUnlimited: accountData.delegatedAmount?.amount === '18446744073709551615',
        metadata: null
      };
    });
    
    // Fetch metadata
    console.log('🎨 Fetching metadata...');
    const enrichedTokens = await enrichTokensWithMetadata(tokens);
    
    // Calculate scam scores
    console.log('🚨 Calculating scam scores...');
    const tokensWithScores = await calculateAllScamScores(enrichedTokens);
    
    // Cache results
    setCachedData('tokens', walletAddress, tokensWithScores);
    
    console.log('✅ Complete! Cached', tokensWithScores.length, 'tokens');
    return tokensWithScores;
    
  } catch (error) {
    console.error('❌ Error fetching tokens:', error);
    throw error;
  }
}

// Fetch metadata from Helius
export async function fetchTokenMetadata(mintAddresses) {
  try {
    console.log('📡 Fetching metadata for', mintAddresses.length, 'tokens...');
    
    // Check cache
    const cachedMetadata = {};
    const uncachedMints = [];
    
    mintAddresses.forEach(mint => {
      const cached = getCachedData('metadata', mint);
      if (cached) {
        cachedMetadata[mint] = cached;
      } else {
        uncachedMints.push(mint);
      }
    });
    
    console.log('💾', Object.keys(cachedMetadata).length, 'cached,', uncachedMints.length, 'new');
    
    if (uncachedMints.length === 0) {
      return cachedMetadata;
    }
    
    // Helius DAS API
    const url = `https://mainnet.helius-rpc.com/?api-key=${config.heliusKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'metadata-fetch',
        method: 'getAssetBatch',
        params: { ids: uncachedMints }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Helius API error: ${response.status}`);
    }
    
    const data = await response.json();
    const newMetadata = {};
    
    if (data.result) {
      data.result.forEach(asset => {
        if (!asset) return;
        
        const mint = asset.id;
        const metadata = {
          mint,
          name: asset.content?.metadata?.name || 'Unknown Token',
          symbol: asset.content?.metadata?.symbol || '???',
          image: asset.content?.links?.image || asset.content?.files?.[0]?.uri || null,
          mintAuthority: asset.authorities?.find(a => a.scopes?.includes('full'))?.address || null,
          freezeAuthority: asset.freeze_authority || null,
          holderCount: asset.supply?.print_current_supply || 0,
        };
        
        newMetadata[mint] = metadata;
        setCachedData('metadata', mint, metadata);
      });
    }
    
    console.log('✅ Fetched', Object.keys(newMetadata).length, 'new metadata');
    
    return { ...cachedMetadata, ...newMetadata };
    
  } catch (error) {
    console.error('❌ Error fetching metadata:', error);
    return {};
  }
}

// Attach metadata to tokens
export async function enrichTokensWithMetadata(tokens) {
  const mintAddresses = [...new Set(tokens.map(t => t.mint))];
  const metadataMap = await fetchTokenMetadata(mintAddresses);
  
  return tokens.map(token => ({
    ...token,
    metadata: metadataMap[token.mint] || null
  }));
}

// Calculate scam scores
async function calculateAllScamScores(tokens) {
  // Import here to avoid circular dependency
  const { calculateScamScore } = await import('./scamDetection');
  
  const tokensWithScores = await Promise.all(
    tokens.map(async (token) => {
      const scamResult = await calculateScamScore(token);
      return {
        ...token,
        scamScore: scamResult.score,
        scamReasons: scamResult.reasons,
        scamConfidence: scamResult.confidence
      };
    })
  );
  
  return tokensWithScores;
}

// Helper: Check if token has approval
export function hasApproval(token) {
  return token.delegate !== null && token.delegate !== undefined;
}

// Helper: Format balance
export function formatTokenBalance(token) {
  if (!token || token.balance === 0) return '0';
  
  if (token.balance < 0.0001) {
    return token.balance.toExponential(2);
  }
  
  if (token.balance >= 1000000) {
    return (token.balance / 1000000).toFixed(2) + 'M';
  }
  if (token.balance >= 1000) {
    return (token.balance / 1000).toFixed(2) + 'K';
  }
  
  return token.balance.toFixed(4);
}