import React from 'react';
import NeonButton from './UI/NeonButton';

export default function ExportButton() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <NeonButton
            onClick={handlePrint}
            variant="outline"
            className="flex items-center gap-2"
            title="Save as PDF"
        >
            <span>📄</span>
            <span className="hidden sm:inline">Export PDF</span>
        </NeonButton>
    );
}
