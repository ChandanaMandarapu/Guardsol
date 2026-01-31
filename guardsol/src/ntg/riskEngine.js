
/**
 * Calculates risk score for Token-2022 assets
 * @param {Object} extensions 
 * @returns {Object} Risk score and breakdown
 */
export function calculateNTGRisk(extensions) {
    let score = 0;
    const breakdown = [];


    if (extensions['permanentDelegate']) {
        score += 80;
        breakdown.push({ label: 'Permanent Delegate', score: 80, desc: 'Owner can seize or burn your tokens without permission.' });
    }

    const isConfidential = extensions['confidentialTransfer'] || extensions['confidentialTransferMint'] || extensions['confidentialTransferFeeConfig'];

    if (isConfidential) {
        score += 40;
        breakdown.push({ label: 'Confidential Transfer', score: 40, desc: 'Balance and amounts are encrypted (Audit difficulty High).' });
    }

    if (extensions['transferHook']) {
        score += 60;
        breakdown.push({ label: 'Transfer Hook', score: 60, desc: 'External program controls every transfer (Potential Lockup).' });
    }

    if (extensions['nonTransferable']) {
        score += 90;
        breakdown.push({ label: 'Non-Transferable', score: 90, desc: 'Token is locked to your wallet forever (Soulbound Scam).' });
    }

    if (extensions['transferFeeConfig']) {
        score += 20;
        breakdown.push({ label: 'Transfer Fee/Tax', score: 20, desc: 'Issuer takes a cut of every trade (can be set to 100%).' });
    }

    if (extensions['interestBearingConfig']) {
        score += 15;
        breakdown.push({ label: 'Interest Bearing', score: 15, desc: 'Token balance changes over time (can be used to manipulate supply).' });
    }

    if (extensions['cpiGuard']) {
        score += 5;
        breakdown.push({ label: 'CPI Guard', score: 5, desc: 'Restrictive cross-program interaction enabled.' });
    }

    if (extensions['defaultAccountState'] && extensions['defaultAccountState'].accountState === 'frozen') {
        score += 50;
        breakdown.push({ label: 'Frozen by Default', score: 50, desc: 'Users must be whitelisted to trade.' });
    }

    if (extensions['mintCloseAuthority']) {
        score += 15;
        breakdown.push({ label: 'Mint Close Authority', score: 15, desc: 'Mint can be shut down by authority.' });
    }

    if (!extensions['metadataPointer']) {
        score += 10;
        breakdown.push({ label: 'Anonymous Metadata', score: 10, desc: 'Token metadata is not standard/linked.' });
    }

    // ============================================
    // BEAST MODE: ZK-AUDIT EXCLUSIVE LOGIC
    // ============================================

    // 1. Opaque Trap Detection (ZK + Hook)
    // If a token is confidential AND has a custom transfer hook, it's extreme risk.
    if (isConfidential && extensions['transferHook']) {
        score += 30;
        breakdown.push({
            label: 'Opaque Trap Detected',
            score: 30,
            desc: 'DANGEROUS: ZK-Privacy combined with custom Program Logic. Logic can be malicious while ZK hides the proof.'
        });
    }

    // 2. Privacy Policy Decoder
    if (isConfidential) {
        // Check for auditor in any of the ZK extensions
        const ctState = extensions['confidentialTransfer'] || extensions['confidentialTransferMint'] || extensions['confidentialTransferFeeConfig'];
        const auditor = ctState.auditorEncryptionPubkey || ctState.auditorElgamalPubkey;

        if (auditor) {
            score += 10;
            breakdown.push({
                label: 'Centrally Privatized',
                score: 10,
                desc: `Auditor (${auditor.slice(0, 8)}...) can view ALL balances. Not fully decentralized privacy.`
            });
        } else {
            breakdown.push({
                label: 'Sovereign Privacy',
                score: 0,
                desc: 'User-Controlled Privacy: No master auditor detected. High privacy rating.'
            });
        }
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
