import { Transaction, PublicKey } from '@solana/web3.js';
import { createRevokeInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { connection } from './solana';
import { supabase } from './supabaseClient';

/**
 * Revoke a single token approval
 * @param {string} tokenAccountAddress - Token account with approval
 * @param {Object} wallet - Connected wallet object
 * @returns {Promise<Object>} Result with success/error
 */
export async function revokeApproval(tokenAccountAddress, wallet) {
  console.log('🗑️ Starting revoke for:', tokenAccountAddress.slice(0, 8));

  try {
    // VALIDATE INPUTS
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    if (!wallet.signTransaction) {
      throw new Error('Wallet does not support signing transactions');
    }

    // CREATE PUBLIC KEYS
    const tokenAccount = new PublicKey(tokenAccountAddress);
    const owner = wallet.publicKey;

    console.log('📝 Creating revoke instruction...');

    // CREATE REVOKE INSTRUCTION
    const revokeInstruction = createRevokeInstruction(
      tokenAccount,      // Token account to revoke from
      owner,             // Owner of the token account
      [],                // No multisig signers needed
      TOKEN_PROGRAM_ID   // SPL Token program
    );

    console.log('📦 Building transaction...');

    // CREATE TRANSACTION
    const transaction = new Transaction();
    transaction.add(revokeInstruction);

    // GET LATEST BLOCKHASH
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = owner;

    console.log('✍️ Requesting wallet signature...');

    // SIGN TRANSACTION
    const signedTransaction = await wallet.signTransaction(transaction);

    console.log('📡 Sending transaction to network...');

    // SEND TRANSACTION
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      }
    );

    console.log('⏳ Waiting for confirmation...');
    console.log('Signature:', signature);

    // WAIT FOR CONFIRMATION
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight
      },
      'confirmed'
    );

    // CHECK FOR ERRORS
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log('✅ Revoked successfully!');

    // Update approval history
    try {
      await supabase
        .from('approval_history')
        .update({ revoked_at: new Date().toISOString() })
        .eq('token_account_address', tokenAccountAddress)
        .is('revoked_at', null);
    } catch (err) {
      console.error('Failed to update approval history:', err);
    }

    return {
      success: true,
      signature,
      message: 'Approval revoked successfully!'
    };
  } catch (error) {
    console.error('❌ Error revoking approval:', error);
    // Parse error messages
    let errorMessage = 'Failed to revoke approval';
    if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction rejected by user';
    } else if (error.message.includes('Insufficient funds')) {
      errorMessage = 'Insufficient SOL for transaction fee (~0.00001 SOL needed)';
    } else if (error.message.includes('Blockhash not found')) {
      errorMessage = 'Transaction expired. Please try again';
    } else if (error.message.includes('custom program error: 0x1')) {
      errorMessage = 'Insufficient SOL for transaction fee';
    } else {
      errorMessage = error.message || 'Unknown error occurred';
    }
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Estimate transaction fee for revoke
 * @returns {number} Fee in SOL
 */
export async function estimateRevokeFee() {
  return 0.00001;
}

/**
 * Batch revoke multiple approvals
 * @param {Array<string>} tokenAccountAddresses - rray of token accounts
 * @param {Object} wallet - connected wallet ammaa
 * @returns {Promise<Object>} Result with success/error
 */
export async function batchRevokeApprovals(tokenAccountAddresses, wallet) {
  console.log('🗑️ Batch revoking:', tokenAccountAddresses.length, 'approvals');
  try {
    // VALIDATE
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    if (tokenAccountAddresses.length === 0) {
      throw new Error('No approvals selected');
    }
    // LIMIT CHECK (Solana transactions have size limits)
    if (tokenAccountAddresses.length > 20) {
      throw new Error('Too many approvals. Maximum 20 per batch. Please select fewer.');
    }
    const owner = wallet.publicKey;
    console.log('📝 Creating', tokenAccountAddresses.length, 'revoke instructions...');
    // CREATE ALL INSTRUCTIONS
    const instructions = tokenAccountAddresses.map(address => {
      const tokenAccount = new PublicKey(address);
      return createRevokeInstruction(
        tokenAccount,
        owner,
        [],
        TOKEN_PROGRAM_ID
      );
    });
    // BUILD TRANSACTION WITH ALL INSTRUCTIONS
    const transaction = new Transaction();
    instructions.forEach(instruction => transaction.add(instruction));
    // GET BLOCKHASH
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = owner;
    console.log('✍️ Requesting wallet signature for batch transaction...');
    // SIGN
    const signedTransaction = await wallet.signTransaction(transaction);
    console.log('📡 Sending batch transaction...');
    // SEND
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      }
    );
    console.log('⏳ Confirming batch transaction...');
    console.log('Signature:', signature);
    // CONFIRM
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight
      },
      'confirmed'
    );
    if (confirmation.value.err) {
      throw new Error('Batch transaction failed');
    }
    console.log('✅ All approvals revoked successfully!');
    return {
      success: true,
      signature,
      count: tokenAccountAddresses.length,
      message: `Successfully revoked ${tokenAccountAddresses.length} approval${tokenAccountAddresses.length !== 1 ? 's' : ''}!`
    };
  } catch (error) {
    console.error('❌ Batch revoke error:', error);
    let errorMessage = 'Failed to revoke approvals';
    if (error.message.includes('User rejected')) {
      errorMessage = 'Transaction rejected by user';
    } else if (error.message.includes('Too many')) {
      errorMessage = error.message; // Custom message about 20 limit
    } else if (error.message.includes('Insufficient funds')) {
      errorMessage = 'Insufficient SOL for transaction fees';
    } else {
      errorMessage = error.message || 'Unknown error occurred';
    }
    return {
      success: false,
      error: errorMessage
    };
  }
}