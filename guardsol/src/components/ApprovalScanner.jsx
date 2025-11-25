import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getApprovalsWithRisk, groupApprovalsByRisk } from '../utils/approvals';
import { getRiskColor, getRiskEmoji } from '../utils/approvalRisk';
import { revokeApproval, batchRevokeApprovals, estimateRevokeFee } from '../utils/revoke';
import GlassCard from './UI/GlassCard';
import NeonButton from './UI/NeonButton';

// Now accepts walletAddress and tokens as props
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
        <GlassCard className="flex items-center justify-center gap-3 min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
          <p className="text-lg text-neon-blue animate-pulse">Scanning approvals...</p>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <GlassCard className="border-neon-red/50 bg-neon-red/5">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <span className="text-2xl">❌</span>
            <h3 className="font-bold text-neon-red">Error</h3>
          </div>
          <p className="text-neon-red text-center mb-4">{error}</p>
          <div className="flex justify-center">
            <NeonButton variant="danger" onClick={scanApprovals}>
              Try Again
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <GlassCard className="bg-neon-green/5 border-neon-green/30 text-center py-12">
          <div className="text-6xl mb-4 filter drop-shadow-[0_0_10px_rgba(0,255,175,0.5)]">🎉</div>
          <h3 className="text-2xl font-bold text-neon-green mb-2">Great News!</h3>
          <p className="text-white text-lg">No token approvals found</p>
          <p className="text-neon-green/80 text-sm mt-2">
            No delegates can move your tokens. Your wallet is secure!
          </p>
        </GlassCard>
      </div>
    );
  }

  const grouped = groupApprovalsByRisk(approvals);
  const canRevoke = connected && wallet;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span>🔍</span> Approval Scanner
        </h2>
        <p className="text-text-secondary">Found <span className="text-neon-blue font-bold">{approvals.length}</span> approval{approvals.length !== 1 ? 's' : ''}</p>
        {!canRevoke && (
          <p className="text-sm text-neon-yellow mt-2 flex items-center gap-2">
            ⚠️ Connect your wallet to revoke approvals
          </p>
        )}
      </div>

      {(grouped.critical.length > 0 || grouped.high.length > 0) && (
        <GlassCard className="border-neon-red/50 bg-neon-red/5 mb-6 animate-pulse-slow">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-xl font-bold text-neon-red">Action Required!</h3>
          </div>
          <div className="space-y-2 text-white">
            {grouped.critical.length > 0 && (
              <p className="font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-red animate-ping"></span>
                <span className="text-neon-red">{grouped.critical.length} CRITICAL risk - Revoke immediately!</span>
              </p>
            )}
            {grouped.high.length > 0 && (
              <p className="font-semibold text-neon-yellow">
                🟠 {grouped.high.length} High risk - Review urgently
              </p>
            )}
          </div>
        </GlassCard>
      )}

      {approvals.length > 0 && canRevoke && (
        <GlassCard className="mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Batch Actions</h3>
              <p className="text-sm text-text-secondary">
                {selectedApprovals.length} selected
              </p>
            </div>

            <div className="flex gap-3">
              <NeonButton
                variant="outline"
                onClick={() => setSelectedApprovals([])}
                disabled={selectedApprovals.length === 0}
                className="!py-2 !px-4"
              >
                Clear
              </NeonButton>

              <NeonButton
                variant="danger"
                onClick={handleBatchRevoke}
                disabled={selectedApprovals.length === 0 || batchRevoking}
                className="!py-2 !px-6"
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
              </NeonButton>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {grouped.critical.length > 0 && (
              <button
                onClick={() => selectAllInGroup(grouped.critical)}
                className="px-3 py-1 bg-neon-red/10 text-neon-red border border-neon-red/30 text-sm font-semibold rounded hover:bg-neon-red/20 transition-colors"
              >
                Select All Critical ({grouped.critical.length})
              </button>
            )}
            {grouped.high.length > 0 && (
              <button
                onClick={() => selectAllInGroup(grouped.high)}
                className="px-3 py-1 bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30 text-sm font-semibold rounded hover:bg-neon-yellow/20 transition-colors"
              >
                Select All High ({grouped.high.length})
              </button>
            )}
            <button
              onClick={() => {
                const unlimited = approvals.filter(a => a.isUnlimited);
                setSelectedApprovals(unlimited.map(a => a.tokenAccountAddress));
              }}
              className="px-3 py-1 bg-neon-purple/10 text-neon-purple border border-neon-purple/30 text-sm font-semibold rounded hover:bg-neon-purple/20 transition-colors"
            >
              Select All Unlimited
            </button>
          </div>
        </GlassCard>
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
            titleColor="text-neon-red"
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
            titleColor="text-neon-yellow"
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
            titleColor="text-neon-yellow"
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
            titleColor="text-neon-blue"
          />
        )}
      </div>

    </div>
  );
}

function ApprovalGroup({ title, approvals, selectedApprovals, onToggleSelect, wallet, canRevoke, titleColor = "text-white" }) {
  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-bold ${titleColor}`}>{title}</h3>
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
    red: 'border-neon-red',
    orange: 'border-neon-yellow',
    yellow: 'border-neon-yellow',
    blue: 'border-neon-blue'
  };

  const bgColors = {
    red: 'bg-neon-red/10',
    orange: 'bg-neon-yellow/10',
    yellow: 'bg-neon-yellow/10',
    blue: 'bg-neon-blue/10'
  };

  const textColors = {
    red: 'text-neon-red',
    orange: 'text-neon-yellow',
    yellow: 'text-neon-yellow',
    blue: 'text-neon-blue'
  };

  return (
    <GlassCard
      className={`border ${borderColors[riskColor]} transition-all duration-300 ${selected ? 'ring-2 ring-neon-blue ring-opacity-50 shadow-[0_0_20px_rgba(0,246,255,0.2)]' : ''}`}
    >

      <div className="flex items-start gap-4">

        {canRevoke && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="mt-2 w-5 h-5 accent-neon-blue cursor-pointer"
          />
        )}

        <div className="flex-1 min-w-0">

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              {approval.tokenImage ? (
                <img
                  src={approval.tokenImage}
                  alt={approval.tokenName}
                  className="w-12 h-12 rounded-full object-cover border border-white/10"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center text-black text-xl font-bold shadow-neon-blue"
                style={{ display: approval.tokenImage ? 'none' : 'flex' }}
              >
                {approval.tokenSymbol.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate">{approval.tokenName}</h4>
                <p className="text-sm text-text-secondary">{approval.tokenSymbol}</p>
                <p className="text-xs text-text-muted mt-1 font-mono">Balance: {approval.balance.toFixed(4)}</p>
              </div>
            </div>

            <div className={`${bgColors[riskColor]} px-4 py-2 rounded-lg border border-white/5`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{getRiskEmoji(approval.riskLevel)}</span>
                <div>
                  <p className="text-xs font-semibold text-text-secondary">Risk</p>
                  <p className={`text-xl font-bold ${textColors[riskColor]}`}>{approval.riskScore}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2">
            {approval.isUnlimited ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-neon-red/20 text-neon-red border border-neon-red/30 text-sm font-bold rounded-full animate-pulse">
                ⚠️ UNLIMITED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30 text-sm font-semibold rounded-full">
                Limited
              </span>
            )}
          </div>

          <div className="bg-dark-bg/50 rounded-lg p-4 mb-4 border border-white/5">
            <p className="text-sm font-semibold text-text-secondary mb-2">Delegate:</p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-text-primary break-all flex-1">
                {approval.delegate}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(approval.delegate);
                  alert('Copied!');
                }}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-text-secondary transition-colors"
              >
                Copy
              </button>
            </div>

            {approval.delegateInfo && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-muted">Age</p>
                  <p className="text-sm font-semibold text-white">
                    {approval.delegateInfo.ageLabel}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Transactions</p>
                  <p className="text-sm font-semibold text-white">
                    {approval.delegateInfo.txCountLabel}
                  </p>
                </div>
                {approval.delegateInfo.isScammer && (
                  <div className="col-span-2">
                    <div className="bg-neon-red/20 border border-neon-red/50 rounded px-2 py-1">
                      <p className="text-xs font-bold text-neon-red">
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
              <p className="text-sm font-semibold text-white mb-2">Why risky?</p>
              <ul className="space-y-2">
                {approval.riskFactors.map((factor, idx) => (
                  <li key={idx} className="text-sm text-text-primary">
                    <span className="font-semibold text-white">{factor.factor}:</span> {factor.description}
                    <span className={`text-xs ml-2 font-mono ${textColors[riskColor]}`}>(+{factor.points})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            {canRevoke && !revokeSuccess && (
              <NeonButton
                variant="danger"
                onClick={handleRevoke}
                disabled={revoking}
                className="flex-1 !py-2"
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
              </NeonButton>
            )}

            {revokeSuccess && (
              <div className="flex-1 px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green/50 font-semibold rounded-lg flex items-center justify-center gap-2">
                <span>✅</span>
                <span>Revoked!</span>
              </div>
            )}

            {!canRevoke && (
              <div className="flex-1 px-4 py-2 bg-white/5 text-text-muted font-semibold rounded-lg text-center border border-white/10">
                Connect wallet to revoke
              </div>
            )}

            <NeonButton
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="!py-2"
            >
              {showDetails ? 'Hide' : 'Details'}
            </NeonButton>
          </div>

          {revokeError && (
            <div className="mt-4 bg-neon-red/10 border border-neon-red/30 rounded-lg p-3">
              <p className="text-sm text-neon-red">
                <strong>Error:</strong> {revokeError}
              </p>
            </div>
          )}

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-text-secondary mb-2">Technical:</p>
              <div className="text-xs font-mono text-text-muted space-y-1 break-all">
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

    </GlassCard>
  );
}