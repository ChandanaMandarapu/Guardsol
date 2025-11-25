import React from 'react';

const GlassCard = ({ children, className = '', hoverEffect = false, ...props }) => {
    return (
        <div
            className={`
        glass-panel rounded-2xl p-6 
        ${hoverEffect ? 'glass-panel-hover cursor-pointer' : ''} 
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};

export default GlassCard;
