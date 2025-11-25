import React, { useState } from 'react';
import { checkIfScam, getAllScams } from '../utils/supabase';
import GlassCard from './UI/GlassCard';
import NeonButton from './UI/NeonButton';

// Test component to verify scam detection works
export default function ScamTester() {
  const [testAddress, setTestAddress] = useState('');
  const [result, setResult] = useState(null);
  const [allScams, setAllScams] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    if (!testAddress.trim()) {
      alert('Please enter an address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const scamResult = await checkIfScam(testAddress);
      setResult(scamResult);
    } catch (error) {
      console.error('Test failed:', error);
      alert('Test failed. Check console.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadAllScams() {
    setLoading(true);
    try {
      const scams = await getAllScams();
      setAllScams(scams);
    } catch (error) {
      console.error('Failed to load scams:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <GlassCard className="p-8">

        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="filter drop-shadow-[0_0_5px_rgba(0,246,255,0.5)]">🧪</span>
          Scam Database Tester
        </h2>

        {/* Test Single Address */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            Test Single Address
          </h3>

          <div className="flex gap-4">
            <input
              type="text"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              placeholder="Paste token address here"
              className="flex-1 px-4 py-2 bg-dark-bg border border-white/10 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue text-white outline-none transition-all placeholder-text-muted"
            />
            <NeonButton
              onClick={handleTest}
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test'}
            </NeonButton>
          </div>

          {/* Result */}
          {result && (
            <div className={`mt-4 p-4 rounded-lg border ${result.isScam ? 'bg-neon-red/10 border-neon-red/30' : 'bg-neon-green/10 border-neon-green/30'}`}>
              {result.isScam ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,59,48,0.5)]">🚨</span>
                    <h4 className="font-bold text-neon-red">SCAM DETECTED!</h4>
                  </div>
                  <p className="text-white">
                    <strong>Name:</strong> {result.name || 'Unknown'}
                  </p>
                  <p className="text-white">
                    <strong>Reason:</strong> {result.reason}
                  </p>
                  <p className="text-white">
                    <strong>Verified:</strong> {result.verified ? '✅ Yes' : '⚠️ Community Report'}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(0,255,175,0.5)]">✅</span>
                    <h4 className="font-bold text-neon-green">Not in scam database</h4>
                  </div>
                  <p className="text-text-secondary text-sm mt-1">
                    This doesn't mean it's safe - just not in our database yet.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* View All Scams */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            View All Scams in Database
          </h3>

          <NeonButton
            onClick={handleLoadAllScams}
            disabled={loading}
            variant="outline"
          >
            {loading ? 'Loading...' : `Load All Scams (${allScams.length || '?'})`}
          </NeonButton>

          {allScams.length > 0 && (
            <div className="mt-4 border border-white/10 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-dark-bg/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">Verified</th>
                  </tr>
                </thead>
                <tbody className="bg-dark-bg/30 divide-y divide-white/10">
                  {allScams.map((scam) => (
                    <tr key={scam.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono text-white">
                        {scam.address.slice(0, 8)}...{scam.address.slice(-6)}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">
                        {scam.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {scam.reason}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {scam.verified ? (
                          <span className="text-neon-green">✅ Yes</span>
                        ) : (
                          <span className="text-neon-yellow">⚠️ No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}