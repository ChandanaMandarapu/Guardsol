import React from 'react';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-dark-bg text-text-primary relative overflow-hidden font-sans selection:bg-neon-blue/30 selection:text-neon-blue">
            {/* Background Glow Effects */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-neon-blue/5 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-purple/5 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10 pointer-events-none mix-blend-overlay"></div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <div className="flex-grow">
                    {children}
                </div>

                {/* Glass Footer */}
                <footer className="glass-panel mt-20 border-t border-white/5 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-neon-gradient flex items-center justify-center shadow-neon-blue">
                                    <span className="text-black font-bold text-lg">G</span>
                                </div>
                                <p className="text-sm text-text-secondary">
                                    <span className="text-neon-blue font-semibold">GuardSol</span> - Advanced Solana Security
                                </p>
                            </div>

                            <div className="flex gap-8">
                                <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-neon-blue transition-colors duration-300">Terms</a>
                                <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-neon-blue transition-colors duration-300">Privacy</a>
                                <a href="https://github.com/yourusername/guardsol" target="_blank" rel="noopener noreferrer" className="text-sm text-text-muted hover:text-neon-blue transition-colors duration-300">GitHub</a>
                            </div>
                        </div>
                        <p className="text-center text-xs text-text-muted mt-6 font-mono">
                            Not financial advice. Use at your own risk. Always verify independently.
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default MainLayout;
