# WordPress Redirect Mapping

This document tracks legacy WordPress URLs that should redirect to the new Next.js app.

## Source of Truth

- Redirect data is defined in `apps/web/wp-redirects.json`.
- Validation/loading logic lives in `apps/web/wp-redirects.mjs`.
- `apps/web/next.config.mjs` imports validated rules and applies them at build time.

## Update Workflow

1. Collect old URLs from analytics, server logs, SEO tools, or QA reports.
2. Add exact path matches in the `exact` array inside `apps/web/wp-redirects.json`.
3. Add or update wildcard rules in the `patterns` array only when exact mapping is not possible.
4. Run web checks:
   - `npm run lint`
   - `npm run validate:redirects`
   - `npm run build`
5. Deploy and verify:
   - Check `robots.txt` and `sitemap.xml`
   - Verify legacy URL responses (301/302 as configured)

## Current Known Legacy Paths

- `/my-account/login/` -> `/login`
- `/my-account/register/` -> `/register`
- `/my-account/lost-password/` -> `/reset-password`
- `/my-account/` -> `/me`
- `/add-listing/` -> `/submit-listing`
- `/listing/كاميرا-سوني-a7-iv-مع-عدسة-50mm/` -> `/listings`
