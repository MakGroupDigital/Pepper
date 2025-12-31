import React, { useState, useCallback, useEffect } from 'react';
import { Heart, MessageSquare, Send, Flame, Zap } from 'lucide-react';
import { Post } from '../types';
import { SpiceMeter } from './SpiceMeter';

interface FlowCardProps {
  post: Post;
  onNext: () => void;
  onSpice: (level: number) => void;
  onComment: () => void;
  onShare: () => void;
}

export const FlowCard: React.FC<FlowCardProps> = ({ 
  post, 
  onNext, 
  onSpice,
  onComment,
  onShare 
}) => {
  const [liked, setLiked] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [showNeonEffect, setShowNeonEffect] = useState(false);

  const triggerHaptic = useCallback((intensity: number) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(intensity);
    }
  }, []);

  const [finalSpiceLevel, setFinalSpiceLevel] = useState(0);
  const [hasSpiced, setHasSpiced] = useState(false);

  // Spice meter logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPressing && !hasSpiced) {
      interval = setInterval(() => {
        setSpiceLevel(prev => {
          const next = Math.min(prev + 4, 100);
          if (next % 10 === 0) triggerHaptic(15);
          if (next >= 85 && !showNeonEffect) {
            setShowNeonEffect(true);
            triggerHaptic(100);
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPressing, hasSpiced, triggerHaptic, showNeonEffect]);

  // When user releases, lock in the spice level
  useEffect(() => {
    if (!isPressing && spiceLevel > 0 && !hasSpiced) {
      setFinalSpiceLevel(spiceLevel);
      setHasSpiced(true);
      onSpice(spiceLevel);
    }
  }, [isPressing, spiceLevel, hasSpiced, onSpice]);

  // Reset neon effect
  useEffect(() => {
    if (spiceLevel < 80) {
      setShowNeonEffect(false);
    }
  }, [spiceLevel]);

  const getMoodFilter = (mood?: string) => {
    switch(mood) {
      case 'cyberpunk': return 'hue-rotate(180deg) saturate(1.5) contrast(1.1)';
      case 'vintage': return 'sepia(0.5) contrast(0.8) brightness(0.9)';
      case 'anime': return 'saturate(2) brightness(1.1) contrast(1.2)';
      case 'neon': return 'saturate(1.8) brightness(1.2) hue-rotate(30deg)';
      case 'film_noir': return 'grayscale(0.8) contrast(1.3) brightness(0.8)';
      case 'vaporwave': return 'hue-rotate(270deg) saturate(1.5) brightness(1.1)';
      default: return 'none';
    }
  };

  const handleSpiceComplete = (level: number) => {
    onSpice(level);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div 
      className="relative w-full aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl group transition-all duration-500 hover:scale-[1.01] bg-[#111] border border-white/5"
      onDoubleClick={onNext}
    >
      {/* Media Content with Mood Filter */}
      <div 
        className="absolute inset-0 transition-transform duration-700 pointer-events-none"
        style={{ 
          filter: getMoodFilter(post.mood),
          transform: `scale(${1 + spiceLevel / 500})` 
        }}
      >
        <img 
          src={post.thumbnail} 
          alt="Post Content" 
          className="w-full h-full object-cover opacity-60 transition-all duration-300"
          style={{ 
            filter: spiceLevel > 80 ? 'blur(10px) contrast(1.5)' : 'none'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-black/90" />
      </div>

      {/* Neon Distortion Effect (when Extra Fort) */}
      {showNeonEffect && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 mix-blend-screen opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-transparent to-fuchsia-500 animate-pulse" />
          </div>
          <div 
            className="absolute inset-0 animate-glitch"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)'
            }}
          />
        </div>
      )}

      {/* Center Interaction Indicator */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {isPressing && (
          <div className="relative">
            <Zap 
              size={80} 
              className={`transition-all duration-200 ${
                spiceLevel > 70 
                  ? 'text-fuchsia-500 drop-shadow-[0_0_30px_rgba(217,70,239,0.8)]' 
                  : 'text-cyan-400 opacity-50'
              }`} 
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-4 border-white/10 rounded-full animate-ping" />
          </div>
        )}
      </div>

      {/* Spice Meter */}
      <SpiceMeter 
        level={hasSpiced ? finalSpiceLevel : spiceLevel} 
        isPressing={isPressing} 
        onSpiceComplete={handleSpiceComplete}
      />

      {/* Post Info Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            {/* Trending Badge */}
            {post.isTrending && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-white/10 rounded-full mb-3">
                <Flame size={12} className="text-fuchsia-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">Trending</span>
              </div>
            )}
            
            {/* User Info */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-12 h-12 rounded-2xl border-2 border-fuchsia-500 overflow-hidden bg-white/20 p-1">
                <img src={post.avatar} className="w-full h-full object-cover rounded-xl" alt="avatar" />
              </div>
              <div>
                <h3 className="font-black text-lg italic tracking-tighter">{post.username}</h3>
                <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest">@{post.username.toLowerCase()}</p>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-slate-200 line-clamp-2 font-medium mb-2">
              {post.description}
            </p>
            
            {/* Hashtags */}
            <div className="flex flex-wrap gap-2">
              {post.hashtags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs text-cyan-400/80 font-bold">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interaction Buttons */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-5 pointer-events-auto">
        {/* Like Button */}
        <button 
          onClick={() => setLiked(!liked)}
          className="group flex flex-col items-center gap-1"
        >
          <div className={`p-4 rounded-[22px] backdrop-blur-xl border transition-all duration-300 ${
            liked 
              ? 'bg-fuchsia-500 border-fuchsia-400 shadow-lg shadow-fuchsia-500/20' 
              : 'bg-white/10 border-white/10'
          }`}>
            <Heart size={24} fill={liked ? 'white' : 'none'} className={liked ? 'scale-110' : ''} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {formatCount(liked ? post.spiceCount + 1 : post.spiceCount)}
          </span>
        </button>

        {/* Spice Button */}
        <div className="group flex flex-col items-center gap-1">
          <button 
            onMouseDown={() => setIsPressing(true)}
            onMouseUp={() => setIsPressing(false)}
            onMouseLeave={() => setIsPressing(false)}
            onTouchStart={(e) => { e.preventDefault(); setIsPressing(true); }}
            onTouchEnd={(e) => { e.preventDefault(); setIsPressing(false); }}
            className={`p-4 rounded-[22px] backdrop-blur-xl border transition-all duration-300 ${
              hasSpiced
                ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 border-fuchsia-400'
                : isPressing 
                ? 'bg-cyan-500 border-cyan-400 scale-90 rotate-12' 
                : 'bg-white/10 border-white/10'
            }`}
          >
            <Flame 
              size={24} 
              fill={spiceLevel > 0 ? "white" : "none"} 
              className={isPressing ? 'animate-bounce' : ''} 
            />
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {hasSpiced ? `${finalSpiceLevel}%` : spiceLevel > 0 ? `${spiceLevel}%` : 'Spice'}
          </span>
        </div>

        {/* Comment Button */}
        <button onClick={onComment} className="group flex flex-col items-center gap-1">
          <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[22px] hover:bg-white/20 transition-all">
            <MessageSquare size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">
            {formatCount(post.comments)}
          </span>
        </button>

        {/* Share Button */}
        <button onClick={onShare} className="group flex flex-col items-center gap-1">
          <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-[22px] hover:bg-white/20 transition-all">
            <Send size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
        </button>
      </div>

      <style>{`
        @keyframes glitch {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          60% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
        }
        .animate-glitch {
          animation: glitch 0.3s infinite;
        }
      `}</style>
    </div>
  );
};
