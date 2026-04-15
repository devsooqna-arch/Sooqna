import type { Timestamp } from "firebase-admin/firestore";

/** Firestore-stored date fields (set server-side or via SDK). */
export type FirestoreDate = Timestamp | null;
