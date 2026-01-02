
import React, { useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { parseToken2022 } from '../parser';
import { calculateNTGRisk } from '../riskEngine';
import { RWA_PRESETS } from '../presets';
import NeonButton from '../../components/UI/NeonButton';

import { submitVote, getTokenVotes } from '../votingService';
import { useWallet } from '@solana/wallet-adapter-react';

export default function NTGDashboard() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [inputAddress, setInputAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [votes, setVotes] = useState({ flags: 0, verifications: 0, recentVotes: [] });
    const [votingLoading, setVotingLoading] = useState(false);

    const handleScan = async (addressToScan = inputAddress) => {
        if (!addressToScan) return;

        setLoading(true);
        setError(null);
        setResult(null);
        setInputAddress(addressToScan);

        try {
            // validate address
            new PublicKey(addressToScan);

            // Fetch votes in parallel
            getTokenVotes(addressToScan).then(setVotes);

            const parseResult = await parseToken2022(addressToScan, connection);

            let riskAnalysis = null;
            if (parseResult.isToken2022) {
                riskAnalysis = calculateNTGRisk(parseResult.extensions);
            }

            setResult({
                ...parseResult,
                riskAnalysis
            });

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to scan token");
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (type) => {
        if (!publicKey) return alert("Please connect wallet to vote");
        setVotingLoading(true);
        const res = await submitVote(inputAddress, publicKey.toString(), type, "User vote via NTG UI");
        if (res.success) {
            // Refresh votes
            getTokenVotes(inputAddress).then(setVotes);
        } else {
            alert("Vote failed (Supabase table might be missing?): " + res.error);
        }
        setVotingLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 font-mono">
            <div className="max-w-4xl mx-auto">

                {/* HEADER */}
                <div className="mb-8 text-center border-b border-cyan-900/30 pb-6">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">
                        NTG GuardSol
                    </h1>
                    <p className="text-gray-400">Token-2022 RWA Risk Scanner</p>
                    <div className="mt-2 text-xs text-cyan-500 bg-cyan-900/20 inline-block px-3 py-1 rounded-full border border-cyan-800">
                        Powered by Token-2022 Extensions
                    </div>
                </div>

                {/* PRESETS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {RWA_PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => handleScan(preset.address)}
                            className="flex items-center gap-3 p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:bg-gray-800 hover:border-cyan-500/50 transition-all group text-left"
                        >
                            <span className="text-2xl">{preset.icon}</span>
                            <div>
                                <div className="font-bold text-gray-200 group-hover:text-cyan-400">{preset.name}</div>
                                <div className="text-xs text-gray-500">{preset.description}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* SCANNER INPUT */}
                <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Enter Token-2022 Mint Address..."
                            className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-cyan-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
                            value={inputAddress}
                            onChange={(e) => setInputAddress(e.target.value)}
                        />
                        <NeonButton onClick={() => handleScan()} disabled={loading} className="md:w-32 justify-center">
                            {loading ? 'SCANNING...' : 'SCAN'}
                        </NeonButton>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-sm">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* RESULTS */}
                {result && (
                    <div className="animate-fade-in space-y-6">

                        {/* STATUS HEADER */}
                        <div className="flex items-center justify-between p-4 bg-gray-900/60 rounded-xl border border-gray-800">
                            <div>
                                <div className="text-sm text-gray-500 uppercase tracking-wider">Token Standard</div>
                                <div className={`text-xl font-bold ${result.isToken2022 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                    {result.isToken2022 ? 'Token-2022 (Verified)' : 'Legacy / Parsing Failed'}
                                </div>
                            </div>
                            {result.riskAnalysis && (
                                <div className="text-right">
                                    <div className="text-sm text-gray-500 uppercase tracking-wider">Risk Level</div>
                                    <div className={`text-2xl font-black ${result.riskAnalysis.level === 'CRITICAL' ? 'text-red-500' :
                                        result.riskAnalysis.level === 'HIGH' ? 'text-orange-500' :
                                            result.riskAnalysis.level === 'MEDIUM' ? 'text-yellow-500' : 'text-emerald-500'
                                        }`}>
                                        {result.riskAnalysis.level} ({result.riskAnalysis.score}%)
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RISK BREAKDOWN */}
                        {result.riskAnalysis && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* EXTENSIONS FOUND */}
                                <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                    <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                                        🔍 Detected Extensions
                                    </h3>
                                    {Object.keys(result.extensions).length > 0 ? (
                                        <ul className="space-y-3">
                                            {Object.entries(result.extensions).map(([ext, val]) => (
                                                <li key={ext} className="flex items-start gap-2 p-2 bg-gray-900/50 rounded border border-gray-800/50">
                                                    <span className="text-cyan-400">●</span>
                                                    <div>
                                                        <span className="text-gray-200 font-medium block">{ext}</span>
                                                        <span className="text-xs text-gray-500 font-mono break-all">{JSON.stringify(val).substring(0, 50)}...</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-gray-500 italic">No extensions found.</div>
                                    )}
                                </div>

                                {/* SECURITY FEEDBACK */}
                                <div className="bg-black/40 p-6 rounded-xl border border-gray-800">
                                    <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                                        🛡️ Risk Analysis
                                    </h3>
                                    {result.riskAnalysis.breakdown.length > 0 ? (
                                        <ul className="space-y-3">
                                            {result.riskAnalysis.breakdown.map((risk, idx) => (
                                                <li key={idx} className="p-3 bg-red-900/10 border border-red-900/30 rounded-lg">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-red-400 font-bold">{risk.label}</span>
                                                        <span className="text-xs bg-red-900/40 text-red-300 px-2 py-0.5 rounded">+{risk.score} Risk</span>
                                                    </div>
                                                    <div className="text-sm text-gray-400">{risk.desc}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-emerald-400 flex items-center gap-2 p-4 bg-emerald-900/10 border border-emerald-900/30 rounded-lg">
                                            <span>✅</span> No critical risks detected via extensions.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* COMMUNITY SENTIMENT */}
                <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-bold text-gray-300 mb-4 flex items-center gap-2">
                        🗳️ Community Sentiment (Quadratic Voting)
                    </h3>
                    <div className="flex items-center gap-8">
                        <div className="flex-1 p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-center">
                            <div className="text-3xl font-bold text-red-500">{votes.flags}</div>
                            <div className="text-xs uppercase text-red-400">Bad Issuer Flags</div>
                            <button
                                onClick={() => handleVote('flag_bad')}
                                disabled={votingLoading}
                                className="mt-2 w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-bold transition-colors"
                            >
                                🚩 FLAG AS RISK
                            </button>
                        </div>
                        <div className="flex-1 p-4 bg-emerald-900/20 border border-emerald-900/50 rounded-lg text-center">
                            <div className="text-3xl font-bold text-emerald-500">{votes.verifications}</div>
                            <div className="text-xs uppercase text-emerald-400">Safe Verifications</div>
                            <button
                                onClick={() => handleVote('verify_safe')}
                                disabled={votingLoading}
                                className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-bold transition-colors"
                            >
                                ✅ VERIFY SAFE
                            </button>
                        </div>
                    </div>
                    {!publicKey && <div className="text-center mt-3 text-xs text-gray-500">Connect wallet to vote</div>}
                </div>
            </div>
        </div>
    );
}
