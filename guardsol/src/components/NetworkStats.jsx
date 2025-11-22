import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

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
            // Total Reports
            const { count: totalReports } = await supabase
                .from('scam_reports')
                .select('*', { count: 'exact', head: true });

            // Verified Reports
            const { count: verifiedReports } = await supabase
                .from('scam_reports')
                .select('*', { count: 'exact', head: true })
                .eq('verified', true);

            // Active Users (Proxy via reputation table)
            const { count: activeUsers } = await supabase
                .from('user_reputation')
                .select('*', { count: 'exact', head: true });

            // Recent Reports
            const { data: recentReports } = await supabase
                .from('scam_reports')
                .select('id, reported_address, scam_type, created_at, verified')
                .order('created_at', { ascending: false })
                .limit(5);

            setStats({
                stats: {
                    totalReports: totalReports || 0,
                    verifiedReports: verifiedReports || 0,
                    activeUsers: activeUsers || 0,
                    scamsPrevented: (verifiedReports || 0) * 12
                },
                recentReports: recentReports || []
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching network stats:', err);
            setError('Failed to load network stats');
        } finally {
            setLoading(false);
        }
    }

    if (error || !stats) return null;

    const { stats: metrics, recentReports } = stats;

    return (
        <div className="mb-12 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">🛡️ Network Status</h2>
                <p className="text-gray-500">Real-time protection metrics from the GuardSol community</p>
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

            {/* Live Feed */}
            {recentReports && recentReports.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            Live Reports Feed
                        </h3>
                        <span className="text-xs text-gray-500">Auto-updating</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentReports.map((report) => (
                            <div key={report.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <span className="text-xl">🚨</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">
                                            {report.scam_type || 'Suspicious Activity'}
                                        </p>
                                        <p className="text-xs text-gray-500 font-mono">
                                            {report.reported_address.slice(0, 4)}...{report.reported_address.slice(-4)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${report.verified
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {report.verified ? 'Verified' : 'Pending'}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(report.created_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        indigo: 'bg-indigo-50 text-indigo-600',
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
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
                <p className="text-2xl font-bold text-gray-900">
                    {value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">
                    {label}
                </p>
            </div>
        </div>
    );
}
