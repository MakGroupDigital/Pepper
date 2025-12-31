import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where,
  getDocs,
  getDoc,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isInDemoMode } from '../services/firebase';
import { Post } from '../types';

// Mock data for demo mode
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    username: 'Jordan_Lux',
    avatar: 'https://picsum.photos/seed/jordan/200/200',
    videoUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=600&q=80',
    description: "Création d'un setup néon pour l'app Peperr ! Qu'en pensez-vous ? ✨ #design #future",
    hashtags: ['design', 'future', 'peperr'],
    spiceCount: 82000,
    comments: 1200,
    shares: 450,
    isTrending: true,
    timeAgo: '2h',
    mood: 'cyberpunk',
    audioLayers: [
      { id: 'main', name: 'Beat Principal', volume: 1, pan: 0, isHidden: false },
      { id: 'bass', name: 'Bass Line', volume: 0.8, pan: -0.3, isHidden: false },
      { id: 'secret', name: '🔥 Secret Drop', volume: 0.6, pan: 0.8, isHidden: true },
    ]
  },
  {
    id: '2',
    username: 'dj_pepper',
    avatar: 'https://picsum.photos/seed/dj/200/200',
    videoUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    description: "Nouveau mix disponible. Préparez-vous à transpirer ! 🎧🔥",
    hashtags: ['afrobeats', 'dance', 'fire'],
    spiceCount: 15400,
    comments: 890,
    shares: 450,
    isTrending: false,
    timeAgo: '5h',
    mood: 'vintage',
    audioLayers: [
      { id: 'main', name: 'Afro Beat', volume: 1, pan: 0, isHidden: false },
      { id: 'vocals', name: 'Vocals', volume: 0.9, pan: 0.2, isHidden: false },
    ]
  },
  {
    id: '3',
    username: 'neon_queen',
    avatar: 'https://picsum.photos/seed/neon/200/200',
    videoUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    description: "Vaporwave vibes only 💜🌴 Le futur c'est maintenant",
    hashtags: ['vaporwave', 'aesthetic', 'retro'],
    spiceCount: 45000,
    comments: 2100,
    shares: 890,
    isTrending: true,
    timeAgo: '1h',
    mood: 'vaporwave',
    audioLayers: [
      { id: 'synth', name: 'Synth Wave', volume: 1, pan: 0, isHidden: false },
    ]
  }
];

export const usePosts = (userId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch posts in real-time
  useEffect(() => {
    if (isInDemoMode()) {
      setPosts(MOCK_POSTS);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const fetchedPosts: Post[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt?.toDate();
          const timeAgo = createdAt ? getTimeAgo(createdAt) : 'maintenant';
          
          return {
            id: doc.id,
            username: data.username || 'Anonyme',
            avatar: data.avatar || `https://picsum.photos/seed/${doc.id}/200/200`,
            videoUrl: data.videoUrl || '',
            thumbnail: data.thumbnail || data.mediaUrl || '',
            description: data.description || '',
            hashtags: data.hashtags || [],
            spiceCount: data.spiceCount || 0,
            comments: data.commentsCount || 0,
            shares: data.sharesCount || 0,
            isTrending: (data.spiceCount || 0) > 10000,
            timeAgo,
            mood: data.mood || 'default',
            audioLayers: data.audioLayers || [],
            userId: data.userId,
            mediaType: data.mediaType,
            mediaUrl: data.mediaUrl
          };
        });
        
        setPosts(fetchedPosts.length > 0 ? fetchedPosts : MOCK_POSTS);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching posts:', err);
        setError('Erreur de chargement des posts');
        setPosts(MOCK_POSTS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Upload media to Firebase Storage
  const uploadMedia = useCallback(async (
    file: Blob | string,
    userId: string,
    type: 'photo' | 'video'
  ): Promise<string> => {
    if (isInDemoMode()) {
      // In demo mode, return the data URL or blob URL
      if (typeof file === 'string') return file;
      return URL.createObjectURL(file);
    }

    try {
      let blob: Blob;
      
      if (typeof file === 'string') {
        // Convert data URL to blob
        const response = await fetch(file);
        blob = await response.blob();
      } else {
        blob = file;
      }

      const extension = type === 'photo' ? 'jpg' : 'webm';
      const path = `posts/${userId}/${Date.now()}.${extension}`;
      const storageRef = ref(storage, path);
      
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      
      return downloadUrl;
    } catch (err) {
      console.error('Upload error:', err);
      throw new Error('Erreur lors de l\'upload');
    }
  }, []);

  // Create a new post
  const createPost = useCallback(async (
    userId: string,
    username: string,
    avatar: string,
    mediaData: string | Blob,
    mediaType: 'photo' | 'video',
    description: string,
    mood?: string
  ): Promise<string | null> => {
    console.log('🌶️ usePosts.createPost called', { userId, username, mediaType, mood });
    setUploading(true);
    setError(null);

    try {
      // Upload media first
      console.log('🌶️ Uploading media...');
      const mediaUrl = await uploadMedia(mediaData, userId, mediaType);
      console.log('🌶️ Media uploaded:', mediaUrl?.substring(0, 50) + '...');
      
      // Extract hashtags from description
      const hashtags = description.match(/#\w+/g)?.map(tag => tag.slice(1)) || [];

      if (isInDemoMode()) {
        console.log('🌶️ Demo mode: Creating local post');
        // Add to local state in demo mode
        const newPost: Post = {
          id: 'demo-' + Date.now(),
          username,
          avatar,
          videoUrl: mediaType === 'video' ? mediaUrl : '',
          thumbnail: mediaUrl,
          description,
          hashtags,
          spiceCount: 0,
          comments: 0,
          shares: 0,
          isTrending: false,
          timeAgo: 'maintenant',
          mood: mood || 'default',
          audioLayers: []
        };
        
        console.log('🌶️ Demo mode: Adding post to state', newPost.id);
        setPosts(prev => [newPost, ...prev]);
        setUploading(false);
        return newPost.id;
      }

      // Create post document in Firestore
      console.log('🌶️ Creating Firestore document...');
      const postData = {
        userId,
        username,
        avatar,
        mediaUrl,
        mediaType,
        thumbnail: mediaUrl,
        videoUrl: mediaType === 'video' ? mediaUrl : '',
        description,
        hashtags,
        mood: mood || 'default',
        spiceCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        createdAt: serverTimestamp(),
        audioLayers: []
      };

      const docRef = await addDoc(collection(db, 'posts'), postData);
      console.log('🌶️ Firestore document created:', docRef.id);
      setUploading(false);
      return docRef.id;
    } catch (err: any) {
      console.error('🌶️ Create post error:', err);
      setError(err.message || 'Erreur lors de la publication');
      setUploading(false);
      return null;
    }
  }, [uploadMedia]);

  // Add spice to a post
  const addSpice = useCallback(async (postId: string, userId: string, spiceLevel: number) => {
    if (isInDemoMode()) {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, spiceCount: post.spiceCount + spiceLevel }
          : post
      ));
      return;
    }

    try {
      // Check if user already spiced this post
      const spiceQuery = query(
        collection(db, 'spices'),
        where('postId', '==', postId),
        where('userId', '==', userId)
      );
      const existingSpice = await getDocs(spiceQuery);
      
      if (!existingSpice.empty) {
        // Update existing spice
        const spiceDoc = existingSpice.docs[0];
        const oldLevel = spiceDoc.data().level || 0;
        const diff = spiceLevel - oldLevel;
        
        await updateDoc(doc(db, 'spices', spiceDoc.id), { level: spiceLevel });
        await updateDoc(doc(db, 'posts', postId), { spiceCount: increment(diff) });
      } else {
        // Create new spice
        await addDoc(collection(db, 'spices'), {
          postId,
          userId,
          level: spiceLevel,
          createdAt: serverTimestamp()
        });
        await updateDoc(doc(db, 'posts', postId), { spiceCount: increment(spiceLevel) });
      }
    } catch (err) {
      console.error('Add spice error:', err);
    }
  }, []);

  // Get user's posts
  const getUserPosts = useCallback(async (targetUserId: string): Promise<Post[]> => {
    if (isInDemoMode()) {
      return MOCK_POSTS.slice(0, 2);
    }

    try {
      const userPostsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', targetUserId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(userPostsQuery);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          username: data.username,
          avatar: data.avatar,
          videoUrl: data.videoUrl || '',
          thumbnail: data.thumbnail || data.mediaUrl,
          description: data.description,
          hashtags: data.hashtags || [],
          spiceCount: data.spiceCount || 0,
          comments: data.commentsCount || 0,
          shares: data.sharesCount || 0,
          isTrending: false,
          timeAgo: getTimeAgo(data.createdAt?.toDate()),
          mood: data.mood,
          audioLayers: []
        };
      });
    } catch (err) {
      console.error('Get user posts error:', err);
      return [];
    }
  }, []);

  return {
    posts,
    loading,
    error,
    uploading,
    createPost,
    addSpice,
    getUserPosts,
    refreshPosts: () => {} // Real-time updates handle this
  };
};

// Helper function to format time ago
function getTimeAgo(date: Date | undefined): string {
  if (!date) return 'maintenant';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'maintenant';
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
