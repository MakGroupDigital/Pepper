import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Layers, 
  Plus, 
  User, 
  Bell,
  Lock,
  Compass,
  LogOut
} from 'lucide-react';
import { Tab, VaultCircle } from './types';
import { FlowCard } from './components/FlowCard';
import { TheVault } from './components/TheVault';
import { VaultRoom } from './components/VaultRoom';
import { CreateStudio } from './components/CreateStudio';
import { CoOpStudio } from './components/CoOpStudio';
import { CommentsSheet } from './components/CommentsSheet';
import { ShareSheet } from './components/ShareSheet';
import { SoundSpheres } from './components/SoundSpheres';
import { CameraStudio } from './components/CameraStudio';
import { AuthScreen } from './components/AuthScreen';
import { SplashScreen } from './components/SplashScreen';
import { Toast, useToast } from './components/Toast';
import { useAuth } from './hooks/useAuth';
import { usePosts } from './hooks/usePosts';
import { getSpicyChallengeIdea } from './services/geminiService';

const MOCK_VAULT: VaultCircle[] = [
  { 
    id: 'v1', 
    name: 'Grosse Équipe 🇨🇩', 
    members: [
      { id: '1', name: 'Toi', avatar: 'https://picsum.photos/seed/user1/100', hasPosted: true },
      { id: '2', name: 'Marc', avatar: 'https://picsum.photos/seed/marc/100', hasPosted: true },
      { id: '3', name: 'Sarah', avatar: 'https://picsum.photos/seed/sarah/100', hasPosted: false },
    ],
    lastPostTime: '1h', 
    isLocked: true,
    expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000),
    posts: []
  },
  { 
    id: 'v2', 
    name: 'Late Night Vibes', 
    members: [
      { id: '1', name: 'Toi', avatar: 'https://picsum.photos/seed/user1/100', hasPosted: true },
      { id: '2', name: 'Ben', avatar: 'https://picsum.photos/seed/ben/100', hasPosted: true },
      { id: '3', name: 'Léa', avatar: 'https://picsum.photos/seed/lea/100', hasPosted: true },
    ],
    lastPostTime: '4h', 
    isLocked: false,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    posts: []
  }
];

const App: React.FC = () => {
  const { 
    user, 
    profile, 
    loading, 
    error, 
    loginWithGoogle,
    loginWithFacebook,
    loginWithApple,
    loginWithEmail,
    signupWithEmail,
    sendOTP,
    verifyOTP,
    sendPasswordReset,
    logout, 
    clearError, 
    isAuthenticated 
  } = useAuth();
  
  const { posts, uploading, createPost, addSpice } = usePosts();
  const { toast, showSuccess, showError, showLoading, hideToast } = useToast();
  
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem('peperr_splash_seen');
  });
  const [activeTab, setActiveTab] = useState<Tab>(Tab.FEED);
  const [activeCategory, setActiveCategory] = useState('Pour toi');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiIdea, setAiIdea] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showCoOp, setShowCoOp] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSoundSpheres, setShowSoundSpheres] = useState(false);
  const [selectedVaultCircle, setSelectedVaultCircle] = useState<VaultCircle | null>(null);
  const [showVaultCamera, setShowVaultCamera] = useState(false);

  const categories = ['Pour toi', 'Suivis', 'Peperr Hot', 'Musique'];
  const currentPost = posts[currentIndex] || posts[0];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset index when posts change
  useEffect(() => {
    if (currentIndex >= posts.length && posts.length > 0) {
      setCurrentIndex(0);
    }
  }, [posts.length, currentIndex]);

  // Handle splash completion
  const handleSplashComplete = () => {
    localStorage.setItem('peperr_splash_seen', 'true');
    setShowSplash(false);
  };

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!isAuthenticated) {
    return (
      <AuthScreen 
        onLoginGoogle={loginWithGoogle}
        onLoginFacebook={loginWithFacebook}
        onLoginApple={loginWithApple}
        onLoginEmail={loginWithEmail}
        onSignupEmail={signupWithEmail}
        onSendPhoneOTP={sendOTP}
        onVerifyPhoneOTP={verifyOTP}
        onResetPassword={sendPasswordReset}
        loading={loading} 
        error={error}
        onClearError={clearError}
      />
    );
  }

  const handleNextPost = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const handleSpice = async (level: number) => {
    if (!currentPost || !user) return;
    await addSpice(currentPost.id, user.uid, level);
  };

  const handlePublish = async (
    mediaData: string, 
    mediaType: 'photo' | 'video', 
    description: string, 
    mood?: string
  ): Promise<boolean> => {
    console.log('🌶️ handlePublish called', { mediaType, description, mood });
    
    if (!user || !profile) {
      console.error('No user or profile');
      showError('Tu dois être connecté pour publier');
      return false;
    }
    
    showLoading('Publication en cours...');
    
    try {
      console.log('🌶️ Creating post with:', {
        userId: user.uid,
        username: profile.displayName || profile.username,
        mediaType
      });
      
      const postId = await createPost(
        user.uid,
        profile.displayName || profile.username || 'Anonyme',
        profile.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        mediaData,
        mediaType,
        description,
        mood
      );
      
      console.log('🌶️ Post created with ID:', postId);
      
      if (postId) {
        hideToast();
        showSuccess('🌶️ Publié avec succès !');
        setActiveTab(Tab.FEED);
        setCurrentIndex(0);
        return true;
      } else {
        hideToast();
        showError('Erreur lors de la publication');
        return false;
      }
    } catch (err: any) {
      console.error('🌶️ Publish error:', err);
      hideToast();
      showError(err.message || 'Erreur lors de la publication');
      return false;
    }
  };

  const handleCreateAI = async () => {
    setIsAIGenerating(true);
    const idea = await getSpicyChallengeIdea();
    if (idea) setAiIdea(idea);
    setIsAIGenerating(false);
  };

  const handleAddComment = (text: string) => {
    console.log('New comment:', text);
    // TODO: Implement with Firebase
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.FEED:
        return (
          <main className="flex-1 px-4 relative flex flex-col justify-center">
            {/* Flow Card */}
            {currentPost ? (
              <>
                <FlowCard
                  post={currentPost}
                  onNext={handleNextPost}
                  onSpice={handleSpice}
                  onComment={() => setShowComments(true)}
                  onShare={() => setShowShare(true)}
                />

                {/* Sound Spheres Toggle */}
                {currentPost.audioLayers && currentPost.audioLayers.length > 0 && (
                  <button
                    onClick={() => setShowSoundSpheres(!showSoundSpheres)}
                    className={`absolute bottom-4 left-4 px-4 py-2 rounded-full backdrop-blur-xl border transition-all z-20 ${
                      showSoundSpheres 
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                        : 'bg-white/10 border-white/10 text-white/60'
                    }`}
                  >
                    <span className="text-xs font-bold">{showSoundSpheres ? '✕ Fermer' : '🎵 Sound Spheres'}</span>
                  </button>
                )}

                {/* Sound Spheres Overlay */}
                {showSoundSpheres && currentPost.audioLayers && (
                  <SoundSpheres
                    audioLayers={currentPost.audioLayers}
                    isActive={showSoundSpheres}
                  />
                )}

                {/* Next Card Depth Effect */}
                <div className="absolute bottom-[-15px] left-8 right-8 h-20 bg-white/5 rounded-t-[40px] -z-10 border-t border-white/10 pointer-events-none" />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🌶️</div>
                  <p className="text-white/40 font-bold">Aucun post pour le moment</p>
                  <p className="text-white/20 text-sm">Sois le premier à publier !</p>
                </div>
              </div>
            )}
          </main>
        );

      case Tab.VAULT:
        return (
          <TheVault
            circles={MOCK_VAULT}
            onCreateCircle={() => console.log('Create circle')}
            onEnterCircle={(id) => {
              const circle = MOCK_VAULT.find(c => c.id === id);
              if (circle) setSelectedVaultCircle(circle);
            }}
          />
        );

      case Tab.CREATE:
        return (
          <CreateStudio
            onClose={() => setActiveTab(Tab.FEED)}
            onStartCoOp={() => setShowCoOp(true)}
            onPublish={handlePublish}
            aiIdea={aiIdea}
            onGenerateIdea={handleCreateAI}
            isGenerating={isAIGenerating}
            isPublishing={uploading}
          />
        );

      case Tab.DISCOVER:
        return (
          <div className="flex-1 px-6 pt-6 overflow-y-auto pb-32">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-6">Découvrir</h2>
            <div className="grid grid-cols-2 gap-3">
              {posts.map((post, i) => (
                <button 
                  key={post.id}
                  onClick={() => {
                    setCurrentIndex(i);
                    setActiveTab(Tab.FEED);
                  }}
                  className="aspect-[3/4] rounded-2xl overflow-hidden relative group"
                >
                  <img 
                    src={post.thumbnail} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    alt={post.username} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs font-bold truncate">@{post.username}</p>
                    <div className="flex items-center gap-1 text-[10px] text-white/60">
                      <Flame size={10} />
                      <span>{(post.spiceCount / 1000).toFixed(1)}k</span>
                    </div>
                  </div>
                  {post.isTrending && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-fuchsia-500/80 rounded-full">
                      <span className="text-[8px] font-black uppercase">Hot</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case Tab.PROFILE:
        return (
          <div className="flex-1 overflow-y-auto px-6 pt-8 pb-32 h-full">
            <div className="flex flex-col items-center mb-10">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-[48px] bg-gradient-to-tr from-cyan-400 to-fuchsia-500 p-1">
                  <div className="w-full h-full bg-[#050505] rounded-[44px] flex items-center justify-center overflow-hidden border-4 border-[#050505]">
                    <img src={profile?.photoURL || user?.photoURL || 'https://picsum.photos/seed/user1/300/300'} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 bg-white text-black p-2 rounded-2xl shadow-lg">
                  <Flame size={16} fill="black" />
                </div>
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">{profile?.displayName || user?.displayName || 'Pepper User'}</h2>
              <p className="text-white/40 font-bold mb-6 text-sm uppercase tracking-[0.3em]">@{profile?.username || 'pepper_user'}</p>
              <div className="flex gap-12 text-center">
                <div>
                  <div className="text-xl font-black tracking-tighter">{profile?.totalSpice ? `${(profile.totalSpice / 1000).toFixed(1)}k` : '0'}</div>
                  <div className="text-[10px] font-black uppercase text-white/30 tracking-widest">Piments</div>
                </div>
                <div>
                  <div className="text-xl font-black tracking-tighter">{profile?.followers || 0}</div>
                  <div className="text-[10px] font-black uppercase text-white/30 tracking-widest">Abonnés</div>
                </div>
                <div>
                  <div className="text-xl font-black tracking-tighter">{profile?.following || 0}</div>
                  <div className="text-[10px] font-black uppercase text-white/30 tracking-widest">Suivis</div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="bg-white/5 rounded-3xl p-4 mb-6 border border-white/10">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-3">Ton niveau de piment</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-red-500 rounded-full" />
                </div>
                <span className="text-sm font-black text-fuchsia-400">78%</span>
              </div>
              <p className="text-[10px] text-white/40 mt-2">🔥 Tu es dans le top 5% des créateurs !</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-white/60 hover:text-white hover:bg-white/10 transition-all mb-6"
            >
              <LogOut size={18} />
              <span className="font-bold text-sm">Se déconnecter</span>
            </button>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[1,2,3,4,5,6,7,8,9].map(i => (
                <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl overflow-hidden relative border border-white/5">
                   <img src={`https://picsum.photos/seed/post${i}/200/300`} className="w-full h-full object-cover opacity-60" alt="post" />
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div className="flex-1 flex items-center justify-center opacity-40 italic">À venir bientôt...</div>;
    }
  };

  const AppContent = (
    <div className="h-full w-full bg-[#0a0a0c] text-slate-100 relative flex flex-col overflow-hidden font-sans select-none">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-fuchsia-600/10 blur-[120px] rounded-full -z-20" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-cyan-600/10 blur-[120px] rounded-full -z-20" />

      {/* Header */}
      <header className="pt-12 pb-4 px-6 z-30 bg-gradient-to-b from-black/60 via-black/20 to-transparent">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab(Tab.FEED)}>
             <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-fuchsia-600 rounded-xl rotate-12 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 transition-transform active:scale-90">
                <span className="text-white font-black text-2xl -rotate-12 italic tracking-tighter">p</span>
             </div>
             <h1 className="text-3xl font-black tracking-tighter italic">peperr</h1>
          </div>
          <div className="flex gap-3">
             <button className="relative p-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md active:bg-white/10 transition-colors">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-fuchsia-500 rounded-full border-2 border-[#0a0a0c]" />
             </button>
             <button onClick={() => setActiveTab(Tab.PROFILE)} className="p-2.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md active:bg-white/10 transition-colors">
                <User size={20} />
             </button>
          </div>
        </div>

        {/* Category Pills - Only on Feed */}
        {activeTab === Tab.FEED && (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border ${
                  activeCategory === cat 
                  ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/20 border-transparent' 
                  : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {renderContent()}
      </div>

      {/* Tab Bar */}
      <nav className="px-6 pb-12 pt-4 z-40">
        <div className="bg-[#1a1a1e]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex justify-between items-center shadow-2xl">
          <button 
            onClick={() => setActiveTab(Tab.FEED)}
            className={`p-4 rounded-[24px] transition-all duration-300 ${activeTab === Tab.FEED ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:text-white'}`}
          >
            <Layers size={22} strokeWidth={activeTab === Tab.FEED ? 3 : 2} />
          </button>
          
          <button 
            onClick={() => setActiveTab(Tab.DISCOVER)}
            className={`p-4 transition-all duration-300 ${activeTab === Tab.DISCOVER ? 'text-white scale-110' : 'text-slate-500 hover:text-white'}`}
          >
            <Compass size={22} />
          </button>
          
          {/* Create Button */}
          <button 
            onClick={() => setActiveTab(Tab.CREATE)}
            className="relative -top-8 w-16 h-16 bg-gradient-to-tr from-cyan-400 to-fuchsia-600 rounded-[26px] flex items-center justify-center shadow-2xl shadow-fuchsia-500/40 border-[5px] border-[#0a0a0c] active:scale-90 transition-all active:shadow-none"
          >
            <Plus size={32} className="text-white" strokeWidth={4} />
          </button>

          <button 
             onClick={() => setActiveTab(Tab.VAULT)}
             className={`p-4 transition-all duration-300 ${activeTab === Tab.VAULT ? 'text-white scale-110' : 'text-slate-500 hover:text-white'}`}
          >
            <Lock size={22} />
          </button>
          
          <button 
            onClick={() => setActiveTab(Tab.PROFILE)}
            className={`p-4 transition-all duration-300 ${activeTab === Tab.PROFILE ? 'text-white scale-110' : 'text-slate-500 hover:text-white'}`}
          >
            <User size={22} />
          </button>
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/10 rounded-full" />
      </nav>

      {/* Modals */}
      <CommentsSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        comments={[]}
        onAddComment={handleAddComment}
      />

      <ShareSheet
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        postId={currentPost?.id || ''}
      />

      {showCoOp && currentPost && (
        <CoOpStudio
          originalPost={currentPost}
          onClose={() => setShowCoOp(false)}
          onSave={(participants) => {
            console.log('Co-Op saved:', participants);
            setShowCoOp(false);
          }}
        />
      )}

      {selectedVaultCircle && (
        <VaultRoom
          circle={selectedVaultCircle}
          onClose={() => setSelectedVaultCircle(null)}
          onPost={() => setShowVaultCamera(true)}
        />
      )}

      {showVaultCamera && (
        <CameraStudio
          mode="video"
          onClose={() => setShowVaultCamera(false)}
          onCapture={(data) => {
            console.log('Vault post captured:', data);
            setShowVaultCamera(false);
          }}
        />
      )}

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );

  // Mobile Render
  if (isMobile) {
    return (
      <div className="h-[100svh] w-screen bg-black overflow-hidden fixed inset-0">
        {AppContent}
      </div>
    );
  }

  // Desktop Simulator
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#1a1a1a] overflow-hidden p-8">
      <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[3.5rem] h-[850px] w-[390px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* iPhone Frame */}
        <div className="absolute top-[120px] -left-[18px] h-[60px] w-[4px] bg-gray-700 rounded-r-lg" />
        <div className="absolute top-[190px] -left-[18px] h-[60px] w-[4px] bg-gray-700 rounded-r-lg" />
        <div className="absolute top-[180px] -right-[18px] h-[100px] w-[4px] bg-gray-700 rounded-l-lg" />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-[20px] z-[200] flex items-center justify-center">
           <div className="w-1.5 h-1.5 bg-blue-500/80 rounded-full absolute right-4" />
        </div>
        {AppContent}
      </div>
    </div>
  );
};

export default App;
