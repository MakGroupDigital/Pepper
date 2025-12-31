import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Headphones, Smartphone, Music, Sparkles } from 'lucide-react';
import { AudioLayer } from '../types';

interface SoundSpheresProps {
  audioLayers: AudioLayer[];
  isActive: boolean;
}

export const SoundSpheres: React.FC<SoundSpheresProps> = ({ audioLayers, isActive }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [showHint, setShowHint] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const handler = (e: DeviceOrientationEvent) => {
      const x = e.gamma ? e.gamma / 45 : 0;
      const y = e.beta ? (e.beta - 45) / 45 : 0;
      setTilt({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [isActive]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getVolume = useCallback((layer: AudioLayer) => {
    if (isMuted) return 0;
    return layer.volume * (1 - Math.abs(tilt.x - layer.pan) / 2);
  }, [tilt, isMuted]);

  return (
    <div className="absolute bottom-4 left-4 right-4 z-30">
      {showHint && isActive && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
            <Smartphone size={16} className="text-cyan-400" />
            <span className="text-xs font-bold text-white/80">Penche ton tel!</span>
          </div>
        </div>
      )}
      <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-cyan-400" />
            <span className="text-xs font-black uppercase tracking-widest">Sound Spheres</span>
          </div>
          <button onClick={() => setIsMuted(!isMuted)} className={`p-2 rounded-xl ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-white/10'}`}>
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
        <div className="space-y-3">
          {audioLayers.map((layer) => {
            const show = !layer.isHidden || discovered.includes(layer.id);
            const vol = getVolume(layer);
            return (
              <div key={layer.id} className={`flex items-center gap-3 ${show ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${layer.isHidden ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-white/10 text-white/60'}`}>
                  {layer.isHidden ? <Sparkles size={14} /> : <Music size={14} />}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold">{show ? layer.name : '???'}</span>
                  <div className="h-1.5 bg-white/10 rounded-full mt-1">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500" style={{ width: `${vol * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
