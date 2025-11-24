import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">

                <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
                    <h3 className="font-bold text-red-800 flex items-center gap-2">
                        <span>⚖️</span> Dispute Report
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="text-5xl mb-4">✅</div>
                            <h4 className="text-xl font-bold text-gray-800">Dispute Submitted</h4>
                            <p className="text-gray-600 mt-2">The community will review your evidence.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reported Address</label>
                                <div className="bg-gray-100 p-2 rounded text-sm font-mono text-gray-600 break-all">
                                    {reportedAddress}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Dispute</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                >
                                    <option>False Positive</option>
                                    <option>Incorrect Scam Type</option>
                                    <option>No Longer Malicious</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                                <textarea
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 h-24"
                                    placeholder="Explain why this report is incorrect..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence (Optional)</label>
                                <input
                                    type="url"
                                    value={evidence}
                                    onChange={(e) => setEvidence(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                    placeholder="https://..."
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Dispute'}
                                </button>
                            </div>

                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}
