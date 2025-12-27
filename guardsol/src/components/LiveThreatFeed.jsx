import React, { useState, useEffect } from 'react';
import GlassCard from './UI/GlassCard';
import { MOCK_REPORTS } from '../utils/mockData';
import ReportModal from './ReportModal';
import NeonButton from './UI/NeonButton';

const TYPE_CONFIG = {
    'Rug Pull': { icon: '💀', color: 'text-neon-red', bg: 'bg-neon-red/10' },
    'Honeypot': { icon: '🍯', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    'Phishing Site': { icon: '🎣', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    'Drainer Transaction': { icon: '💸', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    'Fake Mint': { icon: '🖼️', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    'Impersonation': { icon: '🎭', color: 'text-pink-400', bg: 'bg-pink-400/10' }
};

const LiveThreatFeed = () => {
    const [reports, setReports] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const [votes, setVotes] = useState({}); // Local state for demo voting
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Initial load
        const initialReports = MOCK_REPORTS.slice(0, 10);
        setReports(initialReports);
        
        // Initialize random votes for demo realism
        const initialVotes = {};
        initialReports.forEach(r => {
            initialVotes[r.id || r.target] = Math.floor(Math.random() * 15) + 2;
        });
        setVotes(initialVotes);

        // Simulate "Real-time" incoming reports roughly every 2-5 seconds
        const interval = setInterval(() => {
            if (document.hidden || isPaused) return;

            const randomNewReport = MOCK_REPORTS[Math.floor(Math.random() * MOCK_REPORTS.length)];
            const newId = `live_${Date.now()}`;
            
            // Update timestamp to "Just now"
            const liveReport = { ...randomNewReport, timestamp: Date.now(), id: newId };

            setReports(prev => [liveReport, ...prev.slice(0, 9)]); // Keep top 10
            setVotes(prev => ({ ...prev, [newId]: 1 })); // Start with 1 vote
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaused]);

    const handleVote = (e, id, type) => {
        e.stopPropagation(); // Prevent card click
        setVotes(prev => ({
            ...prev,
            [id]: type === 'verify' ? (prev[id] || 0) + 1 : (prev[id] || 0) - 1
        }));
    };

    const handleReportSubmit = (newReport) => {
        const reportWithMeta = {
            ...newReport,
            id: `user_${Date.now()}`,
            reporter: {
                username: 'You (Anon)',
                reputation: 1, // Start low
                avatarColor: 'from-neon-blue to-purple-600',
                isGrandmaster: false
            }
        };

        setReports(prev => [reportWithMeta, ...prev]);
        setVotes(prev => ({ ...prev, [reportWithMeta.id]: 1 })); // Auto-upvote own report
    };

    return (
        <div className="w-full mb-8 relative">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-red"></span>
                        </span>
                        Live Threat Feed
                    </h3>
                    
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-neon-red hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.5)] transition-all"
                    >
                        🚨 REPORT THREAT
                    </button>
                </div>

                <span className="text-xs text-neon-blue font-mono border border-neon-blue/30 px-2 py-1 rounded bg-neon-blue/5">
                    ● SOCIAL CONSENSUS ACTIVE
                </span>
            </div>

            <ReportModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleReportSubmit} 
            />

            <div
                className="relative overflow-hidden group"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {/* Gradient Fade Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-dark-bg to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-dark-bg to-transparent z-10 pointer-events-none"></div>

                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar scroll-smooth">
                    {reports.map((report) => {
                        const config = TYPE_CONFIG[report.type] || TYPE_CONFIG['Rug Pull'];
                        const timeAgo = Math.floor((Date.now() - report.timestamp) / 1000); // seconds
                        const voteCount = votes[report.id] || votes[report.target] || 0;

                        return (
                            <GlassCard
                                key={report.id}
                                className="min-w-[280px] p-4 flex-shrink-0 border-l-4 border-l-current transition-transform duration-300 hover:scale-[1.02] cursor-pointer snap-start flex flex-col"
                                style={{ borderLeftColor: report.severity === 'CRITICAL' ? '#FF4D4D' : '#3B82F6' }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`text-2xl p-2 rounded-lg ${config.bg}`}>
                                        {config.icon}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-mono text-text-muted">
                                            {timeAgo < 60 ? `${timeAgo}s ago` : `${Math.floor(timeAgo / 60)}m ago`}
                                        </span>
                                        {report.severity === 'CRITICAL' && (
                                            <div className="text-[10px] font-bold text-neon-red animate-pulse mt-1">
                                                CRITICAL
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h4 className="font-bold text-white truncate text-sm mb-1">
                                    {report.type}
                                </h4>
                                <p className="text-xs text-text-secondary font-mono truncate mb-3">
                                    {report.target}
                                </p>

                                {/* VOTING ACTION BAR */}
                                <div className="flex items-center gap-2 mb-3 mt-auto">
                                    <button
                                        onClick={(e) => handleVote(e, report.id || report.target, 'verify')}
                                        className="flex-1 bg-neon-green/10 hover:bg-neon-green/20 text-neon-green border border-neon-green/30 rounded py-1 px-2 text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                                    >
                                        🛡️ VERIFY ({voteCount})
                                    </button>
                                    <button
                                        onClick={(e) => handleVote(e, report.id || report.target, 'dispute')}
                                        className="flex-1 bg-neon-red/10 hover:bg-neon-red/20 text-neon-red border border-neon-red/30 rounded py-1 px-2 text-[10px] font-bold transition-colors"
                                    >
                                        🚩 DISPUTE
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${report.reporter.avatarColor}`}></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-text-primary font-medium">
                                            {report.reporter.username}
                                        </span>
                                        <span className="text-[9px] text-text-muted">
                                            Rep: <span className="text-neon-green">{report.reporter.reputation}</span>
                                        </span>
                                    </div>

                                    {report.reporter.isGrandmaster && (
                                        <span className="ml-auto text-xs" title="Grandmaster Reporter">🛡️</span>
                                    )}
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LiveThreatFeed;