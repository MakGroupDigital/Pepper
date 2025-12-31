import { useState, useEffect, useCallback, useRef } from 'react';
import { User, RecaptchaVerifier } from 'firebase/auth';
import { 
  onAuthChange, 
  signInWithGoogle,
  signInWithFacebook,
  signInWithApple,
  signInWithEmail,
  signUpWithEmail,
  sendPhoneOTP,
  verifyPhoneOTP,
  setupRecaptcha,
  resetPassword,
  logOut, 
  createUserProfile, 
  getUserProfile,
  isInDemoMode 
} from '../services/firebase';

interface UserProfile {
  id: string;
  displayName: string;
  email: string | null;
  photoURL: string;
  username: string;
  phoneNumber?: string | null;
  totalSpice: number;
  followers: number;
  following: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser as User);
          
          if (!isInDemoMode()) {
            await createUserProfile(firebaseUser as User);
          }
          
          const userProfile = await getUserProfile(firebaseUser.uid);
          setProfile(userProfile as UserProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Erreur de chargement du profil');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Initialize recaptcha for phone auth
  const initRecaptcha = useCallback(() => {
    if (!recaptchaVerifier.current && !isInDemoMode()) {
      recaptchaVerifier.current = setupRecaptcha('recaptcha-container');
    }
  }, []);

  // Google Login
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const firebaseUser = await signInWithGoogle();
      setUser(firebaseUser);
      
      if (!isInDemoMode()) {
        await createUserProfile(firebaseUser);
      }
      
      const userProfile = await getUserProfile(firebaseUser.uid);
      setProfile(userProfile as UserProfile);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Erreur de connexion Google');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Facebook Login
  const loginWithFacebook = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const firebaseUser = await signInWithFacebook();
      setUser(firebaseUser);
      
      if (!isInDemoMode()) {
        await createUserProfile(firebaseUser);
      }
      
      const userProfile = await getUserProfile(firebaseUser.uid);
      setProfile(userProfile as UserProfile);
    } catch (err: any) {
      console.error('Facebook login error:', err);
      setError(err.message || 'Erreur de connexion Facebook');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Apple Login
  const loginWithApple = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const firebaseUser = await signInWithApple();
      setUser(firebaseUser);
      
      if (!isInDemoMode()) {
        await createUserProfile(firebaseUser);
      }
      
      const userProfile = await getUserProfile(firebaseUser.uid);
      setProfile(userProfile as UserProfile);
    } catch (err: any) {
      console.error('Apple login error:', err);
      setError(err.message || 'Erreur de connexion Apple');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Email Login
  const loginWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const firebaseUser = await signInWithEmail(email, password);
      setUser(firebaseUser);
      
      if (!isInDemoMode()) {
        await createUserProfile(firebaseUser);
      }
      
      const userProfile = await getUserProfile(firebaseUser.uid);
      setProfile(userProfile as UserProfile);
    } catch (err: any) {
      console.error('Email login error:', err);
      setError(err.message || 'Erreur de connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Email Signup
  const signupWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const firebaseUser = await signUpWithEmail(email, password);
      setUser(firebaseUser);
      
      if (!isInDemoMode()) {
        await createUserProfile(firebaseUser);
      }
      
      const userProfile = await getUserProfile(firebaseUser.uid);
      setProfile(userProfile as UserProfile);
    } catch (err: any) {
      console.error('Email signup error:', err);
      setError(err.message || 'Erreur d\'inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send Phone OTP
  const sendOTP = useCallback(async (phoneNumber: string): Promise<boolean> => {
    try {
      setError(null);
      initRecaptcha();
      
      const success = await sendPhoneOTP(phoneNumber, recaptchaVerifier.current);
      return success;
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(err.message || 'Erreur d\'envoi du code');
      throw err;
    }
  }, [initRecaptcha]);

  // Verify Phone OTP
  const verifyOTP = useCallback(async (otp: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const firebaseUser = await verifyPhoneOTP(otp);
      setUser(firebaseUser);
      
      if (!isInDemoMode()) {
        await createUserProfile(firebaseUser);
      }
      
      const userProfile = await getUserProfile(firebaseUser.uid);
      setProfile(userProfile as UserProfile);
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err.message || 'Code invalide');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset Password
  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      setError(null);
      await resetPassword(email);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Erreur de réinitialisation');
      throw err;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await logOut();
      setUser(null);
      setProfile(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Erreur de déconnexion');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    // Auth methods
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
    // Status
    isAuthenticated: !!user || !!profile,
    isDemoMode: isInDemoMode()
  };
};
