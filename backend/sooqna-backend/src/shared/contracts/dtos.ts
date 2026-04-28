import type { Conversation, Message } from "../../modules/messages/messages.types";
import type { Listing } from "../../modules/listings/listings.types";
import type { UserProfile } from "../../modules/users/users.types";

export type AuthSessionDto = {
  uid: string | null;
  email: string | null;
};

export type UpsertProfileRequestDto = {
  fullName?: string;
  photoURL?: string;
};

export type ListingsQueryDto = {
  limit?: number;
  offset?: number;
  category?: string;
  city?: string;
  search?: string;
  sort?: "newest" | "price_asc" | "price_desc";
};

export type ListingsListDto = {
  listings: Listing[];
  total: number;
  limit: number;
  offset: number;
};

export type FavoriteListDto = {
  listingIds: string[];
};

export type ConversationsListDto = {
  conversations: Conversation[];
};

export type MessagesListDto = {
  messages: Message[];
};

export type MeDto = {
  profile: UserProfile | null;
};
