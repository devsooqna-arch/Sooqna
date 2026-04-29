import * as dotenv from "dotenv";
dotenv.config();

import * as path from "node:path";
import * as fs from "node:fs";
import { parseIso } from "../src/shared/utils/dates";
import { prisma } from "../src/config/prisma";
import type { UserProfile } from "../src/modules/users/users.types";
import type { Listing } from "../src/modules/listings/listings.types";
import type { FavoriteRecord } from "../src/modules/favorites/favorites.types";
import type { Conversation, Message } from "../src/modules/messages/messages.types";
import type { ModerationReport } from "../src/modules/reports/reports.types";
import type { AuditLogEntry } from "../src/modules/audit/audit.types";

function readJsonFile<T>(relativePath: string): T[] {
  const filePath = path.resolve(process.cwd(), relativePath);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf8");
  if (!raw.trim()) return [];
  return JSON.parse(raw) as T[];
}

async function migrateUsers(users: UserProfile[]): Promise<void> {
  for (const user of users) {
    const role = user.role === "ADMIN" || user.role === "BUYER" || user.role === "SELLER" ? user.role : "BUYER";
    await prisma.user.upsert({
      where: { firebaseUid: user.uid },
      update: {
        email: user.email,
        name: user.fullName,
        avatarUrl: user.photoURL,
        role,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        updatedAt: new Date(user.updatedAt),
      },
      create: {
        id: user.uid,
        firebaseUid: user.uid,
        email: user.email,
        name: user.fullName,
        avatarUrl: user.photoURL,
        role,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }
}

async function migrateReports(reports: ModerationReport[]): Promise<void> {
  for (const report of reports) {
    await prisma.report.upsert({
      where: { id: report.id },
      update: {
        targetType: report.targetType,
        targetId: report.targetId,
        reasonCode: report.reasonCode,
        details: report.details,
        reporterId: report.reporterId,
        status: report.status,
        moderatorId: report.moderatorId,
        moderatorNote: report.moderatorNote,
        createdAt: new Date(report.createdAt),
        updatedAt: new Date(report.updatedAt),
      },
      create: {
        id: report.id,
        targetType: report.targetType,
        targetId: report.targetId,
        reasonCode: report.reasonCode,
        details: report.details,
        reporterId: report.reporterId,
        status: report.status,
        moderatorId: report.moderatorId,
        moderatorNote: report.moderatorNote,
        createdAt: new Date(report.createdAt),
        updatedAt: new Date(report.updatedAt),
      },
    });
  }
}

async function migrateAuditLogs(entries: AuditLogEntry[]): Promise<void> {
  for (const entry of entries) {
    await prisma.auditLog.upsert({
      where: { id: entry.id },
      update: {
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: entry.metadata,
        createdAt: new Date(entry.createdAt),
      },
      create: {
        id: entry.id,
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        metadata: entry.metadata,
        createdAt: new Date(entry.createdAt),
      },
    });
  }
}

async function migrateListings(listings: Listing[]): Promise<void> {
  for (const listing of listings) {
    await prisma.listing.upsert({
      where: { id: listing.id },
      update: {
        title: listing.title,
        titleLower: listing.titleLower,
        description: listing.description,
        price: listing.price,
        currency: listing.currency,
        priceType: listing.priceType,
        categoryId: listing.categoryId,
        ownerId: listing.ownerId,
        ownerSnapshotName: listing.ownerSnapshot.fullName,
        ownerSnapshotPhotoUrl: listing.ownerSnapshot.photoURL,
        locationCountry: listing.location.country,
        locationCity: listing.location.city,
        locationArea: listing.location.area,
        status: listing.status,
        condition: listing.condition,
        contactPreference: listing.contactPreference,
        viewsCount: listing.viewsCount,
        favoritesCount: listing.favoritesCount,
        messagesCount: listing.messagesCount,
        isFeatured: listing.isFeatured,
        isApproved: listing.isApproved,
        publishedAt: parseIso(listing.publishedAt),
        expiresAt: parseIso(listing.expiresAt),
        createdAt: new Date(listing.createdAt),
        updatedAt: new Date(listing.updatedAt),
        deletedAt: parseIso(listing.deletedAt),
      },
      create: {
        id: listing.id,
        title: listing.title,
        titleLower: listing.titleLower,
        description: listing.description,
        price: listing.price,
        currency: listing.currency,
        priceType: listing.priceType,
        categoryId: listing.categoryId,
        ownerId: listing.ownerId,
        ownerSnapshotName: listing.ownerSnapshot.fullName,
        ownerSnapshotPhotoUrl: listing.ownerSnapshot.photoURL,
        locationCountry: listing.location.country,
        locationCity: listing.location.city,
        locationArea: listing.location.area,
        status: listing.status,
        condition: listing.condition,
        contactPreference: listing.contactPreference,
        viewsCount: listing.viewsCount,
        favoritesCount: listing.favoritesCount,
        messagesCount: listing.messagesCount,
        isFeatured: listing.isFeatured,
        isApproved: listing.isApproved,
        publishedAt: parseIso(listing.publishedAt),
        expiresAt: parseIso(listing.expiresAt),
        createdAt: new Date(listing.createdAt),
        updatedAt: new Date(listing.updatedAt),
        deletedAt: parseIso(listing.deletedAt),
      },
    });

    await prisma.listingImage.deleteMany({ where: { listingId: listing.id } });
    if (listing.images.length) {
      await prisma.listingImage.createMany({
        data: listing.images.map((image) => ({
          listingId: listing.id,
          url: image.url,
          path: image.path,
          isPrimary: image.isPrimary,
          order: image.order,
        })),
      });
    }
  }
}

async function migrateFavorites(favorites: FavoriteRecord[]): Promise<void> {
  for (const favorite of favorites) {
    await prisma.favorite.upsert({
      where: {
        userId_listingId: {
          userId: favorite.userId,
          listingId: favorite.listingId ?? null,
        },
      },
      update: {
        createdAt: new Date(favorite.createdAt),
      },
      create: {
        userId: favorite.userId,
        listingId: favorite.listingId,
        createdAt: new Date(favorite.createdAt),
      },
    });
  }
}

async function migrateConversationsAndMessages(
  conversations: Conversation[],
  messages: Message[]
): Promise<void> {
  for (const conversation of conversations) {
    await prisma.conversation.upsert({
      where: { id: conversation.id },
      update: {
        listingId: conversation.listingId,
        listingSnapshotTitle: conversation.listingSnapshot.title,
        listingSnapshotPrimaryImageURL: conversation.listingSnapshot.primaryImageURL,
        createdBy: conversation.createdBy,
        lastMessageText: conversation.lastMessageText,
        lastMessageSenderId: conversation.lastMessageSenderId,
        lastMessageAt: parseIso(conversation.lastMessageAt),
        lastMessageType: conversation.lastMessageType,
        isActive: conversation.isActive,
        createdAt: new Date(conversation.createdAt),
        updatedAt: new Date(conversation.updatedAt),
      },
      create: {
        id: conversation.id,
        listingId: conversation.listingId,
        listingSnapshotTitle: conversation.listingSnapshot.title,
        listingSnapshotPrimaryImageURL: conversation.listingSnapshot.primaryImageURL,
        createdBy: conversation.createdBy,
        lastMessageText: conversation.lastMessageText,
        lastMessageSenderId: conversation.lastMessageSenderId,
        lastMessageAt: parseIso(conversation.lastMessageAt),
        lastMessageType: conversation.lastMessageType,
        isActive: conversation.isActive,
        createdAt: new Date(conversation.createdAt),
        updatedAt: new Date(conversation.updatedAt),
      },
    });

    await prisma.conversationParticipant.deleteMany({
      where: { conversationId: conversation.id },
    });

    await prisma.conversationParticipant.createMany({
      data: conversation.participantIds.map((participantId) => ({
        conversationId: conversation.id,
        userId: participantId,
        fullName: conversation.participants[participantId]?.fullName ?? "",
        photoURL: conversation.participants[participantId]?.photoURL ?? "",
      })),
      skipDuplicates: true,
    });
  }

  for (const message of messages) {
    await prisma.message.upsert({
      where: { id: message.id },
      update: {
        conversationId: message.conversationId,
        senderId: message.senderId,
        type: message.type,
        text: message.text,
        attachments: message.attachments,
        isRead: message.isRead,
        readAt: parseIso(message.readAt),
        createdAt: new Date(message.createdAt),
        deletedAt: parseIso(message.deletedAt),
      },
      create: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        type: message.type,
        text: message.text,
        attachments: message.attachments,
        isRead: message.isRead,
        readAt: parseIso(message.readAt),
        createdAt: new Date(message.createdAt),
        deletedAt: parseIso(message.deletedAt),
      },
    });
  }
}

async function migrateCategories(
  categories: Array<{
    id: string;
    name: { ar: string; en: string };
    slug: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string | null;
    updatedAt?: string | null;
  }>
): Promise<void> {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        nameAr: category.name.ar,
        nameEn: category.name.en,
        slug: category.slug,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        createdAt: parseIso(category.createdAt),
        updatedAt: parseIso(category.updatedAt ?? null),
      },
      create: {
        id: category.id,
        nameAr: category.name.ar,
        nameEn: category.name.en,
        slug: category.slug,
        isActive: category.isActive,
        sortOrder: category.sortOrder,
        createdAt: parseIso(category.createdAt),
        updatedAt: parseIso(category.updatedAt ?? null),
      },
    });
  }
}

async function main(): Promise<void> {
  const users = readJsonFile<UserProfile>("src/modules/users/repositories/users.data.json");
  const listings = readJsonFile<Listing>("src/modules/listings/repositories/listings.data.json");
  const favorites = readJsonFile<FavoriteRecord>(
    "src/modules/favorites/repositories/favorites.data.json"
  );
  const conversations = readJsonFile<Conversation>(
    "src/modules/messages/repositories/conversations.data.json"
  );
  const messages = readJsonFile<Message>("src/modules/messages/repositories/messages.data.json");
  const categories = readJsonFile<{
    id: string;
    name: { ar: string; en: string };
    slug: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string | null;
  }>("src/modules/categories/repositories/categories.data.json");
  const reports = readJsonFile<ModerationReport>("src/modules/reports/reports.data.json");
  const auditLogs = readJsonFile<AuditLogEntry>("src/modules/audit/audit.data.json");

  await migrateUsers(users);
  await migrateListings(listings);
  await migrateFavorites(favorites);
  await migrateConversationsAndMessages(conversations, messages);
  await migrateCategories(categories);
  await migrateReports(reports);
  await migrateAuditLogs(auditLogs);

  console.log("JSON data migrated to PostgreSQL successfully.");
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

