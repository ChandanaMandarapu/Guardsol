import React, { useState, useEffect } from 'react';
const TIPS = [
  "🔒 Never share your private key or seed phrase.",
  "⚠️ GuardSol will never DM you first.",
  "🚫 Revoke unlimited token approvals regularly.",
  "🕵️ Verify URLs before connecting your wallet.",
  "🦊 Use a burner wallet for minting unknown NFTs."
];
const SecurityTicker = () => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="bg-neon-blue/10 border-b border-neon-blue/20 text-center py-2 overflow-hidden">
      <p className="text-sm text-neon-blue font-mono animate-pulse">
        🛡️ SECURITY TIP: <span className="text-gray-300">{TIPS[index]}</span>
      </p>
    </div>
  );
};
export default SecurityTicker;