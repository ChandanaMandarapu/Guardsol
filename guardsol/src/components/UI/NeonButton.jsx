import React from 'react';

const NeonButton = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "font-semibold rounded-xl px-6 py-3 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none";

    const variants = {
        primary: "bg-neon-gradient text-black hover:shadow-neon-blue hover:-translate-y-0.5",
        danger: "bg-danger-gradient text-white hover:shadow-neon-red hover:-translate-y-0.5",
        ghost: "bg-white/5 text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/10 hover:border-neon-blue/50",
        outline: "bg-transparent text-text-secondary border border-white/10 hover:border-white/30 hover:text-white"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default NeonButton;
