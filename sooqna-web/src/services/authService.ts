import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email.trim(), password);
}

export async function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, provider);
}

export async function logout() {
  return signOut(auth);
}

