"use client";

import { FirebaseConfig, FirebaseContextType } from "@/types";
import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  type Auth
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<FirebaseConfig | null>(null);
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [firestore, setFirestoreInstance] = useState<Firestore | null>(null);
  const [storage, setStorageInstance] = useState<FirebaseStorage | null>(null);
  const [auth, setAuthInstance] = useState<Auth | null>(null);

  const initializeFirebase = useCallback((newConfig: FirebaseConfig) => {
    try {
      // Avoid re-initializing if already initialized
      const existingApp = getApps().length ? getApps()[0] : initializeApp(newConfig);

      setApp(existingApp);
      setAuthInstance(getAuth(existingApp));
      setFirestoreInstance(getFirestore(existingApp));
      setStorageInstance(getStorage(existingApp));
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }, []);

  const setConfig = useCallback((newConfig: FirebaseConfig) => {
    setConfigState(newConfig);
    initializeFirebase(newConfig);
  }, [initializeFirebase]);

  const updateConfig = setConfig;

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!auth) throw new Error("Firebase Auth is not initialized");

      try {
        await signInWithEmailAndPassword(auth, email, password);
        return;
      } catch (error) {
        console.error(error)
      }
    },
    [auth]
  );

  return (
    <FirebaseContext.Provider
      value={{
        config,
        setConfig,
        app,
        firestore,
        storage,
        updateConfig,
        signIn,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebaseConfig() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebaseConfig must be used within a FirebaseConfigProvider");
  }
  return context;
}
