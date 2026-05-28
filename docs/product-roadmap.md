# Product Roadmap

## Recently Added

- Admin operational analytics:
  - Moderation SLA.
  - Top listing performance.
  - User activity analytics.
- Public market insights:
  - Active cities.
  - Active categories.
  - Average prices by category.
- Saved searches:
  - Save filtered listing searches.
  - Reopen/delete from account dashboard.
- Price insights:
  - Comparable price guidance during listing creation.

## Highest Value Next Steps

1. City relation migration
   - Add `Listing.cityId`.
   - Backfill from `locationCity`.
   - Dual-write during transition.
   - Add FK after data is clean.

2. Moderation inbox upgrade
   - Open listing details in an admin drawer.
   - Show images, owner, city/category, and history.
   - Replace prompts with proper modals.

3. User trust layer
   - Phone verification.
   - ID verification.
   - Seller rating and completed sales.
   - Trust badges on listing cards and profiles.

4. Analytics filters and exports
   - Date range.
   - City.
   - Category.
   - Status.
   - CSV/export support for admin reports.

5. Auth sync operations
   - Add Firebase Admin credentials in production.
   - Show Firebase user count.
   - Optional tool to compare DB-only and Firebase-only users.

6. Listing quality improvements
   - Draft autosave.
   - Better image ordering.
   - Duplicate listing detection.
   - Renewal/expiry reminders.
   - Stronger pre-submit quality score.

7. Buyer/seller communication
   - Message read states.
   - Seller response rate.
   - Conversation safety warnings.

## Product Principle

Keep the first screen useful. Users should search, browse, post, or manage immediately without marketing-page friction.
