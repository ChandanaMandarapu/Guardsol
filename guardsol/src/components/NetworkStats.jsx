import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from './UI/GlassCard';

export default function NetworkStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
        // Refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    async function fetchStats() {
        try {
            // Use our new API endpoint
            const response = await fetch('/api/get-stats');
            if (!response.ok) throw new Error('Failed to fetch stats');

            const data = await response.json();
            setStats(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching network stats:', err);
            setError('Failed to load network stats');
        } finally {
            setLoading(false);
        }
    }

    if (error || !stats) return null;

    const { stats: metrics, chartData, topScams } = stats;

    return (
        <div className="mb-12 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <span className="filter drop-shadow-[0_0_8px_rgba(0,246,255,0.5)]">🛡️</span>
                    Network Status
                </h2>
                <p className="text-text-secondary">Real-time protection metrics from the GuardSol community</p>

                {/* Network Effect Banner */}
                <div className="mt-4 inline-block bg-neon-blue/10 border border-neon-blue/30 rounded-full px-4 py-1.5">
                    <p className="text-sm text-neon-blue font-medium flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue"></span>
                        </span>
                        Join {metrics.activeUsers.toLocaleString()} others securing the Solana ecosystem
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="Total Reports"
                    value={metrics.totalReports}
                    icon="📝"
                    color="blue"
                />
                <StatCard
                    label="Verified Scams"
                    value={metrics.verifiedReports}
                    icon="✅"
                    color="green"
                />
                <StatCard
                    label="Active Protectors"
                    value={metrics.activeUsers}
                    icon="users"
                    color="purple"
                />
                <StatCard
                    label="Est. Users Saved"
                    value={metrics.scamsPrevented}
                    icon="🛡️"
                    color="indigo"
                />
            </div>

            {/* Charts and Leaderboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Growth Chart */}
                <GlassCard className="p-6">
                    <h3 className="font-bold text-lg mb-6 text-white">📊 Weekly Activity</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke="#9CA3AF" />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="#9CA3AF" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        background: 'rgba(0,0,0,0.8)',
                                        color: '#fff'
                                    }}
                                />
                                <Bar dataKey="count" fill="#00F6FF" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Top Scams Leaderboard */}
                <GlassCard className="overflow-hidden">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="font-bold text-lg text-white">🚫 Top Detected Threats</h3>
                    </div>
                    <div className="divide-y divide-white/10">
                        {topScams && topScams.length > 0 ? (
                            topScams.map((scam, index) => (
                                <div key={index} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-neon-red/20 text-neon-red flex items-center justify-center font-bold text-sm border border-neon-red/30">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-mono text-sm font-medium text-white">
                                                {scam.address.slice(0, 4)}...{scam.address.slice(-4)}
                                            </p>
                                            <p className="text-xs text-text-secondary">{scam.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-white">{scam.count}</div>
                                        <div className="text-xs text-text-muted">Reports</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-text-secondary">
                                No threats detected yet.
                            </div>
                        )}
                    </div>
                </GlassCard>

            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    const colorClasses = {
        blue: 'bg-neon-blue/10 text-neon-blue border-neon-blue/30',
        green: 'bg-neon-green/10 text-neon-green border-neon-green/30',
        purple: 'bg-neon-purple/10 text-neon-purple border-neon-purple/30',
        indigo: 'bg-neon-blue/10 text-neon-blue border-neon-blue/30',
    };

    return (
        <GlassCard className="p-4 hover:shadow-[0_0_20px_rgba(0,246,255,0.1)] transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg border ${colorClasses[color]}`}>
                    {icon === 'users' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <span className="text-lg">{icon}</span>
                    )}
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-white">
                    {value.toLocaleString()}
                </p>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wide mt-1">
                    {label}
                </p>
            </div>
        </GlassCard>
    );
}
