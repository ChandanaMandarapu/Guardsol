
import React, { useState } from 'react';
import { traceFundFlow } from '../../utils/gSigTracer';
import { useConnection } from '@solana/wallet-adapter-react';
import NeonButton from '../../components/UI/NeonButton';

const GSigVisualizer = () => {
    const { connection } = useConnection();
    const [targetAddress, setTargetAddress] = useState('');
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(false);

    const startTrace = async () => {
        if (!targetAddress) return;
        setLoading(true);
        setGraphData(null);
        try {
            const data = await traceFundFlow(targetAddress, connection, 1); // Depth 1 for performance in web UI
            setGraphData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const renderNode = (node, depth = 0) => {
        if (!node) return null;
        return (
            <div key={node.address} style={{ marginLeft: depth * 20 }} className="border-l border-cyan-500/30 pl-4 my-2 animate-fade-in">
                <div className="bg-gray-900/50 p-2 rounded-lg border border-gray-800 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1 rounded font-mono">NODE_{depth}</span>
                        <span className="text-xs font-mono text-gray-300">{node.address}</span>
                    </div>
                    {node.interactions?.length > 0 && (
                        <div className="text-[10px] text-red-400 flex flex-wrap gap-2">
                            {node.interactions.map((int, i) => (
                                <span key={i} className="bg-red-900/10 px-1 rounded">
                                    → {int.to.slice(0, 4)}... ({int.amount})
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                {node.children && node.children.map(child => renderNode(child, depth + 1))}
            </div>
        );
    };

    return (
        <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-6 flex items-center gap-2">
                <span className="animate-pulse">🧬</span> G-SIG Intelligence Portal
            </h2>

            <div className="flex gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Enter Suspicious Address to trace..."
                    className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-cyan-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                />
                <NeonButton onClick={startTrace} disabled={loading}>
                    {loading ? 'TRACING...' : 'START G-SIG TRACE'}
                </NeonButton>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center p-12 text-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-cyan-400 animate-pulse font-mono uppercase tracking-widest text-xs">
                        Tracing Fund Flow Across Clusters...
                    </p>
                </div>
            )}

            {graphData && (
                <div className="bg-black/40 p-4 rounded-xl border border-cyan-900/20 max-h-[500px] overflow-y-auto">
                    {renderNode(graphData)}
                </div>
            )}

            {!graphData && !loading && (
                <div className="border border-dashed border-gray-800 rounded-xl p-12 text-center text-gray-500 italic">
                    G-SIG is idle. Enter an address to visualize the attacker cluster network.
                </div>
            )}
        </div>
    );
};

export default GSigVisualizer;
