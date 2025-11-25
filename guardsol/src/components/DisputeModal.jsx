import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import GlassCard from './UI/GlassCard';
import NeonButton from './UI/NeonButton';

export default function DisputeModal({ isOpen, onClose, reportId, reportedAddress }) {
    const { publicKey } = useWallet();
    const [reason, setReason] = useState('False Positive');
    const [details, setDetails] = useState('');
    const [evidence, setEvidence] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // In a real app, we'd get the connected wallet address here
            const disputerAddress = publicKey ? publicKey.toString() : null;

            const response = await fetch('/api/submit-dispute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_id: reportId,
                    disputer_address: disputerAddress,
                    reason: `${reason}: ${details}`,
                    evidence_link: evidence
                })
            });

            if (!response.ok) throw new Error('Failed to submit dispute');

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setDetails('');
                setEvidence('');
            }, 2000);

        } catch (err) {
            console.error(err);
            setError('Failed to submit dispute. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <GlassCard className="max-w-md w-full border-neon-red/30 shadow-[0_0_30px_rgba(255,59,48,0.2)]">

                <div className="bg-neon-red/10 p-4 border-b border-neon-red/30 flex justify-between items-center">
                    <h3 className="font-bold text-neon-red flex items-center gap-2">
                        <span className="filter drop-shadow-[0_0_5px_rgba(255,59,48,0.5)]">⚖️</span> Dispute Report
                    </h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-white text-xl transition-colors">✕</button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="text-5xl mb-4 filter drop-shadow-[0_0_10px_rgba(0,255,175,0.5)]">✅</div>
                            <h4 className="text-xl font-bold text-neon-green">Dispute Submitted</h4>
                            <p className="text-text-secondary mt-2">The community will review your evidence.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Reported Address</label>
                                <div className="bg-dark-bg/50 p-2 rounded text-sm font-mono text-text-secondary break-all border border-white/5">
                                    {reportedAddress}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Reason for Dispute</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg p-2 text-white focus:ring-2 focus:ring-neon-red focus:border-neon-red outline-none transition-all"
                                >
                                    <option>False Positive</option>
                                    <option>Incorrect Scam Type</option>
                                    <option>No Longer Malicious</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Additional Details</label>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg p-2 text-white focus:ring-2 focus:ring-neon-red focus:border-neon-red outline-none transition-all h-24 placeholder-text-muted"
                                    placeholder="Explain why this report is incorrect..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white mb-1">Evidence (Optional)</label>
                                <input
                                    type="url"
                                    value={evidence}
                                    onChange={(e) => setEvidence(e.target.value)}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg p-2 text-white focus:ring-2 focus:ring-neon-red focus:border-neon-red outline-none transition-all placeholder-text-muted"
                                    placeholder="https://..."
                                />
                            </div>

                            {error && (
                                <div className="text-neon-red text-sm bg-neon-red/10 p-2 rounded border border-neon-red/30">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <NeonButton
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="flex-1"
                                >
                                    Cancel
                                </NeonButton>
                                <NeonButton
                                    type="submit"
                                    variant="danger"
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    {loading ? 'Submitting...' : 'Submit Dispute'}
                                </NeonButton>
                            </div>

                        </form>
                    )}
                </div>

            </GlassCard>
        </div>
    );
}
