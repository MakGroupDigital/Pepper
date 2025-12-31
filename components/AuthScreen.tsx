import React, { useState, useRef, useEffect } from 'react';
import { 
  Flame, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';

type AuthMethod = 'main' | 'phone' | 'email' | 'email-signup';

interface AuthScreenProps {
  onLoginGoogle: () => Promise<void>;
  onLoginFacebook: () => Promise<void>;
  onLoginApple: () => Promise<void>;
  onLoginEmail: (email: string, password: string) => Promise<void>;
  onSignupEmail: (email: string, password: string) => Promise<void>;
  onSendPhoneOTP: (phone: string) => Promise<boolean>;
  onVerifyPhoneOTP: (otp: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  loading: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onLoginGoogle,
  onLoginFacebook,
  onLoginApple,
  onLoginEmail,
  onSignupEmail,
  onSendPhoneOTP,
  onVerifyPhoneOTP,
  onResetPassword,
  loading, 
  error,
  onClearError 
}) => {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('main');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  const clearErrors = () => {
    setLocalError(null);
    setSuccessMessage(null);
    onClearError?.();
  };

  const handleBack = () => {
    clearErrors();
    if (otpSent) {
      setOtpSent(false);
      setOtp(['', '', '', '', '', '']);
    } else if (showResetPassword) {
      setShowResetPassword(false);
    } else {
      setAuthMethod('main');
      setPhoneNumber('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  };

  // Phone Auth
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setLocalError('Numéro de téléphone invalide');
      return;
    }
    
    clearErrors();
    setLocalLoading(true);
    
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+33${phoneNumber.replace(/^0/, '')}`;
      const success = await onSendPhoneOTP(formattedPhone);
      if (success) {
        setOtpSent(true);
        setSuccessMessage('Code envoyé !');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    clearErrors();
    setLocalLoading(true);
    
    try {
      await onVerifyPhoneOTP(otpCode);
    } catch (err: any) {
      setLocalError(err.message || 'Code invalide');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLocalLoading(false);
    }
  };

  // Email Auth
  const handleEmailLogin = async () => {
    if (!email || !password) {
      setLocalError('Remplis tous les champs');
      return;
    }
    
    clearErrors();
    setLocalLoading(true);
    
    try {
      await onLoginEmail(email, password);
    } catch (err: any) {
      setLocalError(getFirebaseErrorMessage(err.code || err.message));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setLocalError('Remplis tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    clearErrors();
    setLocalLoading(true);
    
    try {
      await onSignupEmail(email, password);
      setSuccessMessage('Compte créé ! Vérifie ton email.');
    } catch (err: any) {
      setLocalError(getFirebaseErrorMessage(err.code || err.message));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setLocalError('Entre ton adresse email');
      return;
    }
    
    clearErrors();
    setLocalLoading(true);
    
    try {
      await onResetPassword(email);
      setSuccessMessage('Email de réinitialisation envoyé !');
      setShowResetPassword(false);
    } catch (err: any) {
      setLocalError(getFirebaseErrorMessage(err.code || err.message));
    } finally {
      setLocalLoading(false);
    }
  };

  // Social Auth handlers
  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    clearErrors();
    setLocalLoading(true);
    
    try {
      if (provider === 'google') await onLoginGoogle();
      else if (provider === 'facebook') await onLoginFacebook();
      else if (provider === 'apple') await onLoginApple();
    } catch (err: any) {
      setLocalError(err.message || `Erreur de connexion ${provider}`);
    } finally {
      setLocalLoading(false);
    }
  };

  const getFirebaseErrorMessage = (code: string): string => {
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'Cet email est déjà utilisé',
      'auth/invalid-email': 'Email invalide',
      'auth/user-not-found': 'Aucun compte trouvé avec cet email',
      'auth/wrong-password': 'Mot de passe incorrect',
      'auth/weak-password': 'Mot de passe trop faible',
      'auth/too-many-requests': 'Trop de tentatives. Réessaie plus tard.',
      'auth/popup-closed-by-user': 'Connexion annulée',
      'auth/invalid-verification-code': 'Code invalide',
      'auth/invalid-phone-number': 'Numéro de téléphone invalide',
    };
    return messages[code] || code;
  };

  const isLoading = loading || localLoading;

  // Main Auth Screen
  if (authMethod === 'main') {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-fuchsia-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-cyan-600/20 blur-[120px] rounded-full" />

        {/* Logo */}
        <div className="relative mb-6 z-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-cyan-400 to-fuchsia-600 rounded-[32px] rotate-12 flex items-center justify-center shadow-2xl shadow-fuchsia-500/30">
            <span className="text-white font-black text-5xl -rotate-12 italic tracking-tighter">p</span>
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-fuchsia-500 rounded-xl flex items-center justify-center animate-pulse">
            <Flame size={16} fill="white" />
          </div>
        </div>

        <h1 className="text-5xl font-black italic tracking-tighter mb-1 z-10">peperr</h1>
        <p className="text-white/40 font-bold text-xs uppercase tracking-[0.3em] mb-8 z-10">
          The Spicy Social Club
        </p>

        {/* Error Message */}
        {localError && (
          <div className="w-full max-w-sm mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2 z-10" onClick={clearErrors}>
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{localError}</p>
          </div>
        )}

        {/* Auth Buttons */}
        <div className="w-full max-w-sm space-y-3 z-10">
          {/* Google */}
          <button
            onClick={() => handleSocialAuth('google')}
            disabled={isLoading}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </>
            )}
          </button>

          {/* Apple */}
          <button
            onClick={() => handleSocialAuth('apple')}
            disabled={isLoading}
            className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continuer avec Apple
          </button>

          {/* Facebook */}
          <button
            onClick={() => handleSocialAuth('facebook')}
            disabled={isLoading}
            className="w-full py-4 bg-[#1877F2] text-white font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continuer avec Facebook
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs font-bold uppercase">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Phone */}
          <button
            onClick={() => setAuthMethod('phone')}
            className="w-full py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-white/15"
          >
            <Phone size={20} />
            Continuer avec téléphone
          </button>

          {/* Email */}
          <button
            onClick={() => setAuthMethod('email')}
            className="w-full py-4 bg-white/10 border border-white/20 text-white font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-white/15"
          >
            <Mail size={20} />
            Continuer avec email
          </button>
        </div>

        {/* Terms */}
        <p className="text-[10px] text-white/20 text-center mt-6 max-w-xs z-10">
          En continuant, tu acceptes nos Conditions d'utilisation et notre Politique de confidentialité
        </p>

        <p className="absolute bottom-4 text-[10px] text-white/10 font-mono">peperr v1.0</p>
      </div>
    );
  }

  // Phone Auth Screen
  if (authMethod === 'phone') {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col p-6 text-white relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-cyan-600/20 blur-[120px] rounded-full" />
        
        {/* Header */}
        <button onClick={handleBack} className="p-2 -ml-2 mb-6 z-10">
          <ArrowLeft size={24} />
        </button>

        <div className="flex-1 flex flex-col z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-6">
            <Phone size={32} />
          </div>

          <h1 className="text-3xl font-black italic tracking-tighter mb-2">
            {otpSent ? 'Entre le code' : 'Ton numéro'}
          </h1>
          <p className="text-white/40 text-sm mb-8">
            {otpSent 
              ? `Code envoyé au ${phoneNumber}` 
              : 'On t\'envoie un code de vérification par SMS'}
          </p>

          {/* Error/Success */}
          {localError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2" onClick={clearErrors}>
              <AlertCircle size={16} className="text-red-400" />
              <p className="text-sm text-red-300">{localError}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <p className="text-sm text-green-300">{successMessage}</p>
            </div>
          )}

          {!otpSent ? (
            <>
              {/* Phone Input */}
              <div className="relative mb-6">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white/60">
                  <span className="text-lg">🇫🇷</span>
                  <span className="font-bold">+33</span>
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="6 12 34 56 78"
                  className="w-full py-4 pl-24 pr-4 bg-white/10 border border-white/20 rounded-2xl text-lg font-bold placeholder:text-white/30 focus:outline-none focus:border-cyan-500 transition-colors"
                  maxLength={10}
                />
              </div>

              <button
                onClick={handleSendOTP}
                disabled={isLoading || phoneNumber.length < 9}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-wide"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Envoyer le code'}
              </button>
            </>
          ) : (
            <>
              {/* OTP Input */}
              <div className="flex gap-2 mb-6 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOTPChange(i, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(i, e)}
                    className="w-12 h-14 bg-white/10 border border-white/20 rounded-xl text-center text-2xl font-black focus:outline-none focus:border-cyan-500 transition-colors"
                    maxLength={1}
                  />
                ))}
              </div>

              <button
                onClick={() => handleVerifyOTP(otp.join(''))}
                disabled={isLoading || otp.some(d => !d)}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-wide"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Vérifier'}
              </button>

              <button onClick={handleSendOTP} disabled={isLoading} className="mt-4 text-cyan-400 text-sm font-bold">
                Renvoyer le code
              </button>
            </>
          )}
        </div>

        {/* Recaptcha container */}
        <div id="recaptcha-container" />
      </div>
    );
  }

  // Email Auth Screen
  if (authMethod === 'email' || authMethod === 'email-signup') {
    const isSignup = authMethod === 'email-signup';
    
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col p-6 text-white relative overflow-hidden">
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-fuchsia-600/20 blur-[120px] rounded-full" />
        
        {/* Header */}
        <button onClick={handleBack} className="p-2 -ml-2 mb-6 z-10">
          <ArrowLeft size={24} />
        </button>

        <div className="flex-1 flex flex-col z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
            <Mail size={32} />
          </div>

          <h1 className="text-3xl font-black italic tracking-tighter mb-2">
            {showResetPassword ? 'Mot de passe oublié' : isSignup ? 'Créer un compte' : 'Se connecter'}
          </h1>
          <p className="text-white/40 text-sm mb-8">
            {showResetPassword 
              ? 'Entre ton email pour réinitialiser' 
              : isSignup 
                ? 'Rejoins la communauté Peperr' 
                : 'Content de te revoir !'}
          </p>

          {/* Error/Success */}
          {localError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2" onClick={clearErrors}>
              <AlertCircle size={16} className="text-red-400" />
              <p className="text-sm text-red-300">{localError}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2">
              <Check size={16} className="text-green-400" />
              <p className="text-sm text-green-300">{successMessage}</p>
            </div>
          )}

          {/* Email Input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@email.com"
            className="w-full py-4 px-4 bg-white/10 border border-white/20 rounded-2xl text-lg placeholder:text-white/30 focus:outline-none focus:border-fuchsia-500 transition-colors mb-3"
          />

          {!showResetPassword && (
            <>
              {/* Password Input */}
              <div className="relative mb-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  className="w-full py-4 px-4 pr-12 bg-white/10 border border-white/20 rounded-2xl text-lg placeholder:text-white/30 focus:outline-none focus:border-fuchsia-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm Password (Signup only) */}
              {isSignup && (
                <div className="relative mb-3">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmer le mot de passe"
                    className="w-full py-4 px-4 pr-12 bg-white/10 border border-white/20 rounded-2xl text-lg placeholder:text-white/30 focus:outline-none focus:border-fuchsia-500 transition-colors"
                  />
                </div>
              )}

              {/* Forgot Password (Login only) */}
              {!isSignup && (
                <button
                  onClick={() => setShowResetPassword(true)}
                  className="text-right text-cyan-400 text-sm font-bold mb-6"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </>
          )}

          <button
            onClick={showResetPassword ? handleResetPassword : isSignup ? handleEmailSignup : handleEmailLogin}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-wide mt-4"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 
              showResetPassword ? 'Envoyer le lien' : isSignup ? 'Créer mon compte' : 'Se connecter'}
          </button>

          {/* Toggle Login/Signup */}
          {!showResetPassword && (
            <button
              onClick={() => {
                clearErrors();
                setAuthMethod(isSignup ? 'email' : 'email-signup');
              }}
              className="mt-6 text-white/60 text-sm"
            >
              {isSignup ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
              <span className="text-cyan-400 font-bold">{isSignup ? 'Se connecter' : 'S\'inscrire'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
