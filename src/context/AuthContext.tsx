import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../firebase';

export interface UserEnneagramProfile {
  uid: string;
  displayName: string;
  detectedType: number;
  preferredWing?: string;
}

interface AuthContextValue {
  user: User | null;
  authLoading: boolean;
  authError: string | null;
  userProfile: UserEnneagramProfile | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveDetectedType: (enneatypeNumber: number, wing?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserEnneagramProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userPath = `users/${user.uid}`;
    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUserProfile({
            uid: String(data.uid ?? user.uid),
            displayName: String(data.displayName ?? user.displayName ?? 'Explorador'),
            detectedType: Number(data.detectedType ?? 1),
            preferredWing:
              typeof data.preferredWing === 'string' ? data.preferredWing : undefined,
          });
        } else {
          const safeName = (user.displayName || user.email?.split('@')[0] || 'Explorador').slice(
            0,
            120,
          );
          setDoc(userRef, {
            uid: user.uid,
            displayName: safeName,
            detectedType: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }).catch((err) => {
            handleFirestoreError(err, OperationType.CREATE, userPath);
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, userPath);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'No se pudo completar el inicio de sesión.';
      setAuthError(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Error al cerrar sesión.';
      setAuthError(msg);
    }
  }, []);

  const saveDetectedType = useCallback(
    async (enneatypeNumber: number, wing?: string) => {
      if (!user) return;
      const safeType = Math.min(9, Math.max(1, Math.round(enneatypeNumber)));
      const userPath = `users/${user.uid}`;
      const userRef = doc(db, 'users', user.uid);
      try {
        const payload: Record<string, unknown> = {
          detectedType: safeType,
          updatedAt: serverTimestamp(),
        };
        if (wing && wing.length >= 2 && wing.length <= 10) {
          payload.preferredWing = wing;
        }
        await updateDoc(userRef, payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, userPath);
      }
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        authError,
        userProfile,
        signInWithGoogle,
        logout,
        saveDetectedType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider');
  }
  return ctx;
}
