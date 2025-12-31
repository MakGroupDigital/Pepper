import React from 'react';
import { X, Copy, MessageCircle, Instagram, Link2, Download, Users, Check } from 'lucide-react';

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({ isOpen, onClose, postId }) => {
  const [copied, setCopied] = React.useState(false);

  const shareOptions = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500/20 text-green-400' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-pink-500/20 text-pink-400' },
    { id: 'coop', name: 'Co-Op', icon: Users, color: 'bg-cyan-500/20 text-cyan-400' },
    { id: 'download', name: 'Télécharger', icon: Download, color: 'bg-white/10 text-white' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://peperr.app/p/${postId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#111] rounded-t-[32px] border-t border-white/10 animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4">
          <h3 className="font-black text-lg italic">Partager</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 rounded-xl"
          >
            <X size={18} />
          </button>
        </div>

        {/* Share Options */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            {shareOptions.map(option => (
              <button 
                key={option.id}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${option.color}`}>
                  <option.icon size={24} />
                </div>
                <span className="text-[10px] font-bold text-white/60">{option.name}</span>
              </button>
            ))}
          </div>

          {/* Copy Link */}
          <button 
            onClick={handleCopyLink}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                {copied ? <Check size={18} className="text-green-400" /> : <Link2 size={18} />}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">{copied ? 'Copié !' : 'Copier le lien'}</div>
                <div className="text-[10px] text-white/40">peperr.app/p/{postId.slice(0, 8)}...</div>
              </div>
            </div>
            <Copy size={18} className="text-white/40" />
          </button>

          {/* Watermark Info */}
          <p className="text-center text-[10px] text-white/30 mt-4">
            Le watermark Peperr sera ajouté automatiquement 🌶️
          </p>
        </div>
      </div>
    </div>
  );
};
