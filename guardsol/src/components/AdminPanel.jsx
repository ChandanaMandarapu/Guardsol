import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { isAdmin, isDemoMode, getAllReports, getPendingReports, getVerifiedReports } from '../utils/admin';
import ReportCard from './ReportCard';
import GlassCard from './UI/GlassCard';
import NeonButton from './UI/NeonButton';

export default function AdminPanel() {
  const { publicKey, connected } = useWallet();

  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'verified'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0 });

  const adminWallet = publicKey?.toString();
  const isAdminUser = connected && isAdmin(adminWallet);
  const inDemoMode = isDemoMode(adminWallet);

  const loadReports = async () => {
    setLoading(true);
    try {
      let fetchedReports = [];
      if (filter === 'all') {
        fetchedReports = await getAllReports();
      } else if (filter === 'pending') {
        fetchedReports = await getPendingReports();
      } else if (filter === 'verified') {
        fetchedReports = await getVerifiedReports();
      }
      setReports(fetchedReports);

      // Update stats
      const all = await getAllReports();
      const pending = await getPendingReports();
      const verified = await getVerifiedReports();
      setStats({
        total: all.length,
        pending: pending.length,
        verified: verified.length
      });
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filter, connected, publicKey]); // Reload when filter or wallet changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
          <p className="text-lg text-neon-blue animate-pulse">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Demo Mode Banner */}
      {inDemoMode && (
        <GlassCard className="mb-6 border-neon-blue/30 bg-neon-blue/5">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-[0_0_5px_rgba(0,246,255,0.5)]">👀</span>
            <div className="flex-1">
              <h3 className="font-bold text-neon-blue">Viewing in Demo Mode</h3>
              <p className="text-sm text-text-secondary">
                {connected
                  ? 'You are viewing as a regular user. Admin actions are disabled.'
                  : 'Connect your admin wallet to approve/reject reports.'}
              </p>
            </div>
            {isAdminUser && (
              <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple text-sm font-bold rounded-full border border-neon-purple/30">
                ADMIN
              </span>
            )}
          </div>
        </GlassCard>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <span className="filter drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">🛡️</span>
            Admin Panel
          </h1>
          {isAdminUser && (
            <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple text-sm font-bold rounded-full border border-neon-purple/30">
              ADMIN ACCESS
            </span>
          )}
        </div>
        <p className="text-text-secondary">
          {inDemoMode
            ? 'View community reports and moderation activity'
            : 'Manage community reports and verify scam addresses'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Total Reports */}
        <GlassCard className="border-neon-blue/50 bg-neon-blue/10 hover:shadow-[0_0_20px_rgba(0,246,255,0.2)] transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-neon-blue">Total Reports</h3>
            <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(0,246,255,0.5)]">📊</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats.total}</p>
          <p className="text-sm text-text-muted mt-1">All time</p>
        </GlassCard>

        {/* Pending */}
        <GlassCard className="border-neon-yellow/50 bg-neon-yellow/10 hover:shadow-[0_0_20px_rgba(255,214,10,0.2)] transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-neon-yellow">Pending Review</h3>
            <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,214,10,0.5)]">⏳</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats.pending}</p>
          <p className="text-sm text-text-muted mt-1">Awaiting action</p>
        </GlassCard>

        {/* Verified */}
        <GlassCard className="border-neon-green/50 bg-neon-green/10 hover:shadow-[0_0_20px_rgba(0,255,175,0.2)] transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-neon-green">Verified</h3>
            <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(0,255,175,0.5)]">✅</span>
          </div>
          <p className="text-4xl font-bold text-white">{stats.verified}</p>
          <p className="text-sm text-text-muted mt-1">Confirmed scams</p>
        </GlassCard>
      </div>

      {/* Filter Tabs */}
      <GlassCard className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm font-semibold text-text-secondary">Filter:</p>

          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${filter === 'all'
              ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue shadow-[0_0_10px_rgba(0,246,255,0.3)]'
              : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
              }`}
          >
            All ({stats.total})
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${filter === 'pending'
              ? 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow shadow-[0_0_10px_rgba(255,214,10,0.3)]'
              : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
              }`}
          >
            ⏳ Pending ({stats.pending})
          </button>

          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${filter === 'verified'
              ? 'bg-neon-green/20 text-neon-green border border-neon-green shadow-[0_0_10px_rgba(0,255,175,0.3)]'
              : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/10'
              }`}
          >
            ✅ Verified ({stats.verified})
          </button>

          <NeonButton
            variant="outline"
            onClick={loadReports}
            className="ml-auto"
          >
            🔄 Refresh
          </NeonButton>
        </div>
      </GlassCard>

      {/* Reports List */}
      {reports.length === 0 ? (
        <GlassCard className="text-center py-12">
          <div className="text-6xl mb-4 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">📭</div>
          <h3 className="text-xl font-bold text-white mb-2">No Reports Found</h3>
          <p className="text-text-secondary">
            {filter === 'pending' && 'No reports are pending review'}
            {filter === 'verified' && 'No reports have been verified yet'}
            {filter === 'all' && 'No reports have been submitted yet'}
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              isAdmin={isAdminUser}
              inDemoMode={inDemoMode}
              adminWallet={adminWallet}
              onUpdate={loadReports}
            />
          ))}
        </div>
      )}
    </div>
  );
}