// Centralized config for all environment variables
export const config = {
  // Solana Network
  network: process.env.REACT_APP_NETWORK || 'mainnet-beta',
  
  // Helius RPC
  heliusKey: process.env.REACT_APP_HELIUS_KEY || '',
  heliusRpcUrl: `https://mainnet.helius-rpc.com/?api-key=${process.env.REACT_APP_HELIUS_KEY}`,
  
  // Supabase
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL || '',
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
  
  // Token Program ID (constant for all SPL tokens)
  tokenProgramId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
};

// Validate config on startup
export function validateConfig() {
  const errors = [];
  
  if (!config.heliusKey) errors.push('Missing REACT_APP_HELIUS_KEY');
  if (!config.supabaseUrl) errors.push('Missing REACT_APP_SUPABASE_URL');
  if (!config.supabaseAnonKey) errors.push('Missing REACT_APP_SUPABASE_ANON_KEY');
  
  if (errors.length > 0) {
    console.error('❌ Configuration errors:', errors);
    alert('Missing environment variables. Check .env file.');
    return false;
  }
  
  console.log('✅ Configuration validated');
  return true;
}