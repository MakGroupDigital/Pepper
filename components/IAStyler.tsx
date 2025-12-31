import React, { useState } from 'react';
import { Sparkles, Check, Wand2, RefreshCw, ChevronRight } from 'lucide-react';
import { StyleFilter } from '../types';

interface IAStylerProps {
  onSelectFilter: (filter: StyleFilter) => void;
  selectedFilter?: StyleFilter;
  isProcessing?: boolean;
}

const STYLE_FILTERS: StyleFilter[] = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    mood: 'cyberpunk',
    cssFilter: 'hue-rotate(180deg) saturate(1.5) contrast(1.1)',
    overlay: 'linear-gradient(45deg, rgba(0,255,255,0.1), rgba(255,0,255,0.1))',
    isNew: true
  },
  {
    id: 'vintage',
    name: 'Vintage Film',
    mood: 'vintage',
    cssFilter: 'sepia(0.5) contrast(0.9) brightness(0.95)',
    overlay: 'linear-gradient(to bottom, rgba(255,200,100,0.1), transparent)'
  },
  {
    id: 'anime',
    name: 'Anime',
    mood: 'anime',
    cssFilter: 'saturate(2) brightness(1.1) contrast(1.2)',
    overlay: 'none'
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    mood: 'neon',
    cssFilter: 'saturate(1.8) brightness(1.2) hue-rotate(30deg)',
    overlay: 'linear-gradient(to bottom, rgba(255,0,128,0.1), rgba(0,255,255,0.1))',
    isNew: true
  },
  {
    id: 'film_noir',
    name: 'Film Noir',
    mood: 'film_noir',
    cssFilter: 'grayscale(0.8) contrast(1.3) brightness(0.8)',
    overlay: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))'
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    mood: 'vaporwave',
    cssFilter: 'hue-rotate(270deg) saturate(1.5) brightness(1.1)',
    overlay: 'linear-gradient(135deg, rgba(255,0,255,0.15), rgba(0,255,255,0.15))'
  }
];

const PREVIEW_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

export const IAStyler: React.FC<IAStylerProps> = ({ 
  onSelectFilter, 
  selectedFilter,
  isProcessing = false 
}) => {
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);
  const [showAllFilters, setShowAllFilters] = useState(false);

  const displayedFilters = showAllFilters ? STYLE_FILTERS : STYLE_FILTERS.slice(0, 4);
  const previewFilter = hoveredFilter 
    ? STYLE_FILTERS.find(f => f.id === hoveredFilter) 
    : selectedFilter;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-2xl flex items-center justify-center">
            <Wand2 size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-black text-lg italic tracking-tight">IA Stylist</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              Filtres de style vivants
            </p>
          </div>
        </div>
        {isProcessing && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 rounded-full">
            <RefreshCw size={12} className="text-cyan-400 animate-spin" />
            <span className="text-[10px] font-bold text-cyan-400">Processing...</span>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6 bg-[#111] border border-white/10">
        <img 
          src={PREVIEW_IMAGE}
          alt="Preview"
          className="w-full h-full object-cover transition-all duration-500"
          style={{ 
            filter: previewFilter?.cssFilter || 'none'
          }}
        />
        
        {/* Overlay */}
        {previewFilter?.overlay && previewFilter.overlay !== 'none' && (
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{ background: previewFilter.overlay }}
          />
        )}

        {/* Filter Name Badge */}
        {previewFilter && (
          <div className="absolute top-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-fuchsia-400" />
              <span className="text-sm font-black">{previewFilter.name}</span>
            </div>
          </div>
        )}

        {/* Scan Line Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div 
            className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan"
          />
        </div>
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {displayedFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => onSelectFilter(filter)}
            onMouseEnter={() => setHoveredFilter(filter.id)}
            onMouseLeave={() => setHoveredFilter(null)}
            className={`relative p-4 rounded-2xl border transition-all duration-300 ${
              selectedFilter?.id === filter.id
                ? 'bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border-fuchsia-500/50 scale-[1.02]'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            {/* New Badge */}
            {filter.isNew && (
              <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-fuchsia-500 rounded-full">
                <span className="text-[8px] font-black uppercase">New</span>
              </div>
            )}

            {/* Selected Check */}
            {selectedFilter?.id === filter.id && (
              <div className="absolute top-2 left-2 w-5 h-5 bg-fuchsia-500 rounded-lg flex items-center justify-center">
                <Check size={12} />
              </div>
            )}

            {/* Mini Preview */}
            <div 
              className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-[#222]"
            >
              <img 
                src={PREVIEW_IMAGE}
                alt={filter.name}
                className="w-full h-full object-cover"
                style={{ filter: filter.cssFilter }}
              />
            </div>

            {/* Filter Name */}
            <div className="text-left">
              <span className="text-sm font-bold block">{filter.name}</span>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">
                {filter.mood}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Show More */}
      {!showAllFilters && STYLE_FILTERS.length > 4 && (
        <button
          onClick={() => setShowAllFilters(true)}
          className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          Voir tous les filtres ({STYLE_FILTERS.length})
          <ChevronRight size={16} />
        </button>
      )}

      {/* Apply Button */}
      {selectedFilter && (
        <button className="w-full mt-4 py-4 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-fuchsia-500/20">
          <Sparkles size={18} />
          Appliquer {selectedFilter.name}
        </button>
      )}

      <style>{`
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
