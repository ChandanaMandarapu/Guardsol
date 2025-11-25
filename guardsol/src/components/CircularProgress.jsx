import React, { useEffect, useState } from 'react';
// CIRCULAR PROGRESS COMPONENT
// Shows score as animated circle (like Apple Health)
export default function CircularProgress({ score, size = 200, strokeWidth = 20 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animate score from 0 to actual value (smooth count-up)
  useEffect(() => {
    let start = 0;
    const end = score;
    const duration = 1500; // 1.5 seconds
    const increment = end / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedScore(end);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  // Calculate circle measurements
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const remaining = circumference - progress;

  // Get color based on score (neon theme)
  const getColor = (score) => {
    if (score >= 90) return '#00FFAF'; // neon-green
    if (score >= 75) return '#00F6FF'; // neon-blue
    if (score >= 60) return '#FFD60A'; // neon-yellow
    if (score >= 40) return '#FF9500'; // neon-orange
    return '#FF3B30'; // neon-red
  };

  const color = getColor(animatedScore);

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* SVG Circle */}
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle (dark) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle (colored with glow) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={remaining}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease',
            filter: `drop-shadow(0 0 8px ${color})`
          }}
        />
      </svg>

      {/* Score number in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-bold text-white">
          {animatedScore}
        </div>
        <div className="text-sm text-text-muted font-semibold">
          / 100
        </div>
      </div>
    </div>
  );
}