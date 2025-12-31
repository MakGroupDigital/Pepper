import React, { useState } from 'react';
import { Camera, Sparkles, Users, X, ChevronRight, Video, Image, Music, Wand2, Send, Loader2 } from 'lucide-react';
import { IAStyler } from './IAStyler';
import { CameraStudio } from './CameraStudio';
import { StyleFilter } from '../types';

interface CreateStudioProps {
  onClose: () => void;
  onStartCoOp: () => void;
  onPublish: (mediaData: string, mediaType: 'photo' | 'video', description: string, mood?: string) => Promise<boolean>;
  aiIdea?: { title: string; description: string; suggestedMusic: string } | null;
  onGenerateIdea: () => void;
  isGenerating: boolean;
  isPublishing?: boolean;
}

export const CreateStudio: React.FC<CreateStudioProps> = ({
  onClose,
  onStartCoOp,
  onPublish,
  aiIdea,
  onGenerateIdea,
  isGenerating,
  isPublishing = false
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'video' | 'styler' | 'preview' | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<StyleFilter | undefined>();
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [capturedType, setCapturedType] = useState<'photo' | 'video'>('photo');
  const [description, setDescription] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('default');

  const moods = [
    { id: 'default', name: 'Normal', emoji: '✨' },
    { id: 'cyberpunk', name: 'Cyberpunk', emoji: '🌆' },
    { id: 'vintage', name: 'Vintage', emoji: '📼' },
    { id: 'anime', name: 'Anime', emoji: '🎌' },
    { id: 'neon', name: 'Neon', emoji: '💜' },
    { id: 'vaporwave', name: 'Vaporwave', emoji: '🌴' },
  ];

  const handleCapture = (data: string, type: 'photo' | 'video') => {
    console.log('🌶️ CreateStudio: Media captured', { type, dataLength: data?.length });
    setCapturedMedia(data);
    setCapturedType(type);
    setActiveMode('preview');
  };

  const handlePublish = async () => {
    console.log('🌶️ CreateStudio: handlePublish called', { 
      hasCapturedMedia: !!capturedMedia, 
      capturedType, 
      description,
      selectedMood 
    });
    
    if (!capturedMedia) {
      console.error('🌶️ CreateStudio: No captured media!');
      return;
    }
    
    console.log('🌶️ CreateStudio: Calling onPublish...');
    const success = await onPublish(capturedMedia, capturedType, description, selectedMood);
    console.log('🌶️ CreateStudio: onPublish result:', success);
    
    if (success) {
      // Reset state
      setCapturedMedia(null);
      setDescription('');
      setSelectedMood('default');
      setActiveMode(null);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedMedia(null);
    setActiveMode(capturedType === 'photo' ? 'camera' : 'video');
  };

  // Camera Mode
  if (activeMode === 'camera') {
    return (
      <CameraStudio 
        mode="photo" 
        onClose={() => setActiveMode(null)} 
        onCapture={(data) => handleCapture(data, 'photo')} 
      />
    );
  }

  // Video Mode
  if (activeMode === 'video') {
    return (
      <CameraStudio 
        mode="video" 
        onClose={() => setActiveMode(null)} 
        onCapture={(data) => handleCapture(data, 'video')} 
      />
    );
  }

  // Preview & Publish Mode
  if (activeMode === 'preview' && capturedMedia) {
    return (
      <div className="flex-1 flex flex-col bg-[#050505] h-full overflow-hidden">
        {/* Header */}
        <div className="p-4 pt-12 flex items-center justify-between border-b border-white/10">
          <button 
            onClick={handleRetake}
            className="p-2 bg-white/10 rounded-xl"
          >
            <X size={20} />
          </button>
          <span className="font-black italic uppercase">Nouvelle publication</span>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {isPublishing ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Publier
              </>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-32">
          {/* Media Preview */}
          <div className="aspect-[3/4] rounded-3xl overflow-hidden mb-6 bg-black relative">
            {capturedType === 'photo' ? (
              <img 
                src={capturedMedia} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <video 
                src={capturedMedia} 
                className="w-full h-full object-cover"
                controls
                autoPlay
                loop
                muted
              />
            )}
            
            {/* Media Type Badge */}
            <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-xl rounded-full">
              <span className="text-xs font-bold uppercase">
                {capturedType === 'photo' ? '📷 Photo' : '🎬 Vidéo'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décris ton contenu... #hashtags"
              className="w-full h-24 p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-cyan-500 transition-colors"
              maxLength={500}
            />
            <div className="text-right text-xs text-white/30 mt-1">
              {description.length}/500
            </div>
          </div>

          {/* Mood Selection */}
          <div className="mb-6">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 block">
              Mood / Style
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    selectedMood === mood.id
                      ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white'
                      : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {mood.emoji} {mood.name}
                </button>
              ))}
            </div>
          </div>

          {/* AI Suggestion */}
          {aiIdea && (
            <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-white/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-fuchsia-400" />
                <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">
                  Suggestion IA
                </span>
              </div>
              <p className="text-sm text-white/60">{aiIdea.description}</p>
              <button
                onClick={() => setDescription(prev => prev + ' ' + aiIdea.description)}
                className="mt-2 text-xs text-cyan-400 font-bold"
              >
                + Ajouter à la description
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // IA Stylist Mode
  if (activeMode === 'styler') {
    return (
      <div className="flex-1 flex flex-col bg-black h-full overflow-y-auto pb-32">
        <div className="p-4 pt-12 flex items-center justify-between">
          <button 
            onClick={() => setActiveMode(null)}
            className="p-3 bg-white/10 rounded-2xl"
          >
            <X size={20} />
          </button>
          <span className="font-black italic">IA Stylist</span>
          <div className="w-11" />
        </div>
        <div className="px-4 flex-1">
          <IAStyler 
            onSelectFilter={setSelectedFilter}
            selectedFilter={selectedFilter}
          />
        </div>
      </div>
    );
  }

  // Main Menu
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-black h-full overflow-y-auto pb-32">
      {/* Hero Icon */}
      <div className="w-28 h-28 bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center mb-8 relative">
        <Camera size={48} className="text-white" />
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-fuchsia-500 rounded-2xl flex items-center justify-center animate-pulse">
          <Sparkles size={16} />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-black italic mb-2 tracking-tighter">PRÊT À PIMENTER ?</h1>
      <p className="text-white/40 mb-10 text-sm font-bold">
        Ton audience attend sa dose de piment quotidien.
      </p>

      {/* Creation Options */}
      <div className="w-full space-y-3 mb-8">
        {/* Camera Option */}
        <button 
          onClick={() => setActiveMode('camera')}
          className="w-full p-5 bg-white/5 border border-white/10 rounded-[28px] flex items-center justify-between group hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-fuchsia-500/20 rounded-2xl flex items-center justify-center">
              <Image className="text-fuchsia-400" size={22} />
            </div>
            <div className="text-left">
              <div className="font-black italic uppercase">Photo</div>
              <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                Capture l'instant
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
        </button>

        {/* Video Option */}
        <button 
          onClick={() => setActiveMode('video')}
          className="w-full p-5 bg-white/5 border border-white/10 rounded-[28px] flex items-center justify-between group hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
              <Video className="text-cyan-400" size={22} />
            </div>
            <div className="text-left">
              <div className="font-black italic uppercase">Vidéo</div>
              <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                Enregistre un clip
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
        </button>

        {/* IA Stylist Option */}
        <button 
          onClick={() => setActiveMode('styler')}
          className="w-full p-5 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-white/10 rounded-[28px] flex items-center justify-between group hover:from-cyan-500/20 hover:to-fuchsia-500/20 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-fuchsia-500/30 rounded-2xl flex items-center justify-center">
              <Wand2 className="text-white" size={22} />
            </div>
            <div className="text-left">
              <div className="font-black italic uppercase flex items-center gap-2">
                IA Stylist
                <span className="text-[8px] px-2 py-0.5 bg-fuchsia-500 rounded-full normal-case font-bold">
                  NEW
                </span>
              </div>
              <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                L'IA gère ton style
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
        </button>

        {/* Co-Op Option */}
        <button 
          onClick={onStartCoOp}
          className="w-full p-5 bg-white/5 border border-white/10 rounded-[28px] flex items-center justify-between group hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
              <Users className="text-green-400" size={22} />
            </div>
            <div className="text-left">
              <div className="font-black italic uppercase">Peperr Co-Op</div>
              <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                Duo collaboratif
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* AI Challenge Idea */}
      <div className="w-full mb-8">
        <button 
          onClick={onGenerateIdea}
          disabled={isGenerating}
          className="w-full p-4 bg-white/5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center gap-3 text-white/60 hover:text-white hover:border-white/40 transition-all disabled:opacity-50"
        >
          <Sparkles size={18} className={isGenerating ? 'animate-spin' : ''} />
          <span className="text-sm font-bold">
            {isGenerating ? 'Génération en cours...' : 'Générer une idée avec l\'IA'}
          </span>
        </button>

        {aiIdea && (
          <div className="mt-4 p-4 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-white/10 rounded-2xl text-left animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-fuchsia-400" />
              <span className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest">
                Défi IA du jour
              </span>
            </div>
            <div className="font-bold text-sm mb-1 uppercase italic tracking-tighter">
              {aiIdea.title}
            </div>
            <div className="text-xs text-white/60 mb-3">{aiIdea.description}</div>
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <Music size={12} />
              <span className="font-bold">{aiIdea.suggestedMusic}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main CTA */}
      <button 
        onClick={() => setActiveMode('video')}
        className="w-full py-5 bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-black rounded-3xl active:scale-95 transition-all shadow-[0_10px_40px_rgba(217,70,239,0.3)] uppercase tracking-widest flex items-center justify-center gap-3"
      >
        <Camera size={20} />
        Ouvrir le Studio
      </button>
    </div>
  );
};
