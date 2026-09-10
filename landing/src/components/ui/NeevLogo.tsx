'use client';

import React from 'react';

interface NeevLogoProps {
    className?: string;
    size?: number;
    showBadge?: boolean;
}

export default function NeevLogo({ className = '', size = 32, showBadge = true }: NeevLogoProps) {
    return (
        <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                width={size}
                height={size}
                className="overflow-visible"
            >
                <defs>
                    <linearGradient id="neevCyanBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                    </linearGradient>
                    <filter id="neevGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#38bdf8" floodOpacity="0.75" />
                    </filter>
                </defs>

                {showBadge && (
                    <rect
                        width="32"
                        height="32"
                        rx="8"
                        className="fill-slate-950 stroke-blue-500/30"
                        strokeWidth="1"
                    />
                )}

                {/* Foundation beam (Neev = foundation in Sanskrit) */}
                <path
                    d="M5.5 25.5h21"
                    stroke="url(#neevCyanBeam)"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    filter="url(#neevGlow)"
                />

                {/* Structural N column truss */}
                <path
                    d="M8.5 25.5V6.5l15 19V6.5"
                    stroke="#ffffff"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
