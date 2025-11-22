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
        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold text-sm transition-colors ${
          userVote === 'upvote'
            ? 'bg-green-100 text-green-800 border-2 border-green-500'
            : 'bg-gray-100 text-gray-700 hover:bg-green-50 border border-gray-300'
        }`}
      >
        <span>👍</span>
        <span>{votes.upvotes}</span>
      </button>

      {/* Score */}
      <div className="px-2 py-1 bg-gray-100 rounded-lg font-bold text-sm text-gray-700">
        {votes.score > 0 ? '+' : ''}{votes.score}
      </div>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote('downvote')}
        disabled={loading}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold text-sm transition-colors ${
          userVote === 'downvote'
            ? 'bg-red-100 text-red-800 border-2 border-red-500'
            : 'bg-gray-100 text-gray-700 hover:bg-red-50 border border-gray-300'
        }`}
      >
        <span>👎</span>
        <span>{votes.downvotes}</span>
      </button>
    </div>
  );
}