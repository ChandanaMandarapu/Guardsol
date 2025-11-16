import { Transaction, PublicKey } from '@solana/web3.js';
import { createRevokeInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { connection } from './solana';

// Revoke single approval
export async function revokeApproval(tokenAccountAddress, wallet) {
  console.log('🗑️ Starting revoke:', tokenAccountAddress.slice(0, 8));
  
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    if (!wallet.signTransaction) {
      throw new Error('Wallet does not support signing');
    }
    
    const tokenAccount = new PublicKey(tokenAccountAddress);
    const owner = wallet.publicKey;
    
    console.log('📝 Creating revoke instruction...');
    
    const revokeInstruction = createRevokeInstruction(
      tokenAccount,
      owner,
      [],
      TOKEN_PROGRAM_ID
    );
    
    console.log('📦 Building transaction...');
    
    const transaction = new Transaction();
    transaction.add(revokeInstruction);
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = owner;
    
    console.log('✍️ Requesting signature...');
    
    const signedTransaction = await wallet.signTransaction(transaction);
    
    console.log('📡 Sending transaction...');
    
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      }
    );
    
    console.log('⏳ Waiting for confirmation...');
    console.log('Signature:', signature);
    
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight
      },
      'confirmed'
    );
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }
    
    console.log('✅ Revoked successfully!');
    
    return {
      success: true,
      signature,
      message: 'Approval revoked successfully!'
    };
    
  } catch (error) {
    console.error('❌ Error revoking:', error);
    
    let errorMessage = 'Failed to revoke approval';
    
    if (error.message.includes('User rejected')) {
      errorMessage = 'You rejected the transaction';
    } else if (error.message.includes('Insufficient funds')) {
      errorMessage = 'Insufficient SOL for transaction fee';
    } else if (error.message.includes('Blockhash not found')) {
      errorMessage = 'Transaction expired. Please try again';
    } else {
      errorMessage = error.message || 'Unknown error';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// Estimate fee
export async function estimateRevokeFee() {
  return 0.00001; // ~0.00001 SOL
}

// Batch revoke multiple approvals
export async function batchRevokeApprovals(tokenAccountAddresses, wallet) {
  console.log('🗑️ Batch revoke:', tokenAccountAddresses.length, 'approvals');
  
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const owner = wallet.publicKey;
    
    const instructions = tokenAccountAddresses.map(address => {
      const tokenAccount = new PublicKey(address);
      return createRevokeInstruction(
        tokenAccount,
        owner,
        [],
        TOKEN_PROGRAM_ID
      );
    });
    
    if (instructions.length > 20) {
      throw new Error('Too many approvals. Max 20 per batch.');
    }
    
    const transaction = new Transaction();
    instructions.forEach(inst => transaction.add(inst));
    
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = owner;
    
    console.log('✍️ Requesting signature...');
    
    const signedTransaction = await wallet.signTransaction(transaction);
    
    console.log('📡 Sending batch transaction...');
    
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      }
    );
    
    console.log('⏳ Waiting for confirmation...');
    
    const confirmation = await connection.confirmTransaction(
      {
        signature,
        blockhash,
        lastValidBlockHeight
      },
      'confirmed'
    );
    
    if (confirmation.value.err) {
      throw new Error(`Batch transaction failed`);
    }
    
    console.log('✅ All approvals revoked!');
    
    return {
      success: true,
      signature,
      count: tokenAccountAddresses.length,
      message: `Successfully revoked ${tokenAccountAddresses.length} approvals!`
    };
    
  } catch (error) {
    console.error('❌ Batch revoke error:', error);
    
    let errorMessage = 'Failed to revoke approvals';
    
    if (error.message.includes('User rejected')) {
      errorMessage = 'You rejected the transaction';
    } else if (error.message.includes('Too many')) {
      errorMessage = error.message;
    } else {
      errorMessage = error.message || 'Unknown error';
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}