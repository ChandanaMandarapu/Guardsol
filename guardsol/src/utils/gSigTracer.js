
import { Connection, PublicKey } from '@solana/web3.js';

/**
 * G-SIG Fund Flow Tracer
 * Recursively traces the flow of funds from a suspicious address
 * to identify "Attacker Clusters".
 */
export async function traceFundFlow(targetAddress, connection, depth = 3) {
    console.log(`[G-SIG] Tracing ${targetAddress} at depth ${depth}...`);

    try {
        const pubkey = new PublicKey(targetAddress);
        const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 20 });

        const cluster = {
            address: targetAddress,
            interactions: [],
            potentialMaliciousNodes: new Set(),
            riskScore: 0
        };

        for (const sigInfo of signatures) {
            const tx = await connection.getParsedTransaction(sigInfo.signature, {
                maxSupportedTransactionVersion: 0
            });

            if (!tx) continue;

            // Extract transfer logic to find where money is moving
            const instructions = tx.transaction.message.instructions;
            instructions.forEach(ix => {
                if (ix.program === 'spl-token' || ix.program === 'system') {
                    const info = ix.parsed?.info;
                    if (info && info.destination && info.destination !== targetAddress) {
                        cluster.interactions.push({
                            to: info.destination,
                            amount: info.amount || info.lamports,
                            type: ix.program,
                            signature: sigInfo.signature
                        });
                        cluster.potentialMaliciousNodes.add(info.destination);
                    }
                }
            });
        }

        // NEED TO DO - Recursive tracing logic for deeper clustering
        // This is where the "Intelligence Graph" comes alive

        return cluster;
    } catch (error) {
        console.error('[G-SIG] Trace Error:', error);
        return null;
    }
}
