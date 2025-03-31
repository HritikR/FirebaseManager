import { type FirebaseApp } from "firebase/app";
import { type Firestore } from "firebase/firestore";
import { type FirebaseStorage } from "firebase/storage";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

export interface FirebaseContextType {
  config: FirebaseConfig | null;
  setConfig: (config: FirebaseConfig) => void;
  app: FirebaseApp | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
  updateConfig: (newConfig: FirebaseConfig) => void;
  signIn: (email: string, password: string) => Promise<void>;
}

export interface Window {
  firebaseConfig?: FirebaseConfig
}