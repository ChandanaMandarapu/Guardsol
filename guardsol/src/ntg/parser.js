
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

/**
 * Parses a Token-2022 account to extract extensions
 * @param {string} tokenAddress - The mint address of the token
 * @param {Connection} connection - Solana connection object
 * @returns {Promise<Object>} The parsed extensions and token info
 */
export async function parseToken2022(tokenAddress, connection) {
    try {
        const pubkey = new PublicKey(tokenAddress);

        const accountInfo = await connection.getParsedAccountInfo(pubkey);

        if (!accountInfo.value) {
            throw new Error('Token not found');
        }

        const data = accountInfo.value.data;

        // Check if it's actually a Token-2022 token
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
