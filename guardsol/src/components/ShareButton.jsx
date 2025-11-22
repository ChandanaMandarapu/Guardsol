import React from 'react';

export default function ShareButton({ score }) {
    const handleShare = () => {
        const text = `I just scanned my wallet with GuardSol! My security score is ${score}/100. 🛡️\n\nCheck your wallet security here:`;
        const url = window.location.origin; // Or the actual deployed URL
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

        window.open(twitterUrl, '_blank');
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-semibold rounded-lg transition-colors shadow-sm"
            title="Share on Twitter"
        >
            <span>🐦</span>
            <span className="hidden sm:inline">Share Score</span>
        </button>
    );
}
