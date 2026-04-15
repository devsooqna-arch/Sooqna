"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFirestoreUserDoc } from "@/hooks/useFirestoreUserDoc";
import { getAuthErrorMessage } from "@/services/authService";
import { getCategories } from "@/services/categoryService";
import { createListing, getListings } from "@/services/listingService";
import {
  addToFavorites,
  getUserFavoriteListingIds,
  isFavorite,
  removeFromFavorites,
} from "@/services/favoriteService";
import {
  createConversation,
  createMessage,
  getConversationById,
  getConversationMessages,
} from "@/services/messageService";
import { ImageUpload } from "@/components/listings/ImageUpload";
import type { Category } from "@/types/category";
import type { Listing } from "@/types/listing";
import type { Conversation, Message } from "@/types/message";

type AuthMode = "signup" | "login";

type ListingFormState = {
  title: string;
  description: string;
  price: string;
  categoryId: string;
  country: string;
  city: string;
  area: string;
  condition: "new" | "used";
  contactPreference: "chat" | "phone";
};

const initialListingForm: ListingFormState = {
  title: "",
  description: "",
  price: "",
  categoryId: "",
  country: "",
  city: "",
  area: "",
  condition: "used",
  contactPreference: "chat",
};

function TestCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function KeyValue({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-2 text-sm">
      <span className="font-medium text-slate-600">{label}</span>
      <span className="break-all text-slate-900">{value}</span>
    </div>
  );
}

export function SystemTestDashboard() {
  const { currentUser, loading: authLoading, register, login, loginWithGoogle, logout } = useAuth();
  const { data: profileData, exists: profileExists, loading: profileLoading } = useFirestoreUserDoc(
    currentUser?.uid
  );

  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);

  const [listingForm, setListingForm] = useState<ListingFormState>(initialListingForm);
  const [listingSubmitting, setListingSubmitting] = useState(false);
  const [listingMessage, setListingMessage] = useState<string | null>(null);
  const [listingError, setListingError] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string>("");

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [favoriteState, setFavoriteState] = useState<boolean | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const [secondParticipantId, setSecondParticipantId] = useState("");
  const [conversationListingId, setConversationListingId] = useState("");
  const [messageText, setMessageText] = useState("Hello from system test");
  const [conversationId, setConversationId] = useState("");
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [messagesMessage, setMessagesMessage] = useState<string | null>(null);
  const [conversationData, setConversationData] = useState<Conversation | null>(null);
  const [messagesData, setMessagesData] = useState<Message[]>([]);

  const effectiveListingId = selectedListingId || conversationListingId;

  useEffect(() => {
    void reloadCategories();
    void reloadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authLoading && currentUser) {
      void reloadFavoriteIds();
    } else {
      setFavoriteIds([]);
      setFavoriteState(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, currentUser]);

  useEffect(() => {
    if (!currentUser || !effectiveListingId) {
      setFavoriteState(null);
      return;
    }
    void checkFavoriteState(effectiveListingId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveListingId, currentUser?.uid]);

  async function reloadCategories(): Promise<void> {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const data = await getCategories();
      setCategories(data);
      setListingForm((prev) => ({
        ...prev,
        categoryId: prev.categoryId || data[0]?.id || "",
      }));
    } catch (error) {
      setCategoriesError(error instanceof Error ? error.message : "Failed to load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function reloadListings(): Promise<void> {
    setListingsLoading(true);
    setListingsError(null);
    try {
      const data = await getListings();
      setListings(data);
    } catch (error) {
      setListingsError(error instanceof Error ? error.message : "Failed to load listings.");
    } finally {
      setListingsLoading(false);
    }
  }

  async function reloadFavoriteIds(): Promise<void> {
    if (!currentUser) return;
    try {
      const ids = await getUserFavoriteListingIds(currentUser.uid);
      setFavoriteIds(ids);
    } catch {
      setFavoriteIds([]);
    }
  }

  async function checkFavoriteState(listingId: string): Promise<void> {
    if (!currentUser) return;
    try {
      const value = await isFavorite(currentUser.uid, listingId);
      setFavoriteState(value);
    } catch {
      setFavoriteState(null);
    }
  }

  async function handleAuthSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setAuthError(null);
    setAuthMessage(null);

    if (!email.trim()) {
      setAuthError("Email is required.");
      return;
    }
    if (!password.trim() || password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (authMode === "signup" && !fullName.trim()) {
      setAuthError("Full name is required for sign up.");
      return;
    }

    setAuthSubmitting(true);
    try {
      if (authMode === "signup") {
        await register(email.trim(), password, fullName.trim());
        setAuthMessage("Sign up succeeded.");
      } else {
        await login(email.trim(), password);
        setAuthMessage("Login succeeded.");
      }
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleGoogleLogin(): Promise<void> {
    setAuthError(null);
    setAuthMessage(null);
    setAuthSubmitting(true);
    try {
      await loginWithGoogle();
      setAuthMessage("Google login succeeded.");
    } catch (error) {
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleCreateListing(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setListingError(null);
    setListingMessage(null);

    if (!listingForm.title.trim()) {
      setListingError("Title is required.");
      return;
    }
    if (!listingForm.categoryId.trim()) {
      setListingError("Category is required.");
      return;
    }
    const price = Number(listingForm.price);
    if (!Number.isFinite(price) || price < 0) {
      setListingError("Price must be a non-negative number.");
      return;
    }

    setListingSubmitting(true);
    try {
      const result = await createListing({
        title: listingForm.title.trim(),
        categoryId: listingForm.categoryId.trim(),
        price,
      });
      setSelectedListingId(result.listingId);
      setConversationListingId(result.listingId);
      setListingMessage(`Listing created: ${result.listingId}`);
      setListingForm(initialListingForm);
      await reloadListings();
    } catch (error) {
      setListingError(error instanceof Error ? error.message : "Failed to create listing.");
    } finally {
      setListingSubmitting(false);
    }
  }

  async function handleAddFavorite(): Promise<void> {
    if (!currentUser || !effectiveListingId) return;
    setFavoriteLoading(true);
    setFavoriteError(null);
    setFavoriteMessage(null);
    try {
      await addToFavorites(currentUser.uid, effectiveListingId);
      setFavoriteMessage("Listing added to favorites.");
      await reloadFavoriteIds();
      await checkFavoriteState(effectiveListingId);
    } catch (error) {
      setFavoriteError(error instanceof Error ? error.message : "Failed to add favorite.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handleRemoveFavorite(): Promise<void> {
    if (!currentUser || !effectiveListingId) return;
    setFavoriteLoading(true);
    setFavoriteError(null);
    setFavoriteMessage(null);
    try {
      await removeFromFavorites(currentUser.uid, effectiveListingId);
      setFavoriteMessage("Listing removed from favorites.");
      await reloadFavoriteIds();
      await checkFavoriteState(effectiveListingId);
    } catch (error) {
      setFavoriteError(error instanceof Error ? error.message : "Failed to remove favorite.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handleCreateConversation(): Promise<void> {
    if (!currentUser) {
      setMessagesError("Login required.");
      return;
    }
    if (!conversationListingId.trim()) {
      setMessagesError("listingId is required.");
      return;
    }
    if (!secondParticipantId.trim()) {
      setMessagesError("Second participant userId is required.");
      return;
    }
    setMessagesLoading(true);
    setMessagesError(null);
    setMessagesMessage(null);
    try {
      const result = await createConversation({
        participantIds: [currentUser.uid, secondParticipantId.trim()],
        participants: {
          [currentUser.uid]: {
            fullName: currentUser.displayName ?? "",
            photoURL: currentUser.photoURL ?? "",
          },
          [secondParticipantId.trim()]: {
            fullName: "Test Participant",
            photoURL: "",
          },
        },
        listingId: conversationListingId.trim(),
        listingSnapshot: {
          title: "System Test Listing Snapshot",
          primaryImageURL: "",
        },
        createdBy: currentUser.uid,
      });
      setConversationId(result.conversationId);
      setMessagesMessage(`Conversation created: ${result.conversationId}`);
      await handleFetchConversation(result.conversationId);
    } catch (error) {
      setMessagesError(error instanceof Error ? error.message : "Failed to create conversation.");
    } finally {
      setMessagesLoading(false);
    }
  }

  async function handleCreateMessage(): Promise<void> {
    if (!currentUser) {
      setMessagesError("Login required.");
      return;
    }
    if (!conversationId.trim()) {
      setMessagesError("Conversation ID is required.");
      return;
    }
    if (!messageText.trim()) {
      setMessagesError("Message text is required.");
      return;
    }
    setMessagesLoading(true);
    setMessagesError(null);
    setMessagesMessage(null);
    try {
      const result = await createMessage(conversationId.trim(), {
        senderId: currentUser.uid,
        type: "text",
        text: messageText.trim(),
      });
      setMessagesMessage(`Message created: ${result.messageId}`);
      await handleFetchConversation(conversationId.trim());
    } catch (error) {
      setMessagesError(error instanceof Error ? error.message : "Failed to create message.");
    } finally {
      setMessagesLoading(false);
    }
  }

  async function handleFetchConversation(id = conversationId): Promise<void> {
    if (!id.trim()) {
      setMessagesError("Conversation ID is required.");
      return;
    }
    setMessagesLoading(true);
    setMessagesError(null);
    try {
      const conversation = await getConversationById(id.trim());
      const messages = await getConversationMessages(id.trim());
      setConversationData(conversation);
      setMessagesData(messages);
    } catch (error) {
      setMessagesError(error instanceof Error ? error.message : "Failed to fetch conversation.");
    } finally {
      setMessagesLoading(false);
    }
  }

  async function handleLogout(): Promise<void> {
    setAuthError(null);
    setAuthMessage(null);
    try {
      await logout();
      setSelectedListingId("");
      setConversationListingId("");
      setConversationId("");
      setConversationData(null);
      setMessagesData([]);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Logout failed.");
    }
  }

  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === selectedListingId) ?? null,
    [listings, selectedListingId]
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">System Test Dashboard</h1>
        <p className="text-sm text-slate-600">
          Milestone 1 QA page for authentication, profile, categories, listings, images,
          favorites, messages, and logout.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <TestCard title="1) Authentication Test">
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`rounded px-3 py-1 ${authMode === "signup" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`rounded px-3 py-1 ${authMode === "login" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Login
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3">
            {authMode === "signup" ? (
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            ) : null}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={authSubmitting || authLoading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {authSubmitting ? "Processing..." : authMode === "signup" ? "Sign Up" : "Login"}
              </button>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={authSubmitting || authLoading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
              >
                Login with Google
              </button>
            </div>
          </form>

          {authMessage ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {authMessage}
            </p>
          ) : null}
          {authError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {authError}
            </p>
          ) : null}
        </TestCard>

        <TestCard title="2) Firebase Auth User Viewer">
          {authLoading ? <p className="text-sm text-slate-600">Loading auth state...</p> : null}
          {!authLoading && !currentUser ? (
            <p className="text-sm text-slate-600">No authenticated user.</p>
          ) : null}
          {currentUser ? (
            <div className="space-y-2">
              <KeyValue label="uid" value={currentUser.uid} />
              <KeyValue label="displayName" value={currentUser.displayName || "-"} />
              <KeyValue label="email" value={currentUser.email || "-"} />
              <KeyValue label="emailVerified" value={String(currentUser.emailVerified)} />
              <KeyValue label="photoURL" value={currentUser.photoURL || "-"} />
            </div>
          ) : null}
        </TestCard>

        <TestCard title="3) Firestore User Profile Viewer">
          {!currentUser ? <p className="text-sm text-slate-600">Login required.</p> : null}
          {currentUser && profileLoading ? (
            <p className="text-sm text-slate-600">Loading Firestore profile...</p>
          ) : null}
          {currentUser && !profileLoading && !profileExists ? (
            <p className="text-sm text-amber-700">Profile doc not found.</p>
          ) : null}
          {profileData ? (
            <div className="space-y-2">
              <KeyValue label="uid" value={String(profileData.uid ?? "-")} />
              <KeyValue label="fullName" value={String(profileData.fullName ?? "-")} />
              <KeyValue label="email" value={String(profileData.email ?? "-")} />
              <KeyValue label="photoURL" value={String(profileData.photoURL ?? "-")} />
              <KeyValue label="role" value={String(profileData.role ?? "-")} />
              <KeyValue label="accountStatus" value={String(profileData.accountStatus ?? "-")} />
              <KeyValue
                label="isEmailVerified"
                value={String(Boolean(profileData.isEmailVerified))}
              />
              <KeyValue label="createdAt" value={String(profileData.createdAt ?? "-")} />
              <KeyValue label="updatedAt" value={String(profileData.updatedAt ?? "-")} />
            </div>
          ) : null}
        </TestCard>

        <TestCard title="4) Categories Test">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void reloadCategories()}
              disabled={categoriesLoading}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:opacity-60"
            >
              {categoriesLoading ? "Loading..." : "Reload Categories"}
            </button>
          </div>
          {categoriesError ? <p className="text-sm text-red-700">{categoriesError}</p> : null}
          <ul className="space-y-2 text-sm">
            {categories.map((category) => (
              <li key={category.id} className="rounded-lg border border-slate-200 px-3 py-2">
                <p className="font-medium text-slate-900">
                  {category.name.ar} / {category.name.en}
                </p>
                <p className="text-slate-600">slug: {category.slug}</p>
              </li>
            ))}
          </ul>
        </TestCard>

        <TestCard title="5) Create Listing Test">
          {!currentUser ? (
            <p className="text-sm text-slate-600">Login required to create listing.</p>
          ) : (
            <form onSubmit={handleCreateListing} className="space-y-3">
              <input
                value={listingForm.title}
                onChange={(e) => setListingForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Title"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <textarea
                value={listingForm.description}
                onChange={(e) => setListingForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description (for future schema)"
                rows={2}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  value={listingForm.price}
                  onChange={(e) => setListingForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="Price"
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <select
                  value={listingForm.categoryId}
                  onChange={(e) => setListingForm((p) => ({ ...p, categoryId: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name.en} ({category.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                <input
                  value={listingForm.country}
                  onChange={(e) => setListingForm((p) => ({ ...p, country: e.target.value }))}
                  placeholder="Country"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  value={listingForm.city}
                  onChange={(e) => setListingForm((p) => ({ ...p, city: e.target.value }))}
                  placeholder="City"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  value={listingForm.area}
                  onChange={(e) => setListingForm((p) => ({ ...p, area: e.target.value }))}
                  placeholder="Area"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <select
                  value={listingForm.condition}
                  onChange={(e) =>
                    setListingForm((p) => ({ ...p, condition: e.target.value as "new" | "used" }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="new">new</option>
                  <option value="used">used</option>
                </select>
                <select
                  value={listingForm.contactPreference}
                  onChange={(e) =>
                    setListingForm((p) => ({
                      ...p,
                      contactPreference: e.target.value as "chat" | "phone",
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="chat">chat</option>
                  <option value="phone">phone</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={listingSubmitting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {listingSubmitting ? "Creating..." : "Create Listing"}
              </button>
            </form>
          )}
          {listingMessage ? <p className="text-sm text-emerald-700">{listingMessage}</p> : null}
          {listingError ? <p className="text-sm text-red-700">{listingError}</p> : null}
          {selectedListingId ? (
            <p className="text-xs text-slate-600">Selected listingId: {selectedListingId}</p>
          ) : null}
        </TestCard>

        <TestCard title="6) Listings Viewer">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void reloadListings()}
              disabled={listingsLoading}
              className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:opacity-60"
            >
              {listingsLoading ? "Loading..." : "Reload Listings"}
            </button>
          </div>
          {listingsError ? <p className="text-sm text-red-700">{listingsError}</p> : null}
          <div className="space-y-3">
            {listings.map((listing) => (
              <article
                key={listing.id}
                className={`rounded-lg border p-3 text-sm ${
                  listing.id === selectedListingId
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{listing.title || "(no title)"}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedListingId(listing.id);
                      setConversationListingId(listing.id);
                    }}
                    className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
                  >
                    Select for tests
                  </button>
                </div>
                <p>ID: {listing.id}</p>
                <p>Price: {listing.price}</p>
                <p>Category: {listing.categoryId}</p>
                <p>City: {listing.location?.city || "-"}</p>
                <p>Status: {listing.status}</p>
                <p>Owner: {listing.ownerId}</p>
                {listing.images[0]?.url ? (
                  <img
                    src={listing.images[0].url}
                    alt="Listing primary"
                    className="mt-2 h-24 w-24 rounded border border-slate-200 object-cover"
                  />
                ) : null}
              </article>
            ))}
            {!listingsLoading && listings.length === 0 ? (
              <p className="text-sm text-slate-600">No listings found.</p>
            ) : null}
          </div>
        </TestCard>

        <TestCard title="7) Image Upload Test">
          {!currentUser ? <p className="text-sm text-slate-600">Login required.</p> : null}
          {currentUser && !selectedListingId ? (
            <p className="text-sm text-amber-700">
              Create or select a listing first from the listings section.
            </p>
          ) : null}
          {currentUser && selectedListingId ? (
            <div className="space-y-2">
              <p className="text-xs text-slate-600">Uploading to listingId: {selectedListingId}</p>
              <ImageUpload listingId={selectedListingId} userId={currentUser.uid} />
            </div>
          ) : null}
        </TestCard>

        <TestCard title="8) Favorites Test">
          {!currentUser ? <p className="text-sm text-slate-600">Login required.</p> : null}
          {currentUser ? (
            <div className="space-y-3">
              <p className="text-sm">
                Active listing for favorite test:{" "}
                <span className="font-mono">{effectiveListingId || "(none selected)"}</span>
              </p>
              <p className="text-sm">isFavorite: {favoriteState === null ? "-" : String(favoriteState)}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleAddFavorite()}
                  disabled={favoriteLoading || !effectiveListingId}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
                >
                  Add to Favorites
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemoveFavorite()}
                  disabled={favoriteLoading || !effectiveListingId}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-60"
                >
                  Remove from Favorites
                </button>
                <button
                  type="button"
                  onClick={() => void reloadFavoriteIds()}
                  disabled={favoriteLoading}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-60"
                >
                  Refresh Favorite IDs
                </button>
              </div>
              {favoriteMessage ? <p className="text-sm text-emerald-700">{favoriteMessage}</p> : null}
              {favoriteError ? <p className="text-sm text-red-700">{favoriteError}</p> : null}
              <div className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                <p className="font-semibold">Favorite listing IDs:</p>
                <p className="break-all">{favoriteIds.join(", ") || "(empty)"}</p>
              </div>
            </div>
          ) : null}
        </TestCard>

        <TestCard title="9) Conversations / Messages Structure Test">
          {!currentUser ? <p className="text-sm text-slate-600">Login required.</p> : null}
          {currentUser ? (
            <div className="space-y-3">
              <input
                value={conversationListingId}
                onChange={(e) => setConversationListingId(e.target.value)}
                placeholder="listingId"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                value={secondParticipantId}
                onChange={(e) => setSecondParticipantId(e.target.value)}
                placeholder="second participant userId"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleCreateConversation()}
                  disabled={messagesLoading}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-60"
                >
                  Create Conversation
                </button>
              </div>

              <input
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                placeholder="conversationId"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="message text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleCreateMessage()}
                  disabled={messagesLoading}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-60"
                >
                  Create Message
                </button>
                <button
                  type="button"
                  onClick={() => void handleFetchConversation()}
                  disabled={messagesLoading || !conversationId.trim()}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:opacity-60"
                >
                  Fetch Conversation + Messages
                </button>
              </div>

              {messagesMessage ? <p className="text-sm text-emerald-700">{messagesMessage}</p> : null}
              {messagesError ? <p className="text-sm text-red-700">{messagesError}</p> : null}

              <div className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                <p className="font-semibold">Conversation Data</p>
                <pre className="overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(conversationData, null, 2)}
                </pre>
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                <p className="font-semibold">Messages</p>
                <pre className="overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(messagesData, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
        </TestCard>
      </div>

      <TestCard title="10) Logout Test">
        {!currentUser ? (
          <p className="text-sm text-slate-600">No active session.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-700">Logged in as: {currentUser.email || currentUser.uid}</p>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        )}
      </TestCard>

      {selectedListing ? (
        <p className="text-xs text-slate-500">
          Selected listing snapshot: {selectedListing.id} ({selectedListing.title || "untitled"})
        </p>
      ) : null}
    </main>
  );
}

