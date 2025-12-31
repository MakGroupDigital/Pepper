import React, { useState } from 'react';
import { X, ChevronLeft, Camera, Send, Clock, Users, Play, Heart, MessageCircle } from 'lucide-react';
import { VaultCircle, VaultMember, VaultPost } from '../types';

interface VaultRoomProps {
  circle: VaultCircle;
  onClose: () => void;
  onPost: () => void;
}

const MOCK_POSTS: VaultPost[] = [
  { id: 'p1', memberId: '1', thumbnail: 'https://picsum.photos/seed/vault1/400/600', createdAt: new Date(Date.now() - 3600000) },
  { id: 'p2', memberId: '2', thumbnail: 'https://picsum.photos/seed/vault2/400/600', createdAt: new Date(Date.now() - 7200000) },
];

export const VaultRoom: React.FC<VaultRoomProps> = ({ circle, onClose, onPost }) => {
  const [selectedPost, setSelectedPost] = useState<VaultPost | null>(null);
  const [liked, setLiked] = useState<string[]>([]);

  const getTimeRemaining = (): string => {
    const diff = circle.expiresAt.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getMember = (memberId: string): VaultMember | undefined => {
    return circle.members.find(m => m.id === memberId);
  };

  const toggleLike = (postId: string) => {
    setLiked(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]);
  };

  if (selectedPost) {
    const member = getMember(selectedPost.memberId);
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={() => setSelectedPost(null)} className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src={member?.avatar} alt="" className="w-8 h-8 rounded-xl object-cover" />
            <span className="font-bold text-sm">{member?.name}</span>
          </div>
          <div className="w-11" />
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          <img 
            src={selectedPost.thumbnail} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-black to-transparent">
          <div className="flex items-center justify-center gap-8">
            <button 
              onClick={() => toggleLike(selectedPost.id)}
              className="flex flex-col items-center gap-1"
            >
              <div className={`p-4 rounded-2xl ${liked.includes(selectedPost.id) ? 'bg-fuchsia-500' : 'bg-white/10'}`}>
                <Heart size={24} fill={liked.includes(selectedPost.id) ? 'white' : 'none'} />
              </div>
              <span className="text-[10px] font-bold text-white/60">Like</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="p-4 rounded-2xl bg-white/10">
                <MessageCircle size={24} />
              </div>
              <span className="text-[10px] font-bold text-white/60">Répondre</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="p-4 rounded-2xl bg-white/10">
                <Send size={24} />
              </div>
              <span className="text-[10px] font-bold text-white/60">Envoyer</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0c] z-50 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-4 px-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="p-2 bg-white/10 rounded-xl">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-fuchsia-500/20 rounded-full">
            <Clock size={14} className="text-fuchsia-400" />
            <span className="text-xs font-bold text-fuchsia-400">{getTimeRemaining()}</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-black italic mb-2">{circle.name}</h2>
        
        {/* Members */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {circle.members.map(member => (
              <img 
                key={member.id}
                src={member.avatar} 
                alt={member.name}
                className="w-8 h-8 rounded-lg border-2 border-[#0a0a0c] object-cover"
              />
            ))}
          </div>
          <span className="text-xs text-white/40 font-bold">
            {circle.members.length} membres
          </span>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {MOCK_POSTS.map(post => {
            const member = getMember(post.memberId);
            return (
              <button
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="aspect-[3/4] rounded-2xl overflow-hidden relative group"
              >
                <img 
                  src={post.thumbnail} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Play indicator */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                    <Play size={20} fill="white" />
                  </div>
                </div>
                
                {/* Member info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <img src={member?.avatar} alt="" className="w-6 h-6 rounded-lg object-cover" />
                  <span className="text-xs font-bold truncate">{member?.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {MOCK_POSTS.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-4">
              <Camera size={32} className="text-white/40" />
            </div>
            <p className="text-white/40 font-bold">Aucun contenu pour l'instant</p>
            <p className="text-xs text-white/20 mt-1">Sois le premier à poster !</p>
          </div>
        )}
      </div>

      {/* Post Button */}
      <div className="p-4 pb-12 border-t border-white/10">
        <button
          onClick={onPost}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Camera size={20} />
          Poster dans le Vault
        </button>
      </div>
    </div>
  );
};
