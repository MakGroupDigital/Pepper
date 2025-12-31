import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  Auth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  PhoneAuthProvider,
  linkWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';

// Firebase configuration - Replace with your own config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000"
};

// Check if we're in demo mode
const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
                   import.meta.env.VITE_FIREBASE_API_KEY === "demo-api-key";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn('Firebase initialization error:', error);
}

export { auth, db, storage };

// Auth providers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Store confirmation result for phone auth
let phoneConfirmationResult: ConfirmationResult | null = null;

// Demo user for development
const createDemoUser = (method: string = 'demo'): User => ({
  uid: 'demo-user-' + Date.now(),
  email: 'demo@peperr.app',
  displayName: 'Pepper Demo',
  photoURL: 'https://picsum.photos/seed/demo/200/200',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  phoneNumber: method === 'phone' ? '+33612345678' : null,
  delete: async () => {},
  getIdToken: async () => 'demo-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  providerId: method
});

// ============ GOOGLE AUTH ============
export const signInWithGoogle = async (): Promise<User> => {
  if (isDemoMode) {
    console.log('🌶️ Mode démo - Connexion Google simulée');
    const demoUser = createDemoUser('google');
    localStorage.setItem('peperr_demo_user', JSON.stringify({
      uid: demoUser.uid,
      email: demoUser.email,
      displayName: demoUser.displayName,
      photoURL: demoUser.photoURL,
      provider: 'google'
    }));
    return demoUser;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google sign in error:', error);
    throw error;
  }
};

// ============ FACEBOOK AUTH ============
export const signInWithFacebook = async (): Promise<User> => {
  if (isDemoMode) {
    console.log('🌶️ Mode démo - Connexion Facebook simulée');
    const demoUser = createDemoUser('facebook');
    localStorage.setItem('peperr_demo_user', JSON.stringify({
      uid: demoUser.uid,
      email: 'demo@facebook.com',
      displayName: 'Pepper Facebook',
      photoURL: 'https://picsum.photos/seed/fb/200/200',
      provider: 'facebook'
    }));
    return demoUser;
  }

  try {
    const result = await signInWithPopup(auth, facebookProvider);
    return result.user;
  } catch (error: any) {
    console.error('Facebook sign in error:', error);
    throw error;
  }
};

// ============ APPLE AUTH ============
export const signInWithApple = async (): Promise<User> => {
  if (isDemoMode) {
    console.log('🌶️ Mode démo - Connexion Apple simulée');
    const demoUser = createDemoUser('apple');
    localStorage.setItem('peperr_demo_user', JSON.stringify({
      uid: demoUser.uid,
      email: 'demo@icloud.com',
      displayName: 'Pepper Apple',
      photoURL: 'https://picsum.photos/seed/apple/200/200',
      provider: 'apple'
    }));
    return demoUser;
  }

  try {
    const result = await signInWithPopup(auth, appleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Apple sign in error:', error);
    throw error;
  }
};

// ============ EMAIL AUTH ============
export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  if (isDemoMode) {
    console.log('🌶️ Mode démo - Inscription email simulée');
    const demoUser = createDemoUser('email');
    localStorage.setItem('peperr_demo_user', JSON.stringify({
      uid: demoUser.uid,
      email: email,
      displayName: email.split('@')[0],
      photoURL: `https://picsum.photos/seed/${email}/200/200`,
      provider: 'email'
    }));
    return demoUser;
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Send verification email
    await sendEmailVerification(result.user);
    return result.user;
  } catch (error: any) {
    console.error('Email sign up error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  if (isDemoMode) {
    console.log('🌶️ Mode démo - Connexion email simulée');
    const demoUser = createDemoUser('email');
    localStorage.setItem('peperr_demo_user', JSON.stringify({
      uid: demoUser.uid,
      email: email,
      displayName: email.split('@')[0],
      photoURL: `https://picsum.photos/seed/${email}/200/200`,
      provider: 'email'
    }));
    return demoUser;
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error('Email sign in error:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  if (isDemoMode) {
    console.log('🌶️ Mode démo - Reset password simulé pour:', email);
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// ============ PHONE AUTH ============
export const setupRecaptcha = (containerId: string): RecaptchaVerifier | null => {
  if (isDemoMode) {
    console.log('🌶️ Mode démo - Recaptcha simulé');
    return null;
  }

  try {
    const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('Recaptcha verified');
      },
      'expired-callback': () => {
        console.log('Recaptcha expired');
      }
    });
    return recaptchaVerifier;
  } catch (error) {
    console.error('Recaptcha setup error:', error);
    return null;
  }
};

export const sendPhoneOTP = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier | null): Promise<boolean> => {
  if (isDemoMode) {
    console.log('🌶️ Mode démo - OTP envoyé à:', phoneNumber);
    // Simulate OTP sent
    localStorage.setItem('peperr_demo_phone', phoneNumber);
    return true;
  }

  if (!recaptchaVerifier) {
    throw new Error('Recaptcha not initialized');
  }

  try {
    phoneConfirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return true;
  } catch (error: any) {
    console.error('Phone OTP error:', error);
    throw error;
  }
};

export const verifyPhoneOTP = async (otp: string): Promise<User> => {
  if (isDemoMode) {
    console.log('🌶️ Mode démo - OTP vérifié:', otp);
    const phone = localStorage.getItem('peperr_demo_phone') || '+33600000000';
    const demoUser = createDemoUser('phone');
    localStorage.setItem('peperr_demo_user', JSON.stringify({
      uid: demoUser.uid,
      email: null,
      displayName: 'Pepper User',
      photoURL: 'https://picsum.photos/seed/phone/200/200',
      phoneNumber: phone,
      provider: 'phone'
    }));
    localStorage.removeItem('peperr_demo_phone');
    return demoUser;
  }

  if (!phoneConfirmationResult) {
    throw new Error('No confirmation result. Please request OTP first.');
  }

  try {
    const result = await phoneConfirmationResult.confirm(otp);
    phoneConfirmationResult = null;
    return result.user;
  } catch (error: any) {
    console.error('OTP verification error:', error);
    throw error;
  }
};

// ============ LOGOUT ============
export const logOut = async () => {
  if (isDemoMode) {
    localStorage.removeItem('peperr_demo_user');
    localStorage.removeItem('peperr_demo_phone');
    return;
  }

  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// ============ AUTH STATE ============
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (isDemoMode) {
    const storedUser = localStorage.getItem('peperr_demo_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      callback(userData as User);
    } else {
      callback(null);
    }
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};

// ============ USER PROFILE ============
export const createUserProfile = async (user: User, additionalData?: any) => {
  if (isDemoMode) {
    console.log('Demo mode: Skipping Firestore user profile creation');
    return null;
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      const { displayName, email, photoURL, phoneNumber } = user;
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        phoneNumber,
        username: displayName?.toLowerCase().replace(/\s/g, '_') || `user_${user.uid.slice(0, 8)}`,
        createdAt: serverTimestamp(),
        totalSpice: 0,
        followers: 0,
        following: 0,
        ...additionalData
      });
    }

    return userRef;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string) => {
  if (isDemoMode) {
    const storedUser = localStorage.getItem('peperr_demo_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      return {
        id: userData.uid,
        displayName: userData.displayName || 'Pepper User',
        email: userData.email,
        photoURL: userData.photoURL || 'https://picsum.photos/seed/demo/200/200',
        phoneNumber: userData.phoneNumber,
        username: userData.displayName?.toLowerCase().replace(/\s/g, '_') || 'pepper_user',
        totalSpice: 42000,
        followers: 1337,
        following: 420
      };
    }
    return null;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, data: any) => {
  if (isDemoMode) {
    console.log('Demo mode: Skipping profile update');
    return;
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);
  } catch (error) {
    console.error('Error updating user profile:', error);
  }
};

// ============ POSTS ============
export const createPost = async (userId: string, postData: {
  description: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  hashtags: string[];
  mood?: string;
}) => {
  if (isDemoMode) {
    console.log('Demo mode: Post created locally', postData);
    return 'demo-post-' + Date.now();
  }

  try {
    const postRef = await addDoc(collection(db, 'posts'), {
      userId,
      ...postData,
      spiceCount: 0,
      comments: 0,
      shares: 0,
      createdAt: serverTimestamp()
    });
    return postRef.id;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

export const getPosts = async (limitCount: number = 20) => {
  if (isDemoMode) return [];
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
};

export const getUserPosts = async (userId: string) => {
  if (isDemoMode) return [];
  try {
    const q = query(collection(db, 'posts'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting user posts:', error);
    return [];
  }
};

export const addSpiceToPost = async (postId: string, userId: string, spiceLevel: number) => {
  if (isDemoMode) {
    console.log('Demo mode: Spice added', { postId, spiceLevel });
    return;
  }
  try {
    await addDoc(collection(db, 'spices'), { postId, userId, level: spiceLevel, createdAt: serverTimestamp() });
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      await updateDoc(postRef, { spiceCount: (postSnap.data().spiceCount || 0) + spiceLevel });
    }
  } catch (error) {
    console.error('Error adding spice:', error);
  }
};

// ============ COMMENTS ============
export const addComment = async (postId: string, userId: string, text: string) => {
  if (isDemoMode) {
    console.log('Demo mode: Comment added', { postId, text });
    return 'demo-comment-' + Date.now();
  }
  try {
    const commentRef = await addDoc(collection(db, 'comments'), { postId, userId, text, spiceLevel: 0, createdAt: serverTimestamp() });
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      await updateDoc(postRef, { comments: (postSnap.data().comments || 0) + 1 });
    }
    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
};

export const getComments = async (postId: string) => {
  if (isDemoMode) return [];
  try {
    const q = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

// ============ VAULT ============
export const createVaultCircle = async (creatorId: string, name: string, memberIds: string[]) => {
  if (isDemoMode) {
    console.log('Demo mode: Vault circle created', { name, memberIds });
    return 'demo-vault-' + Date.now();
  }
  try {
    const circleRef = await addDoc(collection(db, 'vaultCircles'), {
      name, creatorId, members: [creatorId, ...memberIds],
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)),
      isLocked: true
    });
    return circleRef.id;
  } catch (error) {
    console.error('Error creating vault circle:', error);
    return null;
  }
};

export const getVaultCircles = async (userId: string) => {
  if (isDemoMode) return [];
  try {
    const q = query(collection(db, 'vaultCircles'), where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting vault circles:', error);
    return [];
  }
};

export const addVaultPost = async (circleId: string, userId: string, mediaUrl: string) => {
  if (isDemoMode) {
    console.log('Demo mode: Vault post added', { circleId, mediaUrl });
    return;
  }
  try {
    await addDoc(collection(db, 'vaultPosts'), { circleId, userId, mediaUrl, createdAt: serverTimestamp() });
    const circleRef = doc(db, 'vaultCircles', circleId);
    const circleSnap = await getDoc(circleRef);
    if (circleSnap.exists()) {
      const members = circleSnap.data().members || [];
      const postsQuery = query(collection(db, 'vaultPosts'), where('circleId', '==', circleId));
      const postsSnap = await getDocs(postsQuery);
      const postedUserIds = new Set(postsSnap.docs.map(d => d.data().userId));
      if (members.every((m: string) => postedUserIds.has(m))) {
        await updateDoc(circleRef, { isLocked: false });
      }
    }
  } catch (error) {
    console.error('Error adding vault post:', error);
  }
};

// ============ STORAGE ============
export const uploadMedia = async (file: Blob, path: string): Promise<string> => {
  if (isDemoMode) return URL.createObjectURL(file);
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading media:', error);
    return URL.createObjectURL(file);
  }
};

export const uploadPostMedia = async (userId: string, file: Blob, type: 'photo' | 'video'): Promise<string> => {
  const extension = type === 'photo' ? 'jpg' : 'webm';
  const path = `posts/${userId}/${Date.now()}.${extension}`;
  return uploadMedia(file, path);
};

// Export demo mode status
export const isInDemoMode = () => isDemoMode;

// Export types
export type { User };
