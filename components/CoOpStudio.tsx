import React, { useState, useRef } from 'react';
import { Users, Move, ZoomIn, ZoomOut, RotateCcw, Check, X, Sparkles, Video } from 'lucide-react';
import { Post, CoOpParticipant } from '../types';

interface CoOpStudioProps {
  originalPost: Post;
  onClose: () => void;
  onSave: (participants: CoOpParticipant[]) => void;
}

export const CoOpStudio: React.FC<CoOpStudioProps> = ({ originalPost, onClose, onSave }) => {
  const [participants, setParticipants] = useState<CoOpParticipant[]>([
    {
      id: 'user',
      username: 'Toi',
      avatar: 'https://picsum.photos/seed/user1/100',
      position: { x: 70, y: 60 },
      scale: 1
    }
  ]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('user');
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !selectedParticipant || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setParticipants(prev => prev.map(p => 
      p.id === selectedParticipant 
        ? { ...p, position: { x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) } }
        : p
    ));
  };

  const adjustScale = (delta: number) => {
    if (!selectedParticipant) return;
    setParticipants(prev => prev.map(p => 
      p.id === selectedParticipant 
        ? { ...p, scale: Math.max(0.5, Math.min(2, p.scale + delta)) }
        : p
    ));
  };

  const resetPosition = () => {
    if (!selectedParticipant) return;
    setParticipants(prev => prev.map(p => 
      p.id === selectedParticipant 
        ? { ...p, position: { x: 70, y: 60 }, scale: 1 }
        : p
    ));
  };

  const selected = participants.find(p => p.id === selectedParticipant);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/10"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <Users size={18} className="text-fuchsia-400" />
          <span className="font-black italic">Peperr Co-Op</span>
        </div>

        <button 
          onClick={() => onSave(participants)}
          className="p-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-2xl"
        >
          <Check size={20} />
        </button>
      </div>

      {/* Preview Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative mx-4 rounded-3xl overflow-hidden bg-[#111] border border-white/10"
        onMouseMove={handleDrag}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={handleDrag}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* Original Video/Image */}
        <img 
          src={originalPost.thumbnail}
          alt="Original"
          className="w-full h-full object-cover"
        />

        {/* Participants Overlay */}
        {participants.map(participant => (
          <div
            key={participant.id}
            className={`absolute cursor-move transition-all ${
              selectedParticipant === participant.id ? 'z-20' : 'z-10'
            }`}
            style={{
              left: `${participant.position.x}%`,
              top: `${participant.position.y}%`,
              transform: `translate(-50%, -50%) scale(${participant.scale})`
            }}
            onMouseDown={() => {
              setSelectedParticipant(participant.id);
              setIsDragging(true);
            }}
            onTouchStart={() => {
              setSelectedParticipant(participant.id);
              setIsDragging(true);
            }}
          >
            {/* Participant Preview (simulated green screen removal) */}
            <div className={`relative ${selectedParticipant === participant.id ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-transparent' : ''}`}>
              <div className="w-32 h-48 rounded-2xl overflow-hidden bg-gradient-to-b from-fuchsia-500/20 to-cyan-500/20 backdrop-blur-sm border-2 border-white/20">
                <img 
                  src={participant.avatar}
                  alt={participant.username}
                  className="w-full h-full object-cover"
                  style={{ 
                    mixBlendMode: 'normal',
                    filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))'
                  }}
                />
              </div>
              
              {/* Username Tag */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-xl rounded-full border border-white/20">
                <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                  @{participant.username.toLowerCase()}
                </span>
              </div>

              {/* Move Indicator */}
              {selectedParticipant === participant.id && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-500 rounded-xl flex items-center justify-center animate-pulse">
                  <Move size={14} />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20% 20%'
          }} />
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-red-500/20 backdrop-blur-xl rounded-full border border-red-500/50">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-red-400">REC</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Scale Controls */}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => adjustScale(-0.1)}
            className="p-4 bg-white/10 rounded-2xl border border-white/10 active:scale-95 transition-transform"
          >
            <ZoomOut size={20} />
          </button>
          
          <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-sm font-bold">{Math.round((selected?.scale || 1) * 100)}%</span>
          </div>
          
          <button 
            onClick={() => adjustScale(0.1)}
            className="p-4 bg-white/10 rounded-2xl border border-white/10 active:scale-95 transition-transform"
          >
            <ZoomIn size={20} />
          </button>
          
          <button 
            onClick={resetPosition}
            className="p-4 bg-white/10 rounded-2xl border border-white/10 active:scale-95 transition-transform"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-fuchsia-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles size={18} className="text-fuchsia-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">Suppression de fond IA</h4>
              <p className="text-xs text-white/60 leading-relaxed">
                L'IA supprime automatiquement ton fond pour t'incruster dans la vidéo. 
                Déplace et redimensionne ton avatar pour créer le duo parfait !
              </p>
            </div>
          </div>
        </div>

        {/* Record Button */}
        <button 
          onClick={() => setIsRecording(!isRecording)}
          className={`w-full py-5 rounded-3xl font-black uppercase tracking-wider flex items-center justify-center gap-3 active:scale-95 transition-all ${
            isRecording 
              ? 'bg-red-500 shadow-lg shadow-red-500/30' 
              : 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30'
          }`}
        >
          <Video size={20} />
          {isRecording ? 'Arrêter' : 'Commencer le Co-Op'}
        </button>
      </div>
    </div>
  );
};
