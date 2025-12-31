import React, { useState } from 'react';
import { X, Send, Flame, Heart } from 'lucide-react';
import { Comment } from '../types';

interface CommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (text: string) => void;
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    username: 'fire_queen',
    avatar: 'https://picsum.photos/seed/c1/100',
    text: 'Cette vidéo est INCROYABLE 🔥🔥🔥',
    spiceLevel: 95,
    timeAgo: '2m',
    replies: [
      {
        id: '1-1',
        username: 'pepper_king',
        avatar: 'https://picsum.photos/seed/c2/100',
        text: 'Tellement d\'accord !!!',
        spiceLevel: 78,
        timeAgo: '1m'
      }
    ]
  },
  {
    id: '2',
    username: 'neon_vibes',
    avatar: 'https://picsum.photos/seed/c3/100',
    text: 'Le style cyberpunk est parfait 💜',
    spiceLevel: 82,
    timeAgo: '5m'
  },
  {
    id: '3',
    username: 'spicy_dancer',
    avatar: 'https://picsum.photos/seed/c4/100',
    text: 'Tutorial please!! 🙏',
    spiceLevel: 45,
    timeAgo: '12m'
  }
];

export const CommentsSheet: React.FC<CommentsSheetProps> = ({
  isOpen,
  onClose,
  comments = MOCK_COMMENTS,
  onAddComment
}) => {
  const [newComment, setNewComment] = useState('');
  const [likedComments, setLikedComments] = useState<string[]>([]);

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const toggleLike = (commentId: string) => {
    setLikedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const getSpiceColor = (level: number) => {
    if (level >= 80) return 'text-red-400';
    if (level >= 60) return 'text-fuchsia-400';
    if (level >= 40) return 'text-cyan-400';
    return 'text-white/40';
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
      <div className="absolute bottom-0 left-0 right-0 bg-[#111] rounded-t-[32px] border-t border-white/10 max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-white/10">
          <h3 className="font-black text-lg italic">Commentaires</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/40 font-bold">{comments.length}</span>
            <button 
              onClick={onClose}
              className="p-2 bg-white/10 rounded-xl"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="space-y-3">
              {/* Main Comment */}
              <div className="flex gap-3">
                <img 
                  src={comment.avatar} 
                  alt={comment.username}
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">@{comment.username}</span>
                    <span className="text-[10px] text-white/30">{comment.timeAgo}</span>
                    {comment.spiceLevel >= 80 && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 rounded-full">
                        <Flame size={10} className="text-red-400" />
                        <span className="text-[8px] font-black text-red-400">HOT</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-white/80 break-words">{comment.text}</p>
                  
                  {/* Spice Level Bar */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-white/10 rounded-full max-w-[100px]">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${comment.spiceLevel}%`,
                          background: comment.spiceLevel >= 80 
                            ? 'linear-gradient(to right, #f43f5e, #ef4444)' 
                            : comment.spiceLevel >= 60
                            ? 'linear-gradient(to right, #d946ef, #f43f5e)'
                            : 'linear-gradient(to right, #06b6d4, #d946ef)'
                        }}
                      />
                    </div>
                    <span className={`text-[10px] font-bold ${getSpiceColor(comment.spiceLevel)}`}>
                      {comment.spiceLevel}%
                    </span>
                  </div>
                </div>

                {/* Like Button */}
                <button 
                  onClick={() => toggleLike(comment.id)}
                  className="flex-shrink-0"
                >
                  <Heart 
                    size={18} 
                    className={likedComments.includes(comment.id) ? 'text-fuchsia-500 fill-fuchsia-500' : 'text-white/30'}
                  />
                </button>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 space-y-3 pl-4 border-l-2 border-white/10">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex gap-3">
                      <img 
                        src={reply.avatar} 
                        alt={reply.username}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs">@{reply.username}</span>
                          <span className="text-[10px] text-white/30">{reply.timeAgo}</span>
                        </div>
                        <p className="text-xs text-white/70">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <img 
              src="https://picsum.photos/seed/user1/100"
              alt="You"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-2xl border border-white/10 px-4 py-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajoute un commentaire épicé..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/30"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button 
                onClick={handleSubmit}
                disabled={!newComment.trim()}
                className={`p-2 rounded-xl transition-all ${
                  newComment.trim() 
                    ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white' 
                    : 'bg-white/10 text-white/30'
                }`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
