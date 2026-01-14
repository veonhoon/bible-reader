import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/config/firebase';
import { Platform } from 'react-native';

// Conditionally import native modules to support Expo Go
let Google: typeof import('expo-auth-session/providers/google') | null = null;
let AppleAuthentication: typeof import('expo-apple-authentication') | null = null;
let Crypto: typeof import('expo-crypto') | null = null;

try {
  Google = require('expo-auth-session/providers/google');
} catch (e) {
  console.log('expo-auth-session not available (running in Expo Go?)');
}

try {
  AppleAuthentication = require('expo-apple-authentication');
} catch (e) {
  console.log('expo-apple-authentication not available');
}

try {
  Crypto = require('expo-crypto');
} catch (e) {
  console.log('expo-crypto not available (running in Expo Go?)');
}

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  provider: 'google' | 'apple' | 'email';
  isPremium: boolean;
  createdAt: Date;
  lastLogin: Date;
}

const USER_STORAGE_KEY = 'bible_app_user';

// Create or update user document in Firestore
const saveUserToFirestore = async (
  firebaseUser: FirebaseUser,
  provider: 'google' | 'apple' | 'email',
  displayName?: string
): Promise<AppUser> => {
  const now = new Date();

  // If Firestore is not available, return a basic user object
  if (!isFirebaseConfigured || !db) {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      provider,
      isPremium: false,
      createdAt: now,
      lastLogin: now,
    };
  }

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    // Update last login
    await setDoc(userRef, { lastLogin: Timestamp.fromDate(now) }, { merge: true });
    const data = userDoc.data();
    return {
      id: firebaseUser.uid,
      email: data.email,
      displayName: data.displayName,
      provider: data.provider,
      isPremium: data.isPremium || false,
      createdAt: data.createdAt?.toDate() || now,
      lastLogin: now,
    };
  } else {
    // Create new user
    const newUser: Omit<AppUser, 'id'> & { createdAt: any; lastLogin: any } = {
      email: firebaseUser.email || '',
      displayName: displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      provider,
      isPremium: false,
      createdAt: Timestamp.fromDate(now),
      lastLogin: Timestamp.fromDate(now),
    };
    await setDoc(userRef, newUser);
    return {
      id: firebaseUser.uid,
      ...newUser,
      createdAt: now,
      lastLogin: now,
    };
  }
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Google Auth setup - only if the module is available AND credentials are configured
  const hasGoogleCredentials = Boolean(
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  );
  const googleAuthResult = hasGoogleCredentials && Google?.useAuthRequest
    ? Google.useAuthRequest({
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      })
    : null;
  const googleResponse = googleAuthResult?.[1];
  const promptGoogleAsync = googleAuthResult?.[2];

  // Listen to Firebase auth state changes
  useEffect(() => {
    // If Firebase is not configured, just set loading to false
    if (!isFirebaseConfigured || !auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in - fetch user data from Firestore
        try {
          if (db) {
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              const appUser: AppUser = {
                id: firebaseUser.uid,
                email: data.email,
                displayName: data.displayName,
                provider: data.provider,
                isPremium: data.isPremium || false,
                createdAt: data.createdAt?.toDate() || new Date(),
                lastLogin: data.lastLogin?.toDate() || new Date(),
              };
              setUser(appUser);
              await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(appUser));
            }
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setUser(null);
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle Google auth response
  useEffect(() => {
    if (googleResponse?.type === 'success' && auth) {
      const { id_token } = googleResponse.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(async (result) => {
          await saveUserToFirestore(result.user, 'google');
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  }, [googleResponse]);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    console.log('[Auth] signInWithGoogle called');
    console.log('[Auth] isFirebaseConfigured:', isFirebaseConfigured);
    console.log('[Auth] auth:', !!auth);
    console.log('[Auth] promptGoogleAsync:', !!promptGoogleAsync);
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      const errorMsg = 'Firebase is not configured. Please set up your .env file with Firebase credentials.';
      console.log('[Auth] Setting error:', errorMsg);
      setError(errorMsg);
      return;
    }
    if (!promptGoogleAsync) {
      const errorMsg = 'Google Sign-In requires a development build. Please use Email sign-in for now.';
      console.log('[Auth] Setting error:', errorMsg);
      setError(errorMsg);
      return;
    }
    try {
      console.log('[Auth] Calling promptGoogleAsync');
      await promptGoogleAsync();
    } catch (err: any) {
      console.log('[Auth] Error from promptGoogleAsync:', err);
      setError(err.message);
    }
  }, [promptGoogleAsync]);

  // Sign in with Apple
  const signInWithApple = useCallback(async () => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      setError('Firebase is not configured. Please set up your .env file with Firebase credentials.');
      return;
    }
    if (!Crypto || !AppleAuthentication) {
      setError('Apple Sign-In requires a development build. Please build the app with expo-dev-client.');
      return;
    }
    try {
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      const { identityToken, fullName } = credential;
      if (!identityToken) {
        throw new Error('No identity token received from Apple');
      }

      const provider = new OAuthProvider('apple.com');
      const oauthCredential = provider.credential({
        idToken: identityToken,
        rawNonce: nonce,
      });

      const result = await signInWithCredential(auth, oauthCredential);

      // Apple only provides name on first sign-in
      const displayName = fullName
        ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
        : undefined;

      await saveUserToFirestore(result.user, 'apple', displayName);
    } catch (err: any) {
      if (err.code !== 'ERR_CANCELED') {
        setError(err.message);
      }
    }
  }, []);

  // Sign in with Email/Password
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      setError('Firebase is not configured. Please set up your .env file with Firebase credentials.');
      throw new Error('Firebase not configured');
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUserToFirestore(result.user, 'email');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError(err.message);
      }
      throw err;
    }
  }, []);

  // Sign up with Email/Password
  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      setError('Firebase is not configured. Please set up your .env file with Firebase credentials.');
      throw new Error('Firebase not configured');
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await saveUserToFirestore(result.user, 'email', displayName);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError(err.message);
      }
      throw err;
    }
  }, []);

  // Sign out
  const logout = useCallback(async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Check if Apple Sign-In is available (iOS only)
  const isAppleSignInAvailable = Platform.OS === 'ios';

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    logout,
    isAppleSignInAvailable,
    clearError: () => setError(null),
  };
});
