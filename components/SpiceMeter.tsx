import React, { useEffect, useState } from 'react';
import { getSpiceLevelFromPercent, getSpiceLevelLabel } from '../types';

interface SpiceMeterProps {
  level: number;
  isPressing: boolean;
  onSpiceComplete?: (level: number) => void;
}

export const SpiceMeter: React.FC<SpiceMeterProps> = ({ level, isPressing, onSpiceComplete }) => {
  const [showLabel, setShowLabel] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const spiceLevel = getSpiceLevelFromPercent(level);

  useEffect(() => {
    if (level > 0) {
      setShowLabel(true);
    }
    if (!isPressing && level > 10) {
      onSpiceComplete?.(level);
      const timer = setTimeout(() => setShowLabel(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isPressing, level, onSpiceComplete]);

  // Generate particles when level increases
  useEffect(() => {
    if (isPressing && level > 30 && level % 5 === 0) {
      const newParticle = {
        id: Date.now(),
        x: Math.random() * 20 - 10,
        y: Math.random() * 20
      };
      setParticles(prev => [...prev.slice(-10), newParticle]);
    }
  }, [level, isPressing]);

  const getGradient = () => {
    if (level > 85) return 'linear-gradient(to top, #06b6d4, #d946ef, #ff0000, #fff)';
    if (level > 60) return 'linear-gradient(to top, #06b6d4, #d946ef, #ff0000)';
    if (level > 40) return 'linear-gradient(to top, #06b6d4, #d946ef)';
    return '#06b6d4';
  };

  return (
    <>
      {/* Main Meter Bar */}
      <div 
        className={`absolute left-6 top-1/2 -translate-y-1/2 w-2.5 h-72 bg-white/5 rounded-full overflow-hidden border border-white/10 backdrop-blur-xl transition-all duration-300 ${isPressing ? 'scale-x-150 shadow-lg shadow-cyan-500/30' : ''}`}
      >
        {/* Level Fill */}
        <div 
          className="absolute bottom-0 w-full transition-all duration-200 ease-out rounded-full"
          style={{ 
            height: `${level}%`,
            background: getGradient(),
            boxShadow: level > 50 ? '0 0 20px rgba(217, 70, 239, 0.5)' : 'none'
          }}
        >
          {/* Glow point at top */}
          <div 
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full blur-md transition-opacity ${isPressing ? 'opacity-100 animate-ping' : 'opacity-50 animate-pulse'}`}
          />
          
          {/* Sparkles */}
          {level > 50 && (
            <div className="absolute top-0 left-0 w-full h-20 overflow-visible pointer-events-none">
              {particles.map(p => (
                <div 
                  key={p.id}
                  className="absolute w-1.5 h-1.5 bg-white rounded-full animate-float-up"
                  style={{ left: `calc(50% + ${p.x}px)`, top: p.y }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Level markers */}
        <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
          {[100, 75, 50, 25].map(mark => (
            <div 
              key={mark} 
              className={`w-full h-px transition-colors duration-300 ${level >= mark ? 'bg-white/40' : 'bg-white/10'}`}
            />
          ))}
        </div>
      </div>

      {/* Spice Level Label */}
      {showLabel && level > 0 && (
        <div 
          className={`absolute left-14 top-1/2 -translate-y-1/2 px-4 py-2 rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
            spiceLevel === 'extra_fort' 
              ? 'bg-red-500/20 border-red-500/50 animate-pulse' 
              : spiceLevel === 'fort'
              ? 'bg-fuchsia-500/20 border-fuchsia-500/50'
              : spiceLevel === 'moyen'
              ? 'bg-cyan-500/20 border-cyan-500/50'
              : 'bg-white/10 border-white/20'
          }`}
        >
          <span className="text-xs font-black uppercase tracking-wider whitespace-nowrap">
            {getSpiceLevelLabel(spiceLevel)}
          </span>
          <div className="text-[10px] text-white/60 font-bold mt-0.5">
            {level}% de piment
          </div>
        </div>
      )}

      {/* Full screen effects when extra fort */}
      {level > 85 && isPressing && (
        <div className="absolute inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 via-transparent to-fuchsia-500/10 animate-pulse" />
          <div className="absolute inset-0 border-4 border-red-500/30 rounded-[40px] animate-pulse" />
        </div>
      )}

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-40px) scale(0); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up 0.8s ease-out forwards;
        }
      `}</style>
    </>
  );
};
