import React from 'react';

export default function LoadingSpinner({ size = 'md', text = null, fullScreen = false }) {
    const sizes = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
        xl: 'h-16 w-16 border-4'
    };

    const textSizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className={`animate-spin rounded-full border-b-primary border-gray-200 ${sizes[size]}`} />
            {text && (
                <p className={`text-gray-600 font-medium ${textSizes[size]}`}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
}

// Specialized loading components for common scenarios
export function PageLoader({ text = 'Loading...' }) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" text={text} />
        </div>
    );
}

export function SectionLoader({ text = 'Loading...' }) {
    return (
        <div className="py-12 flex items-center justify-center">
            <LoadingSpinner size="md" text={text} />
        </div>
    );
}

export function InlineLoader({ text = null }) {
    return <LoadingSpinner size="sm" text={text} />;
}

export function ButtonLoader() {
    return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
    );
}
