import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { firebaseAuth } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Keep React state in sync with Firebase auth session.
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signUpWithEmail(email, password) {
    return createUserWithEmailAndPassword(firebaseAuth, email, password);
  }

  async function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(firebaseAuth, email, password);
  }

  async function logoutUser() {
    return signOut(firebaseAuth);
  }

  const value = useMemo(
    () => ({
      currentUser,
      isAuthLoading,
      signUpWithEmail,
      loginWithEmail,
      logoutUser
    }),
    [currentUser, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return authContext;
}
