import React from 'react';

interface LegacyBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LegacyBadge: React.FC<LegacyBadgeProps> = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-64 h-64',
  };

  const textSizes = {
    sm: 'text-[6px]',
    md: 'text-[10px]',
    lg: 'text-sm',
  };

  const numberSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-7xl',
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${sizes[size]} ${className}`}>
      
      {/* Main Outer Circle - Heavy Stroke */}
      <div className="absolute inset-0 rounded-full border-[1px] border-white/20 backdrop-blur-sm"></div>
      
      {/* Offset Volt Ring (Glitch Effect) */}
      <div className="absolute inset-[2px] rounded-full border border-[#CCFF00] opacity-60 animate-pulse mix-blend-screen transform translate-x-[1px] translate-y-[1px]"></div>

      {/* Inner Rotating Technical Ring */}
      <div className="absolute inset-2 rounded-full border border-dashed border-white/30 animate-[spin_12s_linear_infinite]"></div>
      
      {/* Center Solid Mass */}
      <div className="absolute inset-4 rounded-full flex items-center justify-center z-10 border border-white/10 shadow-2xl">
        
        {/* Shine Reflection */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full"></div>

        <div className="flex flex-col items-center justify-center text-white leading-none relative z-20">
          <div className={`font-tech uppercase tracking-[0.3em] text-gray-500 mb-1 ${textSizes[size]}`}>Club</div>
          <div className={`font-black italic tracking-tighter ${numberSizes[size]}`}>
            <span className="chrome-text">TB</span>
          </div>
          <div className={`font-tech text-[#CCFF00] tracking-[0.3em] mt-2 ${textSizes[size]}`}>BETS</div>
        </div>
        
        {/* Crosshair Lines */}
        <div className="absolute w-full h-[1px] bg-white/10"></div>
        <div className="absolute h-full w-[1px] bg-white/10"></div>

      </div>
    </div>
  );
};