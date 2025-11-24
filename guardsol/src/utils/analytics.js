import ReactGA from 'react-ga4';

const GA_ID = process.env.REACT_APP_GA_ID;
const isProduction = process.env.NODE_ENV === 'production';

let initialized = false;

/**
 * Initialize Google Analytics
 */
export function initGA() {
    if (!GA_ID) {
        console.warn('⚠️ Google Analytics ID not configured');
        return;
    }

    if (initialized) {
        return;
    }

    try {
        ReactGA.initialize(GA_ID, {
            testMode: !isProduction,
            gaOptions: {
                anonymizeIp: true
            }
        });
        initialized = true;
        console.log('✅ Google Analytics initialized');
    } catch (error) {
        console.error('❌ GA initialization error:', error);
    }
}

/**
 * Track page view
 */
export function trackPageView(path) {
    if (!initialized) return;

    try {
        ReactGA.send({ hitType: 'pageview', page: path });
        console.log('📊 Page view tracked:', path);
    } catch (error) {
        console.error('❌ GA page view error:', error);
    }
}

/**
 * Track event
 */
export function trackEvent(category, action, label, value) {
    if (!initialized) return;

    try {
        ReactGA.event({
            category,
            action,
            label,
            value
        });
        console.log('📊 Event tracked:', { category, action, label });
    } catch (error) {
        console.error('❌ GA event error:', error);
    }
}

// Predefined tracking functions for common events

export function trackWalletConnected(walletType) {
    trackEvent('Wallet', 'Connected', walletType);
}

export function trackWalletDisconnected() {
    trackEvent('Wallet', 'Disconnected');
}

export function trackWalletScanned(tokenCount) {
    trackEvent('Scan', 'Wallet Scanned', 'Token Count', tokenCount);
}

export function trackApprovalFound(riskLevel) {
    trackEvent('Security', 'Approval Found', riskLevel);
}

export function trackApprovalRevoked(riskLevel) {
    trackEvent('Security', 'Approval Revoked', riskLevel);
}

export function trackScamReported(reason) {
    trackEvent('Network', 'Scam Reported', reason);
}

export function trackVoteCast(voteType) {
    trackEvent('Network', 'Vote Cast', voteType);
}

export function trackRiskScoreCalculated(score) {
    trackEvent('Analysis', 'Risk Score Calculated', 'Score', score);
}

export function trackExportPDF() {
    trackEvent('Export', 'PDF Downloaded');
}

export function trackExportCSV() {
    trackEvent('Export', 'CSV Downloaded');
}

export function trackShareTwitter() {
    trackEvent('Social', 'Shared on Twitter');
}
