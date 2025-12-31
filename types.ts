export interface Post {
  id: string;
  username: string;
  avatar: string;
  videoUrl: string;
  thumbnail: string;
  description: string;
  hashtags: string[];
  spiceCount: number;
  comments: number;
  shares: number;
  isTrending: boolean;
  timeAgo: string;
  location?: string;
  mood?: string;
  audioLayers?: AudioLayer[];
  userId?: string;
  mediaType?: 'photo' | 'video';
  mediaUrl?: string;
}

export interface AudioLayer {
  id: string;
  name: string;
  volume: number;
  pan: number; // -1 (left) to 1 (right)
  isHidden: boolean; // Easter egg sound
}

export interface VaultCircle {
  id: string;
  name: string;
  members: VaultMember[];
  lastPostTime: string;
  isLocked: boolean;
  expiresAt: Date;
  posts: VaultPost[];
}

export interface VaultMember {
  id: string;
  name: string;
  avatar: string;
  hasPosted: boolean;
}

export interface VaultPost {
  id: string;
  memberId: string;
  thumbnail: string;
  createdAt: Date;
}

export interface CoOpSession {
  id: string;
  originalPost: Post;
  participants: CoOpParticipant[];
  isLive: boolean;
}

export interface CoOpParticipant {
  id: string;
  username: string;
  avatar: string;
  position: { x: number; y: number };
  scale: number;
}

export interface StyleFilter {
  id: string;
  name: string;
  mood: 'cyberpunk' | 'vintage' | 'anime' | 'neon' | 'film_noir' | 'vaporwave';
  cssFilter: string;
  overlay?: string;
  isNew?: boolean;
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  spiceLevel: number;
  timeAgo: string;
  replies?: Comment[];
}

export enum Tab {
  FEED = 'feed',
  DISCOVER = 'discover',
  CREATE = 'create',
  VAULT = 'vault',
  PROFILE = 'profile'
}

export type SpiceLevel = 'doux' | 'moyen' | 'fort' | 'extra_fort';

export const getSpiceLevelFromPercent = (percent: number): SpiceLevel => {
  if (percent < 25) return 'doux';
  if (percent < 50) return 'moyen';
  if (percent < 75) return 'fort';
  return 'extra_fort';
};

export const getSpiceLevelLabel = (level: SpiceLevel): string => {
  const labels: Record<SpiceLevel, string> = {
    doux: '🌶️ Doux',
    moyen: '🌶️🌶️ Moyen',
    fort: '🌶️🌶️🌶️ Fort',
    extra_fort: '🔥 EXTRA FORT'
  };
  return labels[level];
};
