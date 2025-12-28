import React, { useState } from 'react';
import NeonButton from './UI/NeonButton';
import GlassCard from './UI/GlassCard';

const REPORT_TYPES = [
    { label: 'Rug Pull', icon: '💀', color: 'text-neon-red' },
    { label: 'Honeypot', icon: '🍯', color: 'text-yellow-400' },
    { label: 'Phishing', icon: '🎣', color: 'text-orange-400' },
    { label: 'Fake Mint', icon: '🖼️', color: 'text-blue-400' },
];

const ReportModal = ({ isOpen, onClose, onSubmit }) => {
    const [target, setTarget] = useState('');
    const [selectedType, setSelectedType] = useState(REPORT_TYPES[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!target) return;
        setIsSubmitting(true);

        // Dramatically fake the submission delay
        setTimeout(() => {
            onSubmit({
                type: selectedType.label,
                target: target,
                timestamp: Date.now(),
                severity: 'HIGH'
            });
            setIsSubmitting(false);
            setTarget('');
            onClose();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <GlassCard className="w-full max-w-md border-neon-red/30 shadow-[0_0_30px_rgba(255,50,50,0.2)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-neon-red">🚨</span> REPORT THREAT
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-gray-400 mb-1">Scammer Address / URL</label>
                        <input
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            placeholder="Paste Sol Address or Domain..."
                            className="w-full bg-dark-bg border border-white/10 rounded p-3 text-sm focus:border-neon-red outline-none text-white font-mono"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase text-gray-400 mb-2">Threat Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {REPORT_TYPES.map((type) => (
                                <button
                                    key={type.label}
                                    onClick={() => setSelectedType(type)}
                                    className={`p-2 rounded border text-left text-sm flex items-center gap-2 transition-all
                                        ${selectedType.label === type.label
                                            ? 'bg-neon-red/20 border-neon-red text-white'
                                            : 'bg-dark-bg border-white/5 text-gray-400 hover:border-white/20'
                                        }`}
                                >
                                    <span>{type.icon}</span>
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <NeonButton
                            onClick={handleSubmit}
                            disabled={!target || isSubmitting}
                            variant="danger"
                            className="w-full justify-center"
                        >
                            {isSubmitting ? 'BROADCASTING TO NETWORK...' : 'SUBMIT REPORT'}
                        </NeonButton>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default ReportModal;
