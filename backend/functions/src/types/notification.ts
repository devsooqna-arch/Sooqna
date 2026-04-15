import type { FirestoreDate } from "./firestore";
import type { NotificationType } from "./enums";

/**
 * `users/{userId}/notifications/{notificationId}`
 */
export interface Notification {
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
  isRead: boolean;
  readAt: FirestoreDate;
  createdAt: FirestoreDate;
}
