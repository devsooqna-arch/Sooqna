# Phase 10 - Growth & Monetization Features

## Scope

Phase 10 adds incremental growth and monetization foundations on top of the stable Sooqna marketplace. It does not add real payments, checkout, card storage, broad redesigns, authentication changes, or schema migrations.

## Implemented MVP

- Similar listings on listing detail pages, based on the current listing category and city.
- Recently viewed listings using browser localStorage only.
- Public batch listing lookup is restricted to published, active listings.
- Seller listing performance summary in `My Listings` using existing listing fields.
- Featured listing status is displayed to owners, but owner self-feature actions are removed.
- Admin feature/unfeature controls remain protected by backend admin routes.
- Packages page explains future monetization options without fake payment functionality.

## Featured Listing Behavior

- `isFeatured` is stored on `Listing`.
- Public listing queries sort featured listings above regular listings.
- Listing cards, listing details, homepage, admin dashboard, and owner dashboard display featured status.
- Normal sellers cannot set `isFeatured` through arbitrary payloads.
- Feature/unfeature actions must go through explicit backend actions protected by admin authorization.
- Admin feature/unfeature actions are audit logged.

## Similar Listings Logic

The listing detail page requests public listings with:

- same `categoryId`
- same `location.city`
- `status === "published"`
- current listing excluded
- maximum of 6 cards displayed

The feature uses existing public listing filters and does not expose private seller data.

## Recently Viewed Logic

Recently viewed listings are stored under:

`sooqna_recently_viewed_listings_v1`

Rules:

- localStorage only
- no login required
- stores listing IDs only
- maximum 12 IDs
- newest item first
- duplicate IDs are moved to the front
- homepage fetches public listing data through `/listings/batch`
- backend filters batch results to published active listings

## Owner Performance Summary

The owner dashboard displays existing safe listing fields:

- `viewsCount`
- `favoritesCount`
- `messagesCount`
- `status`
- `publishedAt`
- `expiresAt`
- `isFeatured`

These are shown only inside the authenticated owner dashboard. No raw engagement events are exposed.

## Packages Page Status

The packages page describes:

- Free Listing
- Featured Listing
- Boosted Listing
- Business Seller Package

Payment is not active. CTAs route users to contact or free listing creation. The page does not collect payment data and does not present a fake checkout.

## Payment Provider Planning

Real payments require a separate approved phase. Before implementation, choose a provider and define:

- payment gateway for Jordan/local markets
- PayPal availability if desired
- manual bank transfer process if business needs it
- webhook verification
- order/payment/receipt/invoice models
- package/plan model
- refund and cancellation rules
- admin reconciliation workflow
- audit logging for payment state changes
- no card data storage on Sooqna servers

Possible Jordan-focused options to evaluate include local bank transfer, CliQ/manual reconciliation, and regional payment gateway providers that support JOD/SYP business requirements. Provider choice must happen before adding env vars or payment code.

## Future Roadmap

Priority 2:

- Boost listing model and admin controls
- Package entitlement model
- Admin growth metrics summary
- Owner-only aggregated analytics endpoint

Priority 3:

- Paid featured listings
- Boost-to-top campaigns
- Seller/business accounts
- Shop/store pages
- Subscription packages
- Payment gateway, invoices, receipts

Priority 4:

- Saved searches
- Price drop alerts
- New listing alerts
- Notifications
- AI listing helper
- AI moderation helper
- Email or WhatsApp campaign hooks

## Remaining Risks

- `messagesCount` depends on existing message counter behavior; if it is not synced elsewhere, the UI will show the stored value.
- Similar listings depend on category/city quality.
- Recently viewed is per browser/device and clears with localStorage.
- Payment planning remains conceptual until a provider and business process are selected.
