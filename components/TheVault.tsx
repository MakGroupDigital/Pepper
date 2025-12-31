import React, { useState } from 'react';
import { Lock, Plus, ChevronRight, Clock, Users, Check, X, Camera } from 'lucide-react';
import { VaultCircle, VaultMember } from '../types';

interface TheVaultProps {
  circles: VaultCircle[];
  onCreateCircle: () => void;
  onEnterCircle: (circleId: string) => void;
}

const MOCK_MEMBERS: VaultMember[] = [
  { id: '1', name: 'Toi', avatar: 'https://picsum.photos/seed/user1/100', hasPosted: true },
  { id: '2', name: 'Marc', avatar: 'https://picsum.photos/seed/marc/100', hasPosted: true },
  { id: '3', name: 'Sarah', avatar: 'https://picsum.photos/seed/sarah/100', hasPosted: false },
];

export const TheVault: React.FC<TheVaultProps> = ({ circles, onCreateCircle, onEnterCircle }) => {
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getTimeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getMembersWhoPosted = (members: VaultMember[]): number => {
    return members.filter(m => m.hasPosted).length;
  };

  return (
    <div className="flex-1 px-6 pt-6 overflow-y-auto pb-32 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">The Vault</h2>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
            Contenu éphémère de groupe
          </p>
        </div>
        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
          <Lock size={20} />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-white/10 rounded-3xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-fuchsia-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-fuchsia-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm mb-1">Comment ça marche ?</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Le contenu du Vault s'autodétruit après 24h, mais <span className="text-cyan-400 font-bold">uniquement si tout le monde a posté</span>. 
              Sinon, personne ne voit rien ! 🔥
            </p>
          </div>
        </div>
      </div>

      {/* Circles List */}
      <div className="space-y-4">
        {circles.map(circle => {
          const members = MOCK_MEMBERS; // In real app, use circle.members
          const postedCount = getMembersWhoPosted(members);
          const allPosted = postedCount === members.length;
          
          return (
            <div 
              key={circle.id} 
              className="bg-white/5 border border-white/10 rounded-[32px] p-5 relative group overflow-hidden"
            >
              {/* Background Glow */}
              <div className={`absolute top-[-20%] right-[-10%] w-32 h-32 blur-[50px] transition-all ${
                allPosted ? 'bg-green-500/20' : circle.isLocked ? 'bg-fuchsia-500/10' : 'bg-cyan-500/10'
              } group-hover:opacity-100 opacity-50`} />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 relative">
                <div>
                  <h3 className="text-xl font-black mb-1">{circle.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-white/40 font-bold">
                    <Users size={12} />
                    <span>{members.length} membres</span>
                    <span>•</span>
                    <Clock size={12} />
                    <span>Expire dans {getTimeRemaining(circle.expiresAt)}</span>
                  </div>
                </div>
                
                {/* Status Badge */}
                {allPosted ? (
                  <div className="px-3 py-1.5 bg-green-500/20 text-green-400 text-[10px] font-black rounded-full uppercase flex items-center gap-1">
                    <Check size={12} />
                    Débloqué
                  </div>
                ) : circle.isLocked ? (
                  <div className="px-3 py-1.5 bg-fuchsia-500/20 text-fuchsia-400 text-[10px] font-black rounded-full uppercase flex items-center gap-1">
                    <Lock size={12} />
                    Verrouillé
                  </div>
                ) : (
                  <div className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-black rounded-full uppercase">
                    En attente
                  </div>
                )}
              </div>

              {/* Members Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Progression du groupe
                  </span>
                  <span className="text-xs font-bold text-cyan-400">
                    {postedCount}/{members.length}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      allPosted 
                        ? 'bg-gradient-to-r from-green-400 to-cyan-400' 
                        : 'bg-gradient-to-r from-cyan-500 to-fuchsia-500'
                    }`}
                    style={{ width: `${(postedCount / members.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Members Avatars */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {members.map(member => (
                    <div 
                      key={member.id} 
                      className={`relative w-10 h-10 rounded-xl border-2 border-[#111] overflow-hidden ${
                        member.hasPosted ? '' : 'opacity-40'
                      }`}
                    >
                      <img src={member.avatar} className="w-full h-full object-cover" alt={member.name} />
                      {member.hasPosted && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-tl-lg flex items-center justify-center">
                          <Check size={10} />
                        </div>
                      )}
                      {!member.hasPosted && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <X size={14} className="text-white/60" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => allPosted ? onEnterCircle(circle.id) : null}
                  disabled={!allPosted}
                  className={`flex items-center gap-2 text-sm font-black italic transition-all ${
                    allPosted 
                      ? 'text-cyan-400 hover:text-white' 
                      : 'text-white/20 cursor-not-allowed'
                  }`}
                >
                  {allPosted ? 'Voir le contenu' : 'En attente...'}
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Post CTA if user hasn't posted */}
              {!members.find(m => m.name === 'Toi')?.hasPosted && (
                <button className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform">
                  <Camera size={16} />
                  Poster pour débloquer
                </button>
              )}
            </div>
          );
        })}

        {/* Create New Circle */}
        <button 
          onClick={onCreateCircle}
          className="w-full py-8 border-2 border-dashed border-white/10 rounded-[32px] flex flex-col items-center gap-3 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
        >
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <Plus size={24} />
          </div>
          <div>
            <span className="text-sm font-black uppercase tracking-widest block">Nouveau Cercle</span>
            <span className="text-[10px] text-white/40">Invite tes amis proches</span>
          </div>
        </button>
      </div>
    </div>
  );
};
