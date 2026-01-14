
/**
 * Calculates risk score for Token-2022 assets
 * @param {Object} extensions 
 * @returns {Object} Risk score and breakdown
 */
export function calculateNTGRisk(extensions) {
    let score = 0;
    const breakdown = [];

    
    if (extensions['permanentDelegate']) {
        score += 50;
        breakdown.push({ label: 'Permanent Delegate', score: 50, desc: 'Can seize/burn tokens at will' });
    }

    if (extensions['defaultAccountState'] && extensions['defaultAccountState'].accountState === 'frozen') {
        score += 40;
        breakdown.push({ label: 'Frozen by Default', score: 40, desc: 'Users must be whitelisted to trade' }); // typical for KYC'd RWA
    }

    // In Token-2022 "MintCloseAuthority" can be dangerous if misused, but standard for some.
    // "TransferFeeConfig" is just a tax, not necessarily a security risk, but extraction.
    if (extensions['transferFeeConfig']) {
        score += 10;
        breakdown.push({ label: 'Transfer Tax', score: 10, desc: 'Issuer takes a cut of every transfer' });
    }

    if (extensions['transferHook']) {
        score += 30;
        breakdown.push({ label: 'Transfer Hook', score: 30, desc: 'Programmable transfer logic (can block txn)' });
    }

    if (extensions['confidentialTransferMint']) {
        score += 10;
        breakdown.push({ label: 'Confidential Transfers', score: 10, desc: 'Privacy enabled (Audit difficulty)' });
    }

    
    if (!extensions['metadataPointer']) {
        score += 5;
        breakdown.push({ label: 'No Metadata Pointer', score: 5, desc: 'Metadata might be non-standard' });
    }

    score = Math.min(score, 100);

    
    let level = 'LOW';
    if (score > 75) level = 'CRITICAL';
    else if (score > 40) level = 'HIGH';
    else if (score > 20) level = 'MEDIUM';

    return {
        score,
        level,
        breakdown
    };
}
