import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { isAdmin, isDemoMode, getAllReports, getPendingReports, getVerifiedReports } from '../utils/admin';
import ReportCard from './ReportCard';

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-lg text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Demo Mode Banner */}
      {inDemoMode && (
        <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👀</span>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900">Viewing in Demo Mode</h3>
              <p className="text-sm text-blue-700">
                {connected
                  ? 'You are viewing as a regular user. Admin actions are disabled.'
                  : 'Connect your admin wallet to approve/reject reports.'}
              </p>
            </div>
            {isAdminUser && (
              <span className="px-3 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
                ADMIN
              </span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">🛡️ Admin Panel</h1>
          {isAdminUser && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-bold rounded-full">
              ADMIN ACCESS
            </span>
          )}
        </div>
        <p className="text-gray-600">
          {inDemoMode
            ? 'View community reports and moderation activity'
            : 'Manage community reports and verify scam addresses'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* Total Reports */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold opacity-90">Total Reports</h3>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-4xl font-bold">{stats.total}</p>
          <p className="text-sm opacity-75 mt-1">All time</p>
        </div>

        {/* Pending */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold opacity-90">Pending Review</h3>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-4xl font-bold">{stats.pending}</p>
          <p className="text-sm opacity-75 mt-1">Awaiting action</p>
        </div>

        {/* Verified */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold opacity-90">Verified</h3>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-4xl font-bold">{stats.verified}</p>
          <p className="text-sm opacity-75 mt-1">Confirmed scams</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-gray-700">Filter:</p>

          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            All ({stats.total})
          </button>

          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${filter === 'pending'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            ⏳ Pending ({stats.pending})
          </button>

          <button
            onClick={() => setFilter('verified')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${filter === 'verified'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            ✅ Verified ({stats.verified})
          </button>

          <button
            onClick={loadReports}
            className="ml-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-300"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-600">
            {filter === 'pending' && 'No reports are pending review'}
            {filter === 'verified' && 'No reports have been verified yet'}
            {filter === 'all' && 'No reports have been submitted yet'}
          </p>
        </div>
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