import {
  Connection,
  Transaction,
  VersionedTransaction,
  PublicKey,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Public RPC (using Helius for reliability on Mainnet)
const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=6182eb9f-228b-4625-a950-515ac4d00748';
const connection = new Connection(RPC_URL, 'confirmed');

export async function simulateBase64Transaction(base64Tx) {
  try {
    const buffer = Buffer.from(base64Tx, 'base64');

    let tx;
    try {
      // Most modern txs
      tx = VersionedTransaction.deserialize(buffer);
    } catch {
      // Legacy fallback
      tx = Transaction.from(buffer);
    }

    const sim = await connection.simulateTransaction(tx, {
      sigVerify: false,
      replaceRecentBlockhash: true,
    });

    const riskAnalysis = analyzeTransaction(sim, tx);

    return {
      success: true,
      error: sim.value.err,
      logs: sim.value.logs || [],
      unitsConsumed: sim.value.unitsConsumed || 0,
      analysis: riskAnalysis,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

function analyzeTransaction(simResult, tx) {
  let score = 0;
  const reasons = [];

  if (simResult.value.err) {
    score += 20;
    reasons.push('Transaction would fail on-chain');
  }

  // Extract instructions (legacy + versioned)
  const instructions =
    tx.instructions ||
    tx.message?.instructions ||
    [];

  instructions.forEach((ix) => {
    try {
      const programId = ix.programId?.toBase58
        ? ix.programId.toBase58()
        : new PublicKey(ix.programIdIndex !== undefined
          ? tx.message.staticAccountKeys[ix.programIdIndex]
          : ix.programId
        ).toBase58();

      // SPL Token program
      if (programId === TOKEN_PROGRAM_ID.toBase58()) {
        const data = ix.data instanceof Uint8Array
          ? ix.data
          : Buffer.from(ix.data, 'base64');

        const instructionType = data[0];

        // Approve
        if (instructionType === 9) {
          score += 50;
          reasons.push(
            'Grants token approval (potential unlimited token spending)'
          );
        }

        // Transfer
        if (instructionType === 3) {
          score += 30;
          reasons.push('Transfers tokens out of your wallet');
        }
      }
    } catch {
      // Ignore parsing errors safely
    }
  });

  let verdict = 'SAFE';
  if (score > 70) verdict = 'DANGER';
  else if (score > 30) verdict = 'CAUTION';

  if (reasons.length === 0) {
    reasons.push('No obvious risks detected');
  }

  return {
    score: Math.min(score, 100),
    verdict,
    reasons,
  };
}
