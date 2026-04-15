"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type FirestoreUserDocState = {
  /** Raw Firestore document data, or null if missing */
  data: Record<string, unknown> | null;
  exists: boolean;
  loading: boolean;
  error: Error | null;
};

/**
 * Live subscription to `users/{uid}` for debugging / profile verification.
 */
export function useFirestoreUserDoc(uid: string | null | undefined): FirestoreUserDocState {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(Boolean(uid));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setData(null);
      setExists(false);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const ref = doc(db, "users", uid);
    let unsub: Unsubscribe | undefined;

    try {
      unsub = onSnapshot(
        ref,
        (snapshot) => {
          setExists(snapshot.exists());
          setData(snapshot.exists() ? (snapshot.data() as Record<string, unknown>) : null);
          setLoading(false);
        },
        (err) => {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      );
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setLoading(false);
    }

    return () => {
      unsub?.();
    };
  }, [uid]);

  return { data, exists, loading, error };
}
