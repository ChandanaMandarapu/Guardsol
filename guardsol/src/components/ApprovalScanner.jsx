import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getApprovalsWithRisk, groupApprovalsByRisk } from '../utils/approvals';
import { getRiskColor, getRiskEmoji } from '../utils/approvalRisk';
import { revokeApproval, batchRevokeApprovals, estimateRevokeFee } from '../utils/revoke';

// FIXED: Now accepts walletAddress and tokens as props
export default function ApprovalScanner({ walletAddress, tokens, tokensLoading }) {
  const { wallet, connected } = useWallet();
  
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedApprovals, setSelectedApprovals] = useState([]);
  const [batchRevoking, setBatchRevoking] = useState(false);

  // Scan approvals when tokens change
  useEffect(() => {
    if (walletAddress && tokens && tokens.length > 0) {
      scanApprovals();
    } else {
      setApprovals([]);
      setError(null);
    }
  }, [walletAddress, tokens]);

  async function scanApprovals() {
    setLoading(true);
    setError(null);
    console.log('🔍 Scanning approvals for:', walletAddress);
    
    try {
      const approvalsWithRisk = await getApprovalsWithRisk(tokens);
      setApprovals(approvalsWithRisk);
      console.log('✅ Found', approvalsWithRisk.length, 'approvals');
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Failed to scan approvals');
    } finally {
      setLoading(false);
    }
  }

  async function handleBatchRevoke() {
    // Check if wallet is connected (can only revoke with connected wallet)
    if (!connected || !wallet) {
      alert('Please connect your wallet to revoke approvals');
      return;
    }

    if (selectedApprovals.length === 0) {
      alert('Please select approvals to revoke');
      return;
    }
    
    const fee = await estimateRevokeFee();
    const totalFee = fee * selectedApprovals.length;
    
    const confirmed = window.confirm(
      `Revoke ${selectedApprovals.length} approvals?\n\n` +
      `Estimated fee: ${totalFee.toFixed(6)} SOL\n\n` +
      `This will remove all selected delegates.`
    );
    
    if (!confirmed) return;
    
    setBatchRevoking(true);
    
    try {
      const result = await batchRevokeApprovals(selectedApprovals, wallet);
      
      if (result.success) {
        alert(`Success! Revoked ${result.count} approvals.\n\nTx: ${result.signature}`);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        alert(`Failed: ${result.error}`);
      }
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setBatchRevoking(false);
    }
  }

  function toggleSelection(tokenAccountAddress) {
    setSelectedApprovals(prev => {
      if (prev.includes(tokenAccountAddress)) {
        return prev.filter(addr => addr !== tokenAccountAddress);
      } else {
        return [...prev, tokenAccountAddress];
      }
    });
  }

  function selectAllInGroup(groupApprovals) {
    const addresses = groupApprovals.map(a => a.tokenAccountAddress);
    setSelectedApprovals(prev => {
      const allSelected = addresses.every(addr => prev.includes(addr));
      if (allSelected) {
        return prev.filter(addr => !addresses.includes(addr));
      } else {
        return [...new Set([...prev, ...addresses])];
      }
    });
  }

  // Don't show anything if no wallet address
  if (!walletAddress) return null;

  if (loading || tokensLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-lg text-gray-600">Scanning approvals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">❌</span>
            <h3 className="font-bold text-red-900">Error</h3>
          </div>
          <p className="text-red-800">{error}</p>
          <button
            onClick={scanApprovals}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-green-50 border-2 border-green-200 rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">Great News!</h3>
          <p className="text-green-800 text-lg">No token approvals found</p>
          <p className="text-green-700 text-sm mt-2">
            No delegates can move your tokens. Your wallet is secure!
          </p>
        </div>
      </div>
    );
  }

  const grouped = groupApprovalsByRisk(approvals);
  const canRevoke = connected && wallet;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">🔍 Approval Scanner</h2>
        <p className="text-gray-600">Found {approvals.length} approval{approvals.length !== 1 ? 's' : ''}</p>
        {!canRevoke && (
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ Connect your wallet to revoke approvals
          </p>
        )}
      </div>

      {(grouped.critical.length > 0 || grouped.high.length > 0) && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-xl font-bold text-red-900">Action Required!</h3>
          </div>
          <div className="space-y-2 text-red-800">
            {grouped.critical.length > 0 && (
              <p className="font-semibold">
                🔴 {grouped.critical.length} CRITICAL risk - Revoke immediately!
              </p>
            )}
            {grouped.high.length > 0 && (
              <p className="font-semibold">
                🟠 {grouped.high.length} High risk - Review urgently
              </p>
            )}
          </div>
        </div>
      )}

      {approvals.length > 0 && canRevoke && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Batch Actions</h3>
              <p className="text-sm text-gray-600">
                {selectedApprovals.length} selected
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedApprovals([])}
                disabled={selectedApprovals.length === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Clear
              </button>
              
              <button
                onClick={handleBatchRevoke}
                disabled={selectedApprovals.length === 0 || batchRevoking}
                className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {batchRevoking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Revoking...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Revoke Selected ({selectedApprovals.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {grouped.critical.length > 0 && (
              <button
                onClick={() => selectAllInGroup(grouped.critical)}
                className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded hover:bg-red-200"
              >
                Select All Critical ({grouped.critical.length})
              </button>
            )}
            {grouped.high.length > 0 && (
              <button
                onClick={() => selectAllInGroup(grouped.high)}
                className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded hover:bg-orange-200"
              >
                Select All High ({grouped.high.length})
              </button>
            )}
            <button
              onClick={() => {
                const unlimited = approvals.filter(a => a.isUnlimited);
                setSelectedApprovals(unlimited.map(a => a.tokenAccountAddress));
              }}
              className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded hover:bg-purple-200"
            >
              Select All Unlimited
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {grouped.critical.length > 0 && (
          <ApprovalGroup
            title="🔴 CRITICAL RISK"
            approvals={grouped.critical}
            selectedApprovals={selectedApprovals}
            onToggleSelect={toggleSelection}
            wallet={wallet}
            canRevoke={canRevoke}
          />
        )}
        
        {grouped.high.length > 0 && (
          <ApprovalGroup
            title="🟠 High Risk"
            approvals={grouped.high}
            selectedApprovals={selectedApprovals}
            onToggleSelect={toggleSelection}
            wallet={wallet}
            canRevoke={canRevoke}
          />
        )}
        
        {grouped.medium.length > 0 && (
          <ApprovalGroup
            title="🟡 Medium Risk"
            approvals={grouped.medium}
            selectedApprovals={selectedApprovals}
            onToggleSelect={toggleSelection}
            wallet={wallet}
            canRevoke={canRevoke}
          />
        )}
        
        {grouped.low.length > 0 && (
          <ApprovalGroup
            title="🔵 Low Risk"
            approvals={grouped.low}
            selectedApprovals={selectedApprovals}
            onToggleSelect={toggleSelection}
            wallet={wallet}
            canRevoke={canRevoke}
          />
        )}
      </div>

    </div>
  );
}

function ApprovalGroup({ title, approvals, selectedApprovals, onToggleSelect, wallet, canRevoke }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 gap-4">
        {approvals.map((approval) => (
          <ApprovalCard
            key={approval.tokenAccountAddress}
            approval={approval}
            selected={selectedApprovals.includes(approval.tokenAccountAddress)}
            onToggleSelect={() => onToggleSelect(approval.tokenAccountAddress)}
            wallet={wallet}
            canRevoke={canRevoke}
          />
        ))}
      </div>
    </div>
  );
}

function ApprovalCard({ approval, selected, onToggleSelect, wallet, canRevoke }) {
  const [showDetails, setShowDetails] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [revokeSuccess, setRevokeSuccess] = useState(false);
  const [revokeError, setRevokeError] = useState(null);
  
  const riskColor = getRiskColor(approval.riskLevel);
  
  async function handleRevoke() {
    if (!canRevoke) {
      alert('Please connect your wallet to revoke approvals');
      return;
    }

    const fee = await estimateRevokeFee();
    const confirmed = window.confirm(
      `Revoke approval for ${approval.tokenName}?\n\n` +
      `Fee: ~${fee} SOL\n\n` +
      `Delegate will NO LONGER be able to transfer your tokens.`
    );
    
    if (!confirmed) return;
    
    setRevoking(true);
    setRevokeError(null);
    
    try {
      const result = await revokeApproval(approval.tokenAccountAddress, wallet);
      
      if (result.success) {
        setRevokeSuccess(true);
        alert(`Success!\n\nTx: ${result.signature}`);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setRevokeError(result.error);
        alert(`Failed: ${result.error}`);
      }
    } catch (error) {
      setRevokeError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setRevoking(false);
    }
  }
  
  const borderColors = {
    red: 'border-red-300',
    orange: 'border-orange-300',
    yellow: 'border-yellow-300',
    blue: 'border-blue-300'
  };
  
  const bgColors = {
    red: 'bg-red-50',
    orange: 'bg-orange-50',
    yellow: 'bg-yellow-50',
    blue: 'bg-blue-50'
  };
  
  return (
    <div className={`bg-white border-2 ${borderColors[riskColor]} rounded-lg shadow-md p-6 ${selected ? 'ring-4 ring-primary ring-opacity-50' : ''}`}>
      
      <div className="flex items-start gap-4">
        
        {canRevoke && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="mt-2 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
          />
        )}
        
        <div className="flex-1 min-w-0">
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              {approval.tokenImage ? (
                <img 
                  src={approval.tokenImage} 
                  alt={approval.tokenName}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold"
                style={{ display: approval.tokenImage ? 'none' : 'flex' }}
              >
                {approval.tokenSymbol.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{approval.tokenName}</h4>
                <p className="text-sm text-gray-500">{approval.tokenSymbol}</p>
                <p className="text-xs text-gray-400 mt-1">Balance: {approval.balance.toFixed(4)}</p>
              </div>
            </div>

            <div className={`${bgColors[riskColor]} px-4 py-2 rounded-lg`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getRiskEmoji(approval.riskLevel)}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-600">Risk</p>
                  <p className="text-xl font-bold text-gray-900">{approval.riskScore}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2">
            {approval.isUnlimited ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm font-bold rounded-full">
                ⚠️ UNLIMITED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                Limited
              </span>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Delegate:</p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-gray-600 break-all flex-1">
                {approval.delegate}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(approval.delegate);
                  alert('Copied!');
                }}
                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
              >
                Copy
              </button>
            </div>
            
            {approval.delegateInfo && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Age</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {approval.delegateInfo.ageLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Transactions</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {approval.delegateInfo.txCountLabel}
                  </p>
                </div>
                {approval.delegateInfo.isScammer && (
                  <div className="col-span-2">
                    <div className="bg-red-100 border border-red-300 rounded px-2 py-1">
                      <p className="text-xs font-bold text-red-800">
                        🚨 Known Scammer!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {approval.riskFactors && approval.riskFactors.length > 0 && (
            <div className={`${bgColors[riskColor]} border ${borderColors[riskColor]} rounded-lg p-4 mb-4`}>
              <p className="text-sm font-semibold text-gray-700 mb-2">Why risky?</p>
              <ul className="space-y-2">
                {approval.riskFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    <span className="font-semibold">{factor.factor}:</span> {factor.description}
                    <span className="text-xs text-gray-500 ml-2">(+{factor.points})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            {canRevoke && !revokeSuccess && (
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {revoking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Revoking...</span>
                  </>
                ) : (
                  <>
                    <span>🗑️</span>
                    <span>Revoke</span>
                  </>
                )}
              </button>
            )}

            {revokeSuccess && (
              <div className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2">
                <span>✅</span>
                <span>Revoked!</span>
              </div>
            )}

            {!canRevoke && (
              <div className="flex-1 px-4 py-2 bg-gray-300 text-gray-600 font-semibold rounded-lg text-center">
                Connect wallet to revoke
              </div>
            )}
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
            >
              {showDetails ? 'Hide' : 'Details'}
            </button>
          </div>

          {revokeError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {revokeError}
              </p>
            </div>
          )}

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Technical:</p>
              <div className="text-xs font-mono text-gray-600 space-y-1 break-all">
                <p><strong>Mint:</strong> {approval.mint}</p>
                <p><strong>Account:</strong> {approval.tokenAccountAddress}</p>
                <p><strong>Delegate:</strong> {approval.delegate}</p>
                <p><strong>Amount:</strong> {approval.delegatedAmount}</p>
                <p><strong>Unlimited:</strong> {approval.isUnlimited ? 'YES ⚠️' : 'No'}</p>
              </div>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}