import { z } from "zod";

const idParamSchema = z.object({
  id: z.string().min(1),
});

const listingIdParamSchema = z.object({
  listingId: z.string().min(1),
});

const conversationIdParamSchema = z.object({
  conversationId: z.string().min(1),
});

export const userProfileBodySchema = z
  .object({
    fullName: z.string().trim().min(1).max(120).optional(),
    photoURL: z.string().trim().url().max(2048).optional(),
  })
  .strict();

const listingLocationSchema = z.object({
  country: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(120),
  area: z.string().trim().min(1).max(120),
});

export const createListingBodySchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    price: z.number().finite().nonnegative(),
    categoryId: z.string().trim().min(1).max(120),
    description: z.string().trim().max(10000).optional(),
    location: listingLocationSchema,
  })
  .strict();

export const patchListingBodySchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().max(10000).optional(),
    price: z.number().finite().nonnegative().optional(),
    status: z.enum(["draft", "pending", "published", "rejected", "sold", "archived"]).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for patch.",
  });

export const attachListingImageBodySchema = z
  .object({
    url: z.string().trim().url().max(2048),
    path: z.string().trim().min(1).max(2048),
  })
  .strict();

export const createConversationBodySchema = z
  .object({
    participantIds: z.array(z.string().trim().min(1)).min(1).optional(),
    participants: z.record(
      z.string(),
      z.object({
        fullName: z.string().trim().max(120).optional(),
        photoURL: z.string().trim().url().max(2048).optional(),
      })
    ).optional(),
    listingId: z.string().trim().min(1),
    listingSnapshot: z.object({
      title: z.string().trim().min(1).max(200),
      primaryImageURL: z.string().trim().url().max(2048).optional().default(""),
    }),
  })
  .strict();

export const createMessageBodySchema = z
  .object({
    type: z.enum(["text", "image", "system"]).default("text"),
    text: z.string().trim().max(4000).optional().default(""),
    attachments: z.array(z.unknown()).optional().default([]),
  })
  .strict()
  .refine((value) => value.type !== "text" || value.text.length > 0, {
    message: "text is required when type is text",
    path: ["text"],
  });

export const categoriesQuerySchema = z
  .object({
    activeOnly: z.enum(["true", "false", "1", "0"]).optional(),
  })
  .strict();

export const idParamsSchema = idParamSchema;
export const listingIdParamsSchema = listingIdParamSchema;
export const conversationIdParamsSchema = conversationIdParamSchema;
