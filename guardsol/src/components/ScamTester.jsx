import React, { useState } from 'react';
import { checkIfScam, getAllScams } from '../utils/supabase';
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
      <div className="bg-white rounded-lg shadow-md p-8">
        
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🧪 Scam Database Tester
        </h2>

        {/* Test Single Address */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Test Single Address
          </h3>
          
          <div className="flex gap-4">
            <input
              type="text"
              value={testAddress}
              onChange={(e) => setTestAddress(e.target.value)}
              placeholder="Paste token address here"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button
              onClick={handleTest}
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`mt-4 p-4 rounded-lg ${result.isScam ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              {result.isScam ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🚨</span>
                    <h4 className="font-bold text-red-900">SCAM DETECTED!</h4>
                  </div>
                  <p className="text-red-800">
                    <strong>Name:</strong> {result.name || 'Unknown'}
                  </p>
                  <p className="text-red-800">
                    <strong>Reason:</strong> {result.reason}
                  </p>
                  <p className="text-red-800">
                    <strong>Verified:</strong> {result.verified ? '✅ Yes' : '⚠️ Community Report'}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <h4 className="font-bold text-green-900">Not in scam database</h4>
                  </div>
                  <p className="text-green-800 text-sm mt-1">
                    This doesn't mean it's safe - just not in our database yet.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* View All Scams */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            View All Scams in Database
          </h3>
          
          <button
            onClick={handleLoadAllScams}
            disabled={loading}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Load All Scams (${allScams.length || '?'})`}
          </button>

          {allScams.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allScams.map((scam) => (
                    <tr key={scam.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {scam.address.slice(0, 8)}...{scam.address.slice(-6)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {scam.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {scam.reason}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {scam.verified ? (
                          <span className="text-green-600">✅ Yes</span>
                        ) : (
                          <span className="text-yellow-600">⚠️ No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}