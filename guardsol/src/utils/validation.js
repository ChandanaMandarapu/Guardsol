import { PublicKey } from '@solana/web3.js';

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address) {
    if (!address || typeof address !== 'string') {
        return false;
    }

    try {
        new PublicKey(address);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate reason text
 */
export function isValidReason(reason) {
    if (!reason || typeof reason !== 'string') {
        return false;
    }

    const trimmed = reason.trim();
    return trimmed.length >= 5 && trimmed.length <= 500;
}

/**
 * Validate URL
 */
export function isValidURL(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Sanitize text input (prevent XSS)
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text
        .trim()
        .replace(/[<>]/g, '') // Remove < and >
        .substring(0, 500); // Max length
}

/**
 * Validate signature
 */
export function isValidSignature(signature) {
    if (!signature || typeof signature !== 'string') {
        return false;
    }

    // Base58 encoded signature should be ~88 characters
    return signature.length >= 80 && signature.length <= 100;
}
