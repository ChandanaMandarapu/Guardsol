// Standardized error messages across the application

export const ERROR_MESSAGES = {
    // Wallet Errors
    WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
    WALLET_CONNECTION_FAILED: 'Failed to connect wallet. Please try again.',
    WALLET_DISCONNECTED: 'Wallet disconnected',
    INVALID_WALLET_ADDRESS: 'Invalid wallet address',

    // Transaction Errors
    TRANSACTION_REJECTED: 'Transaction was rejected by user',
    TRANSACTION_FAILED: 'Transaction failed. Please try again.',
    INSUFFICIENT_FUNDS: 'Insufficient SOL for transaction fee (~0.00001 SOL needed)',
    BLOCKHASH_EXPIRED: 'Transaction expired. Please try again.',

    // Network Errors
    NETWORK_ERROR: 'Network error. Please check your connection.',
    RPC_ERROR: 'RPC connection failed. Trying backup...',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',

    // API Errors
    API_ERROR: 'API request failed. Please try again.',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please wait a moment.',
    UNAUTHORIZED: 'Unauthorized. Please connect your wallet.',
    FORBIDDEN: 'You do not have permission to perform this action.',

    // Data Errors
    DATA_NOT_FOUND: 'Data not found',
    INVALID_DATA: 'Invalid data provided',
    DATA_FETCH_FAILED: 'Failed to fetch data. Please refresh.',

    // Report Errors
    REPORT_ALREADY_EXISTS: 'You have already reported this address',
    REPORT_SUBMISSION_FAILED: 'Failed to submit report. Please try again.',
    INVALID_REPORT_REASON: 'Reason must be between 5 and 500 characters',

    // Approval Errors
    NO_APPROVALS_FOUND: 'No approvals found',
    REVOKE_FAILED: 'Failed to revoke approval. Please try again.',
    BATCH_REVOKE_FAILED: 'Failed to revoke some approvals',

    // Validation Errors
    INVALID_ADDRESS: 'Invalid Solana address',
    INVALID_SIGNATURE: 'Invalid signature',
    INVALID_URL: 'Invalid URL format',

    // Generic Errors
    UNKNOWN_ERROR: 'An unknown error occurred',
    TRY_AGAIN: 'Please try again'
};

export const SUCCESS_MESSAGES = {
    WALLET_CONNECTED: 'Wallet connected successfully',
    REPORT_SUBMITTED: 'Report submitted successfully',
    APPROVAL_REVOKED: 'Approval revoked successfully',
    VOTE_RECORDED: 'Vote recorded successfully',
    DATA_UPDATED: 'Data updated successfully'
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error) {
    const errorString = error?.message || error?.toString() || '';

    // Map technical errors to user-friendly messages
    if (errorString.includes('User rejected')) {
        return ERROR_MESSAGES.TRANSACTION_REJECTED;
    }

    if (errorString.includes('Insufficient funds') || errorString.includes('0x1')) {
        return ERROR_MESSAGES.INSUFFICIENT_FUNDS;
    }

    if (errorString.includes('Blockhash not found')) {
        return ERROR_MESSAGES.BLOCKHASH_EXPIRED;
    }

    if (errorString.includes('429') || errorString.includes('rate limit')) {
        return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
    }

    if (errorString.includes('401')) {
        return ERROR_MESSAGES.UNAUTHORIZED;
    }

    if (errorString.includes('403')) {
        return ERROR_MESSAGES.FORBIDDEN;
    }

    if (errorString.includes('Network') || errorString.includes('fetch')) {
        return ERROR_MESSAGES.NETWORK_ERROR;
    }

    if (errorString.includes('already reported')) {
        return ERROR_MESSAGES.REPORT_ALREADY_EXISTS;
    }

    // Return original message if no match
    return error?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
}
