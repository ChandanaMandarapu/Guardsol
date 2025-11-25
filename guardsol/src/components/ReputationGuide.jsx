import React from 'react';
import GlassCard from './UI/GlassCard';
import NeonButton from './UI/NeonButton';

export default function ReputationGuide({ onClose }) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto border-neon-purple/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]">

                {/* Header */}
                <div className="bg-neon-purple/10 p-6 rounded-t-xl border-b border-neon-purple/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                <span className="filter drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">🛡️</span>
                                Reputation System
                            </h2>
                            <p className="text-text-secondary mt-1">Become a Guardian of the Solana Ecosystem</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-text-secondary hover:text-white rounded-full p-1 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-8">

                    {/* Badges Section */}
                    <section>
                        <h3 className="text-xl font-bold text-white mb-4">🏆 Ranks & Badges</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-3">
                                <div className="text-3xl">👶</div>
                                <div>
                                    <p className="font-bold text-white">Rookie</p>
                                    <p className="text-sm text-text-muted">0 - 19 Points</p>
                                </div>
                            </div>
                            <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-4 flex items-center gap-3">
                                <div className="text-3xl">🔭</div>
                                <div>
                                    <p className="font-bold text-neon-blue">Scout</p>
                                    <p className="text-sm text-neon-blue/70">20 - 49 Points</p>
                                </div>
                            </div>
                            <div className="bg-neon-purple/10 border border-neon-purple/30 rounded-lg p-4 flex items-center gap-3">
                                <div className="text-3xl">🛡️</div>
                                <div>
                                    <p className="font-bold text-neon-purple">Guardian</p>
                                    <p className="text-sm text-neon-purple/70">50 - 99 Points</p>
                                </div>
                            </div>
                            <div className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-lg p-4 flex items-center gap-3">
                                <div className="text-3xl">👑</div>
                                <div>
                                    <p className="font-bold text-neon-yellow">Legend</p>
                                    <p className="text-sm text-neon-yellow/70">100+ Points</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How to Earn Section */}
                    <section>
                        <h3 className="text-xl font-bold text-white mb-4">📈 How to Earn Points</h3>
                        <div className="space-y-4">

                            <div className="flex gap-4">
                                <div className="bg-neon-green/20 text-neon-green w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 border border-neon-green/30">
                                    +5
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Report a Scam</h4>
                                    <p className="text-text-secondary text-sm">
                                        Submit a verified scam report. Points are awarded after community verification.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-neon-blue/20 text-neon-blue w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 border border-neon-blue/30">
                                    +1
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Vote Correctly</h4>
                                    <p className="text-text-secondary text-sm">
                                        Vote on reported scams. Earn points when the community consensus agrees with your vote.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="bg-neon-purple/20 text-neon-purple w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 border border-neon-purple/30">
                                    +10
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Maintain Security</h4>
                                    <p className="text-text-secondary text-sm">
                                        Keep your wallet risk score above 80 for 7 consecutive days. (Coming Soon)
                                    </p>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Penalties Section */}
                    <section className="bg-neon-red/10 rounded-lg p-4 border border-neon-red/30">
                        <h3 className="text-lg font-bold text-neon-red mb-2">⚠️ Penalties</h3>
                        <ul className="list-disc list-inside text-text-primary text-sm space-y-1">
                            <li><strong className="text-white">-10 Points:</strong> Submitting a false report (spam).</li>
                            <li><strong className="text-white">-2 Points:</strong> Voting against the community consensus consistently.</li>
                        </ul>
                    </section>

                </div>

                {/* Footer */}
                <div className="bg-dark-bg/50 p-4 rounded-b-xl text-center border-t border-white/10">
                    <NeonButton
                        onClick={onClose}
                        className="px-8"
                    >
                        Got it!
                    </NeonButton>
                </div>

            </GlassCard>
        </div>
    );
}
