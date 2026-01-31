
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

/**
 * Parses a Token-2022 account to extract extensions
 * @param {string} tokenAddress - The mint address of the token
 * @param {Connection} connection - Solana connection object
 * @returns {Promise<Object>} The parsed extensions and token info
 */
export async function parseToken2022(tokenAddress, connection) {
    // 🧪 DEMO INTERCEPTION
    if (tokenAddress === 'BEAST71RyF5TwQTDswXBWskijP2LD4cU6ti9RyF5Tw') {
        return {
            isToken2022: true,
            extensions: {
                'confidentialTransferMint': {
                    'auditorElgamalPubkey': '6vfn2EF1Gd3sGRYqLPp5k9B3LJCvz6wD8nk5yxKQpump', // Mocking a known scammer auditor
                    'authority': '2apBGMSS6ti9RyF5TwQTDswXBWskijP2LD4cU...'
                },
                'transferHook': { 'programId': 'Hook111111111111111111111111111111111111111' }
            },
            mintAuthority: '2apBGMSS6ti9RyF5TwQTDswXBWskijP2LD4cU...',
            supply: '1000000',
            decimals: 9
        };
    }
    try {
        const pubkey = new PublicKey(tokenAddress);

        const accountInfo = await connection.getParsedAccountInfo(pubkey);

        if (!accountInfo.value) {
            throw new Error('Token not found');
        }

        const data = accountInfo.value.data;

        // checks if it's actually a Token-2022 token
        if (accountInfo.value.owner.toString() !== TOKEN_2022_PROGRAM_ID.toString()) {
            return {
                isToken2022: false,
                extensions: {},
                programId: accountInfo.value.owner.toString()
            };
        }


        const parsed = data.parsed;
        const extensions = parsed.info?.extensions || [];


        const extensionMap = {};
        if (Array.isArray(extensions)) {
            extensions.forEach(ext => {
                // For Beast Mode: Capture full state details (like auditorEncryptionPubkey)
                extensionMap[ext.extension] = ext.state || true;
            });
        }

        return {
            isToken2022: true,
            extensions: extensionMap,
            mintAuthority: parsed.info.mintAuthority,
            supply: parsed.info.supply,
            decimals: parsed.info.decimals
        };

    } catch (error) {
        console.error('Error parsing Token-2022:', error);
        throw error;
    }
}
