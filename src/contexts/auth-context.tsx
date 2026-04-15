
"use client";

import type { User as FirebaseUserType } from 'firebase/auth';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Removed usePathname as it's not used directly here
import type { ReactNode} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { app } from '@/lib/firebase';

interface AuthContextType {
  user: FirebaseUserType | null;
  loading: boolean;
  login: (emailInput: string, passwordInput: string) => Promise<void>;
  mockLogin: () => Promise<void>; // Added mockLogin
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to create a minimal mock Firebase user object
const createMockFirebaseUser = (email: string, displayName?: string): FirebaseUserType => {
  return {
    uid: `mock-${email}-${Date.now()}`,
    email: email,
    displayName: displayName || email,
    emailVerified: true,
    isAnonymous: false,
    photoURL: null,
    providerId: 'password', // Mock provider
    providerData: [
      {
        providerId: 'password',
        uid: `mock-provider-${email}`,
        displayName: displayName || email,
        email: email,
        phoneNumber: null,
        photoURL: null,
      }
    ],
    metadata: {
      creationTime: new Date().toUTCString(),
      lastSignInTime: new Date().toUTCString(),
    },
    // Required functions, can be stubs for mock
    delete: async () => {},
    getIdToken: async () => 'mock-token',
    getIdTokenResult: async () => ({ token: 'mock-token', claims: {}, expirationTime: '', issuedAtTime: '', signInProvider: null, signInSecondFactor: null}),
    reload: async () => {},
    toJSON: () => ({}),
    // Add any other properties required by FirebaseUserType if needed
  } as FirebaseUserType;
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUserType | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const login = async (emailInput: string, passwordInput: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
      // onAuthStateChanged will handle setting the user state.
    } catch (error) {
      // setLoading(false); // Let onAuthStateChanged handle loading state if login fails and it reverts user
      throw error;
    }
    // setLoading(false) is managed by onAuthStateChanged now
  };

  const mockLogin = async () => {
    setLoading(true);
    // Simulate a short delay for realism if needed
    // await new Promise(resolve => setTimeout(resolve, 500));
    const mockUser = createMockFirebaseUser("test@gmail.com", "Test User");
    setUser(mockUser);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    try {
      // If the current user is the mock user, just clear it locally.
      // Otherwise, sign out from Firebase.
      if (user && user.email === "test@gmail.com" && user.uid.startsWith("mock-")) {
         setUser(null);
      } else {
        await signOut(auth);
        // onAuthStateChanged will set user to null
      }
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, mockLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
