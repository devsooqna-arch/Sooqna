import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env";

const apiPaths: Record<string, Record<string, unknown>> = {
  "/health": { get: { tags: ["System"], summary: "Health check" } },
  "/dev/seed-summary": { get: { tags: ["System"], summary: "Development seed summary" } },
  "/auth/session": { get: { tags: ["Auth"], summary: "Current authenticated session", security: [{ bearerAuth: [] }] } },
  "/auth/resend-verification": { post: { tags: ["Auth"], summary: "Check verification resend policy", security: [{ bearerAuth: [] }] } },
  "/auth/recaptcha/verify": { post: { tags: ["Auth"], summary: "Verify reCAPTCHA token" } },
  "/uploads/listing-image": { post: { tags: ["Uploads"], summary: "Upload listing image", security: [{ bearerAuth: [] }] } },
  "/uploads/profile-avatar": { post: { tags: ["Uploads"], summary: "Upload profile avatar", security: [{ bearerAuth: [] }] } },
  "/users/profile": {
    post: { tags: ["Users"], summary: "Create or update profile", security: [{ bearerAuth: [] }] },
    put: { tags: ["Users"], summary: "Replace profile fields", security: [{ bearerAuth: [] }] },
    patch: { tags: ["Users"], summary: "Patch profile fields", security: [{ bearerAuth: [] }] },
    get: { tags: ["Users"], summary: "Get authenticated profile", security: [{ bearerAuth: [] }] },
  },
  "/users/me": { get: { tags: ["Users"], summary: "Get/create current profile", security: [{ bearerAuth: [] }] } },
  "/listings": {
    get: { tags: ["Listings"], summary: "List listings" },
    post: { tags: ["Listings"], summary: "Create listing", security: [{ bearerAuth: [] }] },
  },
  "/listings/mine": { get: { tags: ["Listings"], summary: "List current user listings", security: [{ bearerAuth: [] }] } },
  "/listings/{id}": {
    get: { tags: ["Listings"], summary: "Get listing by id" },
    patch: { tags: ["Listings"], summary: "Update listing", security: [{ bearerAuth: [] }] },
    delete: { tags: ["Listings"], summary: "Delete listing", security: [{ bearerAuth: [] }] },
  },
  "/listings/{id}/publish": { post: { tags: ["Listings"], summary: "Publish listing", security: [{ bearerAuth: [] }] } },
  "/listings/{id}/unpublish": { post: { tags: ["Listings"], summary: "Unpublish listing", security: [{ bearerAuth: [] }] } },
  "/listings/{id}/renew": { post: { tags: ["Listings"], summary: "Renew listing", security: [{ bearerAuth: [] }] } },
  "/listings/{id}/expire": { post: { tags: ["Listings"], summary: "Expire listing", security: [{ bearerAuth: [] }] } },
  "/listings/{id}/images": { post: { tags: ["Listings"], summary: "Attach listing image", security: [{ bearerAuth: [] }] } },
  "/favorites": { get: { tags: ["Favorites"], summary: "List favorites", security: [{ bearerAuth: [] }] } },
  "/favorites/{listingId}": {
    post: { tags: ["Favorites"], summary: "Add favorite", security: [{ bearerAuth: [] }] },
    delete: { tags: ["Favorites"], summary: "Remove favorite", security: [{ bearerAuth: [] }] },
  },
  "/messages/conversations": {
    get: { tags: ["Messages"], summary: "List conversations", security: [{ bearerAuth: [] }] },
    post: { tags: ["Messages"], summary: "Create conversation", security: [{ bearerAuth: [] }] },
  },
  "/messages/conversations/unread-summary": { get: { tags: ["Messages"], summary: "Unread summary", security: [{ bearerAuth: [] }] } },
  "/messages/conversations/{conversationId}": { get: { tags: ["Messages"], summary: "Get conversation", security: [{ bearerAuth: [] }] } },
  "/messages/conversations/{conversationId}/messages": {
    get: { tags: ["Messages"], summary: "List conversation messages", security: [{ bearerAuth: [] }] },
    post: { tags: ["Messages"], summary: "Send message", security: [{ bearerAuth: [] }] },
  },
  "/messages/conversations/{conversationId}/read": { post: { tags: ["Messages"], summary: "Mark conversation read", security: [{ bearerAuth: [] }] } },
  "/categories": { get: { tags: ["Categories"], summary: "List categories" } },
  "/engagement/events": { post: { tags: ["Engagement"], summary: "Track engagement event", security: [{ bearerAuth: [] }] } },
  "/engagement/events/recent": { get: { tags: ["Engagement"], summary: "List recent engagement events", security: [{ bearerAuth: [] }] } },
  "/reports": { post: { tags: ["Reports"], summary: "Submit moderation report", security: [{ bearerAuth: [] }] } },
  "/reports/queue": { get: { tags: ["Reports"], summary: "Moderation queue (admin)", security: [{ bearerAuth: [] }] } },
  "/reports/{id}": { patch: { tags: ["Reports"], summary: "Update moderation report (admin)", security: [{ bearerAuth: [] }] } },
  "/audit/logs": { get: { tags: ["Audit"], summary: "List audit logs (admin)", security: [{ bearerAuth: [] }] } },
};

export const openApiSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Sooqna Backend API",
      version: "1.0.0",
      description: "Auto-generated API documentation for backend endpoints.",
    },
    servers: [{ url: `http://localhost:${env.port}/api` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    paths: apiPaths,
  },
  apis: [],
});
