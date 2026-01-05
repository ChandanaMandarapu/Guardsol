
// REAL TOKEN PRESETS 


export const RWA_PRESETS = [
    {
        name: 'PayPal USD (PYUSD)',
        address: '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo',
        icon: '💵',
        description: 'Official PayPal USD Stablecoin (Token-2022)'
    },
    {
        name: 'USDC (Circle)',
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        icon: '💰',
        description: 'USD Coin – most liquid stablecoin on Solana'
    },
    {
        name: 'Bonk (BONK)',
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        icon: '🐕',
        description: 'Popular Solana memecoin'
    },
    {
        name: 'Jupiter (JUP)',
        address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        icon: '🪐',
        description: 'Jupiter Aggregator governance token'
    },
    {
        name: 'Wrapped SOL (WSOL)',
        address: 'So11111111111111111111111111111111111111112',
        icon: '◎',
        description: 'Wrapped Solana (SPL version)'
    },
    {
        name: 'Raydium (RAY)',
        address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        icon: '🌊',
        description: 'Raydium DEX governance token'
    }
];

// KNOWN SCAM ADDRESSES (Demo / Testing)

export const KNOWN_SCAM_EXAMPLES = [
    {
        name: 'Fake BONK',
        address: '6vfn2EF1Gd3sGRYqLPp5k9B3LJCvz6wD8nk5yxKQpump',
        icon: '🚨',
        description: 'Known scam token (test address)'
    },
    {
        name: 'Fake USDC',
        address: 'EcmuMM9Oj1zOYFxTXb3s7J1TRKhdhg4L6vs3gfSYump',
        icon: '⚠️',
        description: 'Fake stablecoin (test address)'
    }
];

// HELPERS
export function getAllPresetAddresses() {
    return [...RWA_PRESETS, ...KNOWN_SCAM_EXAMPLES].map(p => p.address);
}

export function findPresetByAddress(address) {
    if (!address) return null;

    return [...RWA_PRESETS, ...KNOWN_SCAM_EXAMPLES].find(
        p => p.address.toLowerCase() === address.toLowerCase()
    );
}
