"use client";

import { useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "@/hooks/useAuth";
import { getAuthErrorMessage } from "@/services/authService";
import { apiFetch } from "@/services/apiClient";
import { getCategories } from "@/services/categoryService";
import {
  attachListingImage,
  createListing,
  deleteListing,
  getListingById,
  getListings,
  updateListing,
} from "@/services/listingService";
import { uploadBackendListingImage } from "@/services/backendUploadService";
import {
  addToFavorites,
  getUserFavoriteListingIds,
  removeFromFavorites,
} from "@/services/favoriteService";
import {
  createConversation,
  createMessage,
  getConversationById,
  getConversationMessages,
} from "@/services/messageService";
import type { Category } from "@/types/category";
import type { Listing } from "@/types/listing";
import type { Message } from "@/types/message";

type JsonValue = Record<string, unknown> | unknown[] | string | number | boolean | null;

function pickAuthUserFields(user: User) {
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    emailVerified: user.emailVerified,
    photoURL: user.photoURL,
  };
}

function JsonPanel({ data }: { data: JsonValue | null }) {
  if (data === null) {
    return <p className="text-sm text-slate-500">No data yet.</p>;
  }
  return (
    <pre className="max-h-80 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export function DevToolsPanel() {
  const { currentUser, loading: authLoading, login, loginWithGoogle, logout } = useAuth();

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const [userResult, setUserResult] = useState<JsonValue | null>(null);
  const [categoriesResult, setCategoriesResult] = useState<Category[] | null>(null);
  const [listingsResult, setListingsResult] = useState<Listing[] | null>(null);
  const [favoritesResult, setFavoritesResult] = useState<string[] | null>(null);
  const [conversationResult, setConversationResult] = useState<JsonValue | null>(null);
  const [messagesResult, setMessagesResult] = useState<Message[] | null>(null);

  const [createTitle, setCreateTitle] = useState("");
  const [createPrice, setCreatePrice] = useState("0");
  const [createCategoryId, setCreateCategoryId] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [listingIdInput, setListingIdInput] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");
  const [favoriteListingId, setFavoriteListingId] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<{ url: string; path: string } | null>(null);
  const [attachListingId, setAttachListingId] = useState("");

  const [conversationIdInput, setConversationIdInput] = useState("");
  const [conversationListingId, setConversationListingId] = useState("");
  const [conversationParticipantId, setConversationParticipantId] = useState("");
  const [messageText, setMessageText] = useState("");

  const authUserDisplay = useMemo(
    () => (currentUser ? pickAuthUserFields(currentUser) : null),
    [currentUser]
  );

  async function runAction<T>(key: string, action: () => Promise<T>, onSuccess?: (result: T) => void) {
    setBusyKey(key);
    setStatus(null);
    setError(null);
    try {
      const result = await action();
      onSuccess?.(result);
      setStatus(`${key} succeeded.`);
    } catch (e) {
      if (key === "login" || key === "googleLogin") {
        setError(getAuthErrorMessage(e));
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Dev Tools - Full Backend Flow</h1>
        <p className="mt-1 text-sm text-slate-600">
          Development-only page to verify auth and all backend domains end-to-end.
        </p>
        <div className="mt-2 flex gap-4 text-xs text-slate-500">
          <span>Route: /dev-tools</span>
          <a className="underline" href="/">Back to home</a>
        </div>
      </header>

      {status && <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{status}</div>}
      {error && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Auth">
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Auth state: {authLoading ? "loading..." : currentUser ? "authenticated" : "signed out"}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="rounded border border-slate-300 px-2 py-2 text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="rounded border border-slate-300 px-2 py-2 text-sm"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded bg-slate-900 px-3 py-2 text-xs text-white disabled:opacity-50"
                disabled={busyKey !== null}
                onClick={() =>
                  void runAction("login", async () => login(email, password))
                }
              >
                Login
              </button>
              <button
                className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
                disabled={busyKey !== null}
                onClick={() => void runAction("googleLogin", async () => loginWithGoogle())}
              >
                Login with Google
              </button>
              <button
                className="rounded border border-red-300 px-3 py-2 text-xs text-red-700 disabled:opacity-50"
                disabled={busyKey !== null}
                onClick={() => void runAction("logout", async () => logout())}
              >
                Logout
              </button>
              <button
                className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
                disabled={!currentUser || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "getIdToken",
                    async () => currentUser!.getIdToken(),
                    (idToken) => setToken(idToken)
                  )
                }
              >
                Get ID Token
              </button>
            </div>
            <JsonPanel data={authUserDisplay} />
            <JsonPanel data={token ? { tokenPreview: `${token.slice(0, 30)}...` } : null} />
          </div>
        </Section>

        <Section title="User / Profile">
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
              disabled={!currentUser || busyKey !== null}
              onClick={() =>
                void runAction(
                  "syncUserProfile",
                  async () =>
                    apiFetch("/users/profile", {
                      method: "POST",
                      authenticated: true,
                      body: JSON.stringify({}),
                    }),
                  (result) => setUserResult(result as JsonValue)
                )
              }
            >
              Sync/Create profile
            </button>
            <button
              className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
              disabled={!currentUser || busyKey !== null}
              onClick={() =>
                void runAction(
                  "getUsersMe",
                  async () => apiFetch("/users/me", { authenticated: true }),
                  (result) => setUserResult(result as JsonValue)
                )
              }
            >
              Fetch /users/me
            </button>
          </div>
          <div className="mt-3">
            <JsonPanel data={userResult} />
          </div>
        </Section>

        <Section title="Categories">
          <button
            className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
            disabled={busyKey !== null}
            onClick={() =>
              void runAction("getCategories", async () => getCategories(), (result) =>
                setCategoriesResult(result)
              )
            }
          >
            Fetch categories
          </button>
          <div className="mt-3">
            <JsonPanel data={categoriesResult} />
          </div>
        </Section>

        <Section title="Listings">
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="rounded border border-slate-300 px-2 py-2 text-sm"
                placeholder="Title"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
              />
              <input
                className="rounded border border-slate-300 px-2 py-2 text-sm"
                placeholder="Price"
                type="number"
                value={createPrice}
                onChange={(e) => setCreatePrice(e.target.value)}
              />
              <input
                className="rounded border border-slate-300 px-2 py-2 text-sm sm:col-span-2"
                placeholder="Category ID"
                value={createCategoryId}
                onChange={(e) => setCreateCategoryId(e.target.value)}
              />
              <input
                className="rounded border border-slate-300 px-2 py-2 text-sm sm:col-span-2"
                placeholder="Description (optional)"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded bg-slate-900 px-3 py-2 text-xs text-white disabled:opacity-50"
                disabled={!currentUser || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "createListing",
                    async () =>
                      createListing({
                        title: createTitle,
                        price: Number(createPrice),
                        categoryId: createCategoryId,
                      }),
                    async () => {
                      const list = await getListings();
                      setListingsResult(list);
                    }
                  )
                }
              >
                Create listing
              </button>
              <button
                className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
                disabled={busyKey !== null}
                onClick={() =>
                  void runAction("listListings", async () => getListings(), (result) =>
                    setListingsResult(result)
                  )
                }
              >
                Fetch listings
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className="rounded border border-slate-300 px-2 py-2 text-sm"
                placeholder="Listing ID"
                value={listingIdInput}
                onChange={(e) => setListingIdInput(e.target.value)}
              />
              <input
                className="rounded border border-slate-300 px-2 py-2 text-sm"
                placeholder="New title"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
              />
              <input
                className="rounded border border-slate-300 px-2 py-2 text-sm"
                placeholder="New price"
                type="number"
                value={updatePrice}
                onChange={(e) => setUpdatePrice(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
                disabled={!currentUser || !listingIdInput || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "updateListing",
                    async () =>
                      updateListing(listingIdInput, {
                        title: updateTitle || undefined,
                        price: updatePrice ? Number(updatePrice) : undefined,
                      }),
                    async () => {
                      const list = await getListings();
                      setListingsResult(list);
                    }
                  )
                }
              >
                Update listing
              </button>
              <button
                className="rounded border border-red-300 px-3 py-2 text-xs text-red-700 disabled:opacity-50"
                disabled={!currentUser || !listingIdInput || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "deleteListing",
                    async () => deleteListing(listingIdInput),
                    async () => {
                      const list = await getListings();
                      setListingsResult(list);
                    }
                  )
                }
              >
                Delete listing
              </button>
              <button
                className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
                disabled={!listingIdInput || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "getListingById",
                    async () => getListingById(listingIdInput),
                    (result) => setListingsResult(result ? [result] : [])
                  )
                }
              >
                Fetch one listing
              </button>
            </div>
          </div>
          <div className="mt-3">
            <JsonPanel data={listingsResult} />
          </div>
        </Section>

        <Section title="Upload / Attach Image">
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="block text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
                disabled={!currentUser || !selectedFile || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "uploadImage",
                    async () => uploadBackendListingImage(selectedFile!),
                    (result) => setUploadedImage({ url: result.url, path: result.path })
                  )
                }
              >
                Upload image
              </button>
            </div>
            <input
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
              placeholder="Listing ID to attach image"
              value={attachListingId}
              onChange={(e) => setAttachListingId(e.target.value)}
            />
            <button
              className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
              disabled={!currentUser || !uploadedImage || !attachListingId || busyKey !== null}
              onClick={() =>
                void runAction(
                  "attachListingImage",
                  async () => {
                    if (!uploadedImage) {
                      throw new Error("Upload an image first.");
                    }
                    return attachListingImage(attachListingId, uploadedImage);
                  },
                  async () => {
                    const list = await getListings();
                    setListingsResult(list);
                  }
                )
              }
            >
              Attach uploaded image to listing
            </button>
            {uploadedImage?.url ? (
              <img
                src={uploadedImage.url}
                alt="Uploaded preview"
                className="h-32 w-32 rounded border border-slate-300 object-cover"
              />
            ) : null}
            <JsonPanel data={uploadedImage} />
          </div>
        </Section>

        <Section title="Favorites">
          <div className="space-y-3">
            <input
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
              placeholder="Listing ID"
              value={favoriteListingId}
              onChange={(e) => setFavoriteListingId(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
                disabled={!currentUser || !favoriteListingId || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "addFavorite",
                    async () => addToFavorites(currentUser!.uid, favoriteListingId)
                  )
                }
              >
                Add favorite
              </button>
              <button
                className="rounded border border-red-300 px-3 py-2 text-xs text-red-700 disabled:opacity-50"
                disabled={!currentUser || !favoriteListingId || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "removeFavorite",
                    async () => removeFromFavorites(currentUser!.uid, favoriteListingId)
                  )
                }
              >
                Remove favorite
              </button>
              <button
                className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
                disabled={!currentUser || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "getFavorites",
                    async () => getUserFavoriteListingIds(currentUser!.uid),
                    (result) => setFavoritesResult(result)
                  )
                }
              >
                Fetch my favorites
              </button>
            </div>
            <JsonPanel data={favoritesResult} />
          </div>
        </Section>

        <Section title="Messages / Conversations">
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                className="rounded border border-slate-300 px-2 py-2 text-sm"
                placeholder="Listing ID"
                value={conversationListingId}
                onChange={(e) => setConversationListingId(e.target.value)}
              />
              <input
                className="rounded border border-slate-300 px-2 py-2 text-sm"
                placeholder="Other participant UID (optional)"
                value={conversationParticipantId}
                onChange={(e) => setConversationParticipantId(e.target.value)}
              />
            </div>
            <button
              className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
              disabled={!currentUser || !conversationListingId || busyKey !== null}
              onClick={() =>
                void runAction(
                  "createConversation",
                  async () => {
                    const participants = [currentUser!.uid];
                    if (conversationParticipantId && conversationParticipantId !== currentUser!.uid) {
                      participants.push(conversationParticipantId);
                    }
                    const participantsMap: Record<string, { fullName: string; photoURL: string }> = {
                      [currentUser!.uid]: {
                        fullName: currentUser!.displayName ?? "",
                        photoURL: currentUser!.photoURL ?? "",
                      },
                    };
                    if (conversationParticipantId && conversationParticipantId !== currentUser!.uid) {
                      participantsMap[conversationParticipantId] = {
                        fullName: "",
                        photoURL: "",
                      };
                    }
                    return createConversation({
                      participantIds: participants,
                      participants: participantsMap,
                      listingId: conversationListingId,
                      listingSnapshot: { title: "Dev Tools Listing", primaryImageURL: "" },
                      createdBy: currentUser!.uid,
                    });
                  },
                  (result) => {
                    setConversationIdInput(result.conversationId);
                    setConversationResult(result as JsonValue);
                  }
                )
              }
            >
              Create conversation
            </button>

            <input
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
              placeholder="Conversation ID"
              value={conversationIdInput}
              onChange={(e) => setConversationIdInput(e.target.value)}
            />
            <input
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
              placeholder="Message text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              <button
                className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
                disabled={!currentUser || !conversationIdInput || !messageText || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "sendMessage",
                    async () =>
                      createMessage(conversationIdInput, {
                        senderId: currentUser!.uid,
                        type: "text",
                        text: messageText,
                      })
                  )
                }
              >
                Send message
              </button>
              <button
                className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
                disabled={!conversationIdInput || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "getConversation",
                    async () => getConversationById(conversationIdInput),
                    (result) => setConversationResult(result as JsonValue)
                  )
                }
              >
                Fetch conversation
              </button>
              <button
                className="rounded border border-slate-300 px-3 py-2 text-xs disabled:opacity-50"
                disabled={!conversationIdInput || busyKey !== null}
                onClick={() =>
                  void runAction(
                    "getMessages",
                    async () => getConversationMessages(conversationIdInput),
                    (result) => setMessagesResult(result)
                  )
                }
              >
                Fetch messages
              </button>
            </div>
            <JsonPanel data={conversationResult} />
            <JsonPanel data={messagesResult} />
          </div>
        </Section>
      </div>
    </div>
  );
}
