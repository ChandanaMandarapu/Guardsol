import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { voteOnReport, getVoteCounts, getUserVote } from '../utils/voting';

export default function VotingButton({ reportId }) {
  const { publicKey } = useWallet();

  const [votes, setVotes] = useState({ upvotes: 0, downvotes: 0, score: 0 });
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVotes();
  }, [reportId, publicKey]);

  async function loadVotes() {
    const counts = await getVoteCounts(reportId);
    setVotes(counts);

    if (publicKey) {
      const vote = await getUserVote(reportId, publicKey.toString());
      setUserVote(vote);
    }
  }

  async function handleVote(voteType) {
    if (!publicKey) {
      alert('Connect wallet to vote');
      return;
    }

    setLoading(true);

    try {
      await voteOnReport(reportId, publicKey.toString(), voteType);
      await loadVotes();
    } catch (error) {
      alert('Failed to vote: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote('upvote')}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold text-sm transition-all ${userVote === 'upvote'
            ? 'bg-neon-green/20 text-neon-green border border-neon-green shadow-[0_0_10px_rgba(0,255,175,0.3)]'
            : 'bg-white/5 text-text-secondary hover:bg-neon-green/10 hover:text-neon-green border border-white/10'
          }`}
      >
        <span>👍</span>
        <span>{votes.upvotes}</span>
      </button>

      {/* Score */}
      <div className="px-2 py-1 bg-dark-bg border border-white/10 rounded-lg font-bold text-sm text-white">
        {votes.score > 0 ? '+' : ''}{votes.score}
      </div>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('downvote')}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold text-sm transition-all ${userVote === 'downvote'
            ? 'bg-neon-red/20 text-neon-red border border-neon-red shadow-[0_0_10px_rgba(255,59,48,0.3)]'
            : 'bg-white/5 text-text-secondary hover:bg-neon-red/10 hover:text-neon-red border border-white/10'
          }`}
      >
        <span>👎</span>
        <span>{votes.downvotes}</span>
      </button>
    </div>
  );
}