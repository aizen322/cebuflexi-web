import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "user" | "admin" | "moderator";
  createdAt: Date;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get ID token result to fetch custom claims (role)
          const tokenResult = await firebaseUser.getIdTokenResult();
          const role = (tokenResult.claims.role as "user" | "admin" | "moderator") || "user";
          
          // Try to get user profile from Firestore with error handling
          let userData: any = null;
          try {
            // Check if db is initialized before attempting to read
            if (db) {
              const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
              if (userDoc.exists()) {
                userData = userDoc.data();
              }
            }
          } catch (firestoreError: any) {
            // Handle offline/connection errors gracefully
            console.warn("Firestore read failed (may be offline):", firestoreError);
            // Continue with auth data only - user can still sign in
          }
          
          if (userData) {
            // Use Firestore data if available
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: userData.role || role,
              createdAt: userData.createdAt?.toDate() || new Date(),
            });
          } else {
            // Use auth data and try to create/update Firestore profile in background
            const newUserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: role,
              createdAt: new Date(),
            };
            
            // Set user immediately with auth data
            setUser(newUserProfile);
            
            // Try to sync with Firestore in background (non-blocking)
            if (db) {
              setDoc(doc(db, "users", firebaseUser.uid), {
                ...newUserProfile,
                createdAt: new Date(),
                role: role,
              }).catch((error) => {
                console.warn("Failed to sync user profile to Firestore:", error);
                // User can still use the app with auth data
              });
            }
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          // Fallback: set user with minimal auth data
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: "user",
            createdAt: new Date(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update Firebase Auth profile
    await updateProfile(firebaseUser, {
      displayName: displayName,
    });

    // Create user profile in Firestore
    const userProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: displayName,
      photoURL: firebaseUser.photoURL,
      role: "user" as const,
      createdAt: new Date(),
    };

    await setDoc(doc(db, "users", firebaseUser.uid), {
      ...userProfile,
      createdAt: new Date(),
      role: "user",
    });
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const { user: firebaseUser } = await signInWithPopup(auth, provider);
    
    // Check if user profile exists, create if not (with error handling)
    if (db) {
      try {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        
        if (!userDoc.exists()) {
          const userProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: "user" as const,
            createdAt: new Date(),
          };

          await setDoc(doc(db, "users", firebaseUser.uid), {
            ...userProfile,
            createdAt: new Date(),
            role: "user",
          });
        }
      } catch (error) {
        // Handle offline/connection errors - user can still sign in
        console.warn("Failed to sync Google sign-in to Firestore:", error);
        // User profile will be created by onAuthStateChanged when connection is restored
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}