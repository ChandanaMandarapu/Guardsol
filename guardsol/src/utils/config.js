// Centralized config for all environment variables hehe took help from GPT
export const config = {
  // Solana Network
  network: process.env.REACT_APP_NETWORK || 'mainnet-beta',
  
  // Multiple RPC endpoints - THESE ACTUALLY WORK!
  rpcEndpoints: [
    // Try QuickNode free tier first (most reliable)
    'https://solana-mainnet.rpc.extrnode.com',
    
    // Backup: Public endpoints that don't require auth
    'https://api.mainnet-beta.solana.com',
    'https://solana.public-rpc.com',
    
    // Last resort: Your Helius (if it works)
    `https://mainnet.helius-rpc.com/?api-key=${process.env.REACT_APP_HELIUS_KEY || ''}`,
  ],
  
  // Current RPC index (tracks which RPC we're using)
  currentRpcIndex: 0,
  
  // Helius (keeping for reference)
  heliusKey: process.env.REACT_APP_HELIUS_KEY || '',
  heliusRpcUrl: `https://mainnet.helius-rpc.com/?api-key=${process.env.REACT_APP_HELIUS_KEY}`,
  
  // Supabase
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || '',
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
  
  // Token Program ID (constant for all SPL tokens)
  tokenProgramId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  
  // Get next RPC endpoint (rotates through the list)
  getNextRpc() {
    const rpc = this.rpcEndpoints[this.currentRpcIndex];
    this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcEndpoints.length;
    console.log(`🔄 Trying RPC #${this.currentRpcIndex}: ${rpc.substring(0, 50)}...`);
    return rpc;
  }
};

// Validate config on startup
export function validateConfig() {
  const errors = [];
  
  if (!config.supabaseUrl) errors.push('Missing REACT_APP_SUPABASE_URL');
  if (!config.supabaseAnonKey) errors.push('Missing REACT_APP_SUPABASE_ANON_KEY');
  
  // Helius key is optional now since we have other RPCs
  if (!config.heliusKey) {
    console.warn('⚠️ No Helius key - will use public RPCs only');
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration errors:', errors);
    alert('Missing environment variables. Check .env file.');
    return false;
  }
  
  console.log('✅ Configuration validated');
  return true;
}