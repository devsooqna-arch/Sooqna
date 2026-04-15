/**
 * Seeds end-to-end demo data for Milestone 1 flows.
 *
 * Usage (from backend/functions):
 *   npm run seed:demo
 */
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { ensureAdminApp, adminDb } from "../src/config/admin";
import { seedCategories } from "../src/modules/categories/seedCategoriesData";

ensureAdminApp();

type DemoUser = {
  uid: string;
  email: string;
  password: string;
  fullName: string;
  photoURL: string;
  city: string;
  country: string;
};

const demoUsers: DemoUser[] = [
  {
    uid: "demo-user-issa",
    email: "issa.demo@sooqna.dev",
    password: "Demo@123456",
    fullName: "Issa Demo",
    photoURL: "https://i.pravatar.cc/150?img=12",
    city: "Amman",
    country: "Jordan",
  },
  {
    uid: "demo-user-mohammad",
    email: "mohammad.demo@sooqna.dev",
    password: "Demo@123456",
    fullName: "Mohammad Demo",
    photoURL: "https://i.pravatar.cc/150?img=15",
    city: "Irbid",
    country: "Jordan",
  },
];

async function ensureAuthUser(user: DemoUser): Promise<void> {
  try {
    await admin.auth().getUser(user.uid);
    await admin.auth().updateUser(user.uid, {
      email: user.email,
      password: user.password,
      displayName: user.fullName,
      photoURL: user.photoURL,
      emailVerified: true,
      disabled: false,
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: string }).code)
        : "";
    if (code !== "auth/user-not-found") {
      throw error;
    }
    await admin.auth().createUser({
      uid: user.uid,
      email: user.email,
      password: user.password,
      displayName: user.fullName,
      photoURL: user.photoURL,
      emailVerified: true,
      disabled: false,
    });
  }
}

async function seedUsers(): Promise<string[]> {
  for (const user of demoUsers) {
    await ensureAuthUser(user);
    await adminDb.collection("users").doc(user.uid).set(
      {
        uid: user.uid,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: "+962700000000",
        photoURL: user.photoURL,
        bio: "Demo account for system-test dashboard.",
        city: user.city,
        country: user.country,
        preferredLanguage: "ar",
        role: "user",
        accountStatus: "active",
        isEmailVerified: true,
        isPhoneVerified: false,
        profileCompleted: true,
        listingsCount: 1,
        favoritesCount: 1,
        lastLoginAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
  return demoUsers.map((u) => u.uid);
}

async function seedListings(): Promise<string[]> {
  const listings = [
    {
      id: "demo-listing-car",
      title: "هونداي إلنترا 2018 بحالة ممتازة",
      price: 9200,
      categoryId: "cars",
      ownerId: "demo-user-issa",
      city: "Amman",
      area: "Marj Al Hamam",
      imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80",
    },
    {
      id: "demo-listing-apartment",
      title: "شقة للبيع 140م في عمان",
      price: 78000,
      categoryId: "real-estate",
      ownerId: "demo-user-mohammad",
      city: "Amman",
      area: "Khalda",
      imageUrl:
        "https://images.unsplash.com/photo-1494526585095-c41746248156?w=900&q=80",
    },
  ] as const;

  for (const listing of listings) {
    const owner = demoUsers.find((u) => u.uid === listing.ownerId);
    await adminDb.collection("listings").doc(listing.id).set(
      {
        title: listing.title,
        titleLower: listing.title.toLowerCase(),
        description: "إعلان تجريبي لاختبار النظام من البداية للنهاية.",
        price: listing.price,
        currency: "JOD",
        priceType: "fixed",
        categoryId: listing.categoryId,
        ownerId: listing.ownerId,
        ownerSnapshot: {
          fullName: owner?.fullName ?? "",
          photoURL: owner?.photoURL ?? "",
        },
        location: {
          country: "Jordan",
          city: listing.city,
          area: listing.area,
        },
        images: [
          {
            url: listing.imageUrl,
            path: `listings/${listing.ownerId}/seed-${listing.id}.jpg`,
            isPrimary: true,
            order: 1,
          },
        ],
        status: "published",
        condition: "used",
        contactPreference: "chat",
        viewsCount: 12,
        favoritesCount: 1,
        messagesCount: 1,
        reportsCount: 0,
        isFeatured: false,
        isApproved: true,
        publishedAt: FieldValue.serverTimestamp(),
        expiresAt: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        deletedAt: null,
      },
      { merge: true }
    );
  }

  return listings.map((l) => l.id);
}

async function seedFavorites(): Promise<void> {
  await adminDb
    .collection("users")
    .doc("demo-user-issa")
    .collection("favorites")
    .doc("demo-listing-apartment")
    .set(
      {
        listingId: "demo-listing-apartment",
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  await adminDb
    .collection("users")
    .doc("demo-user-mohammad")
    .collection("favorites")
    .doc("demo-listing-car")
    .set(
      {
        listingId: "demo-listing-car",
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

async function seedConversationsAndMessages(): Promise<string> {
  const conversationId = "demo-conv-car-1";
  const conversationRef = adminDb.collection("conversations").doc(conversationId);

  await conversationRef.set(
    {
      participantIds: ["demo-user-issa", "demo-user-mohammad"],
      participants: {
        "demo-user-issa": {
          fullName: "Issa Demo",
          photoURL: "https://i.pravatar.cc/150?img=12",
        },
        "demo-user-mohammad": {
          fullName: "Mohammad Demo",
          photoURL: "https://i.pravatar.cc/150?img=15",
        },
      },
      listingId: "demo-listing-car",
      listingSnapshot: {
        title: "هونداي إلنترا 2018 بحالة ممتازة",
        primaryImageURL:
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=80",
      },
      createdBy: "demo-user-mohammad",
      lastMessageText: "ممتاز، متى أقدر أشوف السيارة؟",
      lastMessageSenderId: "demo-user-mohammad",
      lastMessageAt: FieldValue.serverTimestamp(),
      lastMessageType: "text",
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await conversationRef.collection("messages").doc("demo-msg-1").set(
    {
      senderId: "demo-user-issa",
      type: "text",
      text: "مرحبا، السيارة لسا متاحة.",
      attachments: [],
      isRead: true,
      readAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      deletedAt: null,
    },
    { merge: true }
  );

  await conversationRef.collection("messages").doc("demo-msg-2").set(
    {
      senderId: "demo-user-mohammad",
      type: "text",
      text: "ممتاز، متى أقدر أشوف السيارة؟",
      attachments: [],
      isRead: false,
      readAt: null,
      createdAt: FieldValue.serverTimestamp(),
      deletedAt: null,
    },
    { merge: true }
  );

  return conversationId;
}

async function seedNotificationsAndReports(): Promise<void> {
  await adminDb
    .collection("users")
    .doc("demo-user-issa")
    .collection("notifications")
    .doc("demo-notification-1")
    .set(
      {
        type: "newMessage",
        title: "رسالة جديدة",
        body: "وصلتك رسالة جديدة على إعلان السيارة.",
        data: { conversationId: "demo-conv-car-1", listingId: "demo-listing-car" },
        isRead: false,
        readAt: null,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

  await adminDb.collection("reports").doc("demo-report-1").set(
    {
      targetType: "listing",
      targetId: "demo-listing-car",
      reportedBy: "demo-user-mohammad",
      reason: "duplicate",
      details: "بلاغ تجريبي لاختبار لوحة الأدمن لاحقاً.",
      status: "open",
      reviewedBy: null,
      reviewedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

async function main(): Promise<void> {
  const categoriesResult = await seedCategories();
  const userIds = await seedUsers();
  const listingIds = await seedListings();
  await seedFavorites();
  const conversationId = await seedConversationsAndMessages();
  await seedNotificationsAndReports();

  console.info("Demo seed completed.");
  console.info("Categories:", categoriesResult.categoryIds.join(", "));
  console.info("Users:", userIds.join(", "));
  console.info("Listings:", listingIds.join(", "));
  console.info("Conversation:", conversationId);
  console.info("Demo login credentials:");
  console.info("- issa.demo@sooqna.dev / Demo@123456");
  console.info("- mohammad.demo@sooqna.dev / Demo@123456");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

