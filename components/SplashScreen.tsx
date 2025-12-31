import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Sparkles, 
  Users, 
  Lock, 
  Music, 
  Wand2,
  ChevronDown,
  Play,
  Zap,
  Heart,
  Star
} from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showSkip, setShowSkip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sections = [
    {
      id: 'hero',
      title: 'peperr',
      subtitle: 'The Spicy Social Club',
      description: 'Là où chaque interaction devient mémorable',
      icon: null,
      gradient: 'from-fuchsia-600 via-purple-600 to-cyan-500',
      particles: true
    },
    {
      id: 'spice',
      title: 'Spice Meter',
      subtitle: 'Exprime l\'intensité',
      description: 'Fini les likes basiques. Montre à quel point tu kiffes avec notre jauge de piment unique.',
      icon: Flame,
      gradient: 'from-orange-500 via-red-500 to-fuchsia-500',
      emoji: '🌶️'
    },
    {
      id: 'coop',
      title: 'Peperr Co-Op',
      subtitle: 'Crée ensemble',
      description: 'Incruste-toi dans les vidéos de tes créateurs préférés grâce à l\'IA.',
      icon: Users,
      gradient: 'from-green-500 via-emerald-500 to-cyan-500',
      emoji: '🤝'
    },
    {
      id: 'vault',
      title: 'The Vault',
      subtitle: 'Cercle privé',
      description: 'Partage du contenu éphémère avec ton squad. 24h puis pouf, disparu.',
      icon: Lock,
      gradient: 'from-purple-500 via-violet-500 to-fuchsia-500',
      emoji: '🔐'
    },
    {
      id: 'sound',
      title: 'Sound Spheres',
      subtitle: 'Audio immersif',
      description: 'Penche ton téléphone pour découvrir des sons cachés. Une expérience unique.',
      icon: Music,
      gradient: 'from-cyan-500 via-blue-500 to-purple-500',
      emoji: '🎵'
    },
    {
      id: 'stylist',
      title: 'IA Stylist',
      subtitle: 'Filtres cinéma',
      description: 'Transforme tes vidéos en œuvres d\'art avec nos filtres IA exclusifs.',
      icon: Wand2,
      gradient: 'from-fuchsia-500 via-pink-500 to-rose-500',
      emoji: '✨'
    },
    {
      id: 'cta',
      title: 'Prêt à pimenter ?',
      subtitle: '',
      description: 'Rejoins la communauté la plus épicée du moment',
      icon: null,
      gradient: 'from-cyan-500 via-fuchsia-500 to-orange-500',
      isCTA: true
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentSection < sections.length - 1) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setCurrentSection(prev => prev + 1);
          setIsAnimating(true);
        }, 300);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentSection, sections.length]);

  const handleScroll = () => {
    if (currentSection < sections.length - 1) {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrentSection(prev => prev + 1);
        setIsAnimating(true);
      }, 300);
    }
  };

  const section = sections[currentSection];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-[#050505] overflow-hidden z-[200] touch-none"
      onClick={handleScroll}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div 
          className={`absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r ${section.gradient} blur-[150px] rounded-full opacity-30 transition-all duration-1000`}
          style={{ transform: `translateY(${currentSection * -20}px)` }}
        />
        <div 
          className={`absolute bottom-1/4 -right-32 w-96 h-96 bg-gradient-to-l ${section.gradient} blur-[150px] rounded-full opacity-30 transition-all duration-1000`}
          style={{ transform: `translateY(${currentSection * 20}px)` }}
        />
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br ${section.gradient} blur-[200px] rounded-full opacity-20 transition-all duration-1000`}
        />

        {/* Floating Particles */}
        {section.particles && (
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: Math.random() * 0.5 + 0.2
                }}
              />
            ))}
          </div>
        )}

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Skip Button */}
      {showSkip && currentSection < sections.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onComplete();
          }}
          className="absolute top-12 right-6 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-white/60 text-sm font-bold z-50 hover:bg-white/20 transition-all"
        >
          Passer
        </button>
      )}

      {/* Progress Dots */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {sections.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === currentSection 
                ? 'w-8 bg-white' 
                : i < currentSection 
                  ? 'w-1.5 bg-white/60' 
                  : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className={`relative h-full flex flex-col items-center justify-center px-8 text-center transition-all duration-500 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Hero Section */}
        {section.id === 'hero' && (
          <>
            {/* Logo Animation */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-tr from-cyan-400 to-fuchsia-600 rounded-[40px] rotate-12 flex items-center justify-center shadow-2xl shadow-fuchsia-500/40 animate-pulse">
                <span className="text-white font-black text-7xl -rotate-12 italic tracking-tighter">p</span>
              </div>
              
              {/* Orbiting Elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center animate-bounce shadow-lg shadow-orange-500/50">
                <Flame size={24} fill="white" className="text-white" />
              </div>
              <div className="absolute -bottom-2 -left-4 w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center animate-pulse shadow-lg shadow-cyan-500/50">
                <Sparkles size={20} className="text-white" />
              </div>
            </div>

            <h1 className="text-7xl font-black italic tracking-tighter mb-2 bg-gradient-to-r from-white via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
              {section.title}
            </h1>
            <p className="text-white/40 font-bold text-lg uppercase tracking-[0.4em] mb-6">
              {section.subtitle}
            </p>
            <p className="text-white/60 text-lg max-w-xs">
              {section.description}
            </p>

            {/* Stats */}
            <div className="flex gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-black text-cyan-400">50K+</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Créateurs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-fuchsia-400">1M+</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Piments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-orange-400">∞</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest">Vibes</div>
              </div>
            </div>
          </>
        )}

        {/* Feature Sections */}
        {section.icon && (
          <>
            {/* Emoji Background */}
            <div className="absolute text-[200px] opacity-5 select-none pointer-events-none">
              {section.emoji}
            </div>

            {/* Icon */}
            <div className={`w-24 h-24 bg-gradient-to-br ${section.gradient} rounded-[32px] flex items-center justify-center mb-8 shadow-2xl`}>
              <section.icon size={48} className="text-white" />
            </div>

            {/* Title */}
            <h2 className="text-5xl font-black italic tracking-tighter mb-2 text-white">
              {section.title}
            </h2>
            <p className={`font-bold text-lg uppercase tracking-[0.3em] mb-6 bg-gradient-to-r ${section.gradient} bg-clip-text text-transparent`}>
              {section.subtitle}
            </p>
            <p className="text-white/60 text-lg max-w-sm leading-relaxed">
              {section.description}
            </p>

            {/* Feature Visual */}
            <div className="mt-12 relative">
              {section.id === 'spice' && (
                <div className="flex items-center gap-2">
                  {['Doux', 'Moyen', 'Fort', 'Extra Fort'].map((level, i) => (
                    <div 
                      key={level}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                        i <= 2 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white scale-100' : 'bg-white/10 text-white/40 scale-90'
                      }`}
                      style={{ animationDelay: `${i * 0.2}s` }}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              )}

              {section.id === 'coop' && (
                <div className="flex -space-x-4">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i}
                      className="w-16 h-16 rounded-2xl border-4 border-[#050505] overflow-hidden"
                      style={{ transform: `rotate(${(i - 2) * 10}deg)` }}
                    >
                      <img 
                        src={`https://picsum.photos/seed/user${i}/100`} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  <div className="w-16 h-16 rounded-2xl border-4 border-[#050505] bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center">
                    <span className="text-2xl font-black">+</span>
                  </div>
                </div>
              )}

              {section.id === 'vault' && (
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Lock size={24} className="text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Squad Goals 🔥</div>
                    <div className="text-xs text-white/40">3/4 ont posté • 8h restantes</div>
                  </div>
                </div>
              )}

              {section.id === 'sound' && (
                <div className="flex items-center gap-4">
                  {[0.3, 0.6, 1, 0.8, 0.5, 0.9, 0.4].map((h, i) => (
                    <div 
                      key={i}
                      className="w-2 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full animate-pulse"
                      style={{ 
                        height: `${h * 60}px`,
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              )}

              {section.id === 'stylist' && (
                <div className="flex gap-2">
                  {['Cyberpunk', 'Anime', 'Vintage'].map((style, i) => (
                    <div 
                      key={style}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${
                        i === 0 
                          ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white' 
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {style}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* CTA Section */}
        {section.isCTA && (
          <>
            <div className="relative mb-8">
              <div className="w-28 h-28 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-orange-500 rounded-[36px] flex items-center justify-center shadow-2xl animate-pulse">
                <Zap size={56} className="text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-black italic tracking-tighter mb-4 text-white">
              {section.title}
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-xs">
              {section.description}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className="px-12 py-5 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-orange-500 text-white font-black rounded-2xl text-lg uppercase tracking-widest shadow-2xl shadow-fuchsia-500/30 active:scale-95 transition-all flex items-center gap-3"
            >
              <Play size={24} fill="white" />
              Commencer
            </button>

            <div className="flex items-center gap-6 mt-10 text-white/40">
              <div className="flex items-center gap-1">
                <Heart size={14} fill="currentColor" />
                <span className="text-xs font-bold">Gratuit</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-bold">4.9/5</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={14} fill="currentColor" />
                <span className="text-xs font-bold">Instant</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Scroll Indicator */}
      {currentSection < sections.length - 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Tap pour continuer</span>
          <ChevronDown size={20} className="text-white/40" />
        </div>
      )}

      {/* Version */}
      <div className="absolute bottom-4 right-4 text-[10px] text-white/10 font-mono">
        v1.0 beta
      </div>
    </div>
  );
};
