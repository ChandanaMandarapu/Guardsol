import React from 'react';

export default function ExportButton() {
    const handlePrint = () => {
        window.print();
    };

    return (
        <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 border border-white border-opacity-40 text-white font-semibold rounded-lg transition-colors"
            title="Save as PDF"
        >
            <span>📄</span>
            <span className="hidden sm:inline">Export PDF</span>
        </button>
    );
}
