# Sooqna Lightweight RTL Motion System

## Animation philosophy

Sooqna motion should make the marketplace feel fast, trustworthy, and easy to scan. Motion is used to confirm interaction, reveal newly loaded content, and make dropdowns, cards, forms, and loading states feel smoother without changing the core layout or brand.

Animations must stay subtle and functional. Avoid playful bounce, parallax, large travel distances, long delays, and anything that slows down buying, browsing, messaging, or posting an ad.

## Global timing rules

- Fast feedback: 120ms for taps, button presses, and small icon changes.
- Default UI transition: 180ms for hover, focus, chips, and inline controls.
- Panels and dropdowns: 240ms for open and 140ms for close.
- Section entrance: 280ms with a very small upward movement.
- Staggered listing/card reveal: 24ms per item, capped at eight items.
- Primary easing: `cubic-bezier(0.22, 1, 0.36, 1)`.

## Component animation rules

- Buttons: background/shadow changes on hover, `scale(0.98)` on active press, no movement when disabled.
- Cards: fade in with `translateY(8px)`; desktop hover only may lift by `2px` with a soft shadow.
- Listing images: desktop hover only may scale slightly, capped at `1.03`.
- Dropdowns: fade and move from `translateY(-4px)` to `0`; close should reverse before unmounting.
- Modals: overlay fades, panel fades and scales from `0.98` to `1`; no modal behavior is added unless a modal already exists.
- Forms: focus transitions use border and shadow only; validation and status messages fade/slide in with a very subtle one-time shake for invalid feedback.
- Loading states: skeletons use stable dimensions and a soft shimmer. The shimmer must stop in reduced motion.
- Mobile navigation: active/tap feedback should be immediate and small. No hover movement on touch devices.
- RTL behavior: vertical dropdown motion is preferred. Horizontal menus or drawers must enter from the RTL inline-start side.

## Accessibility rules

- Respect `prefers-reduced-motion: reduce`.
- Reduced motion disables entrance movement, shimmer, carousel slide transforms, and hover lifts.
- Motion cannot delay focus, clicks, typing, form submission, or navigation.
- Focus states remain visible and are not replaced by animation alone.

## Performance rules

- Animate only `opacity` and `transform` where possible.
- Do not animate width, height, top, left, margin, padding, or layout-affecting properties.
- Keep animation CSS reusable through shared utilities instead of per-component one-offs.
- Do not add Framer Motion for this pass.
- Keep card stagger tiny and capped so large listing grids remain responsive.

## Implementation checklist

- Add global motion tokens and utilities to `apps/web/src/app/globals.css`.
- Add a lightweight presence hook for dropdown close animations.
- Add a tiny stagger helper for listing/category grids.
- Apply shared classes to buttons, cards, dropdowns, forms, skeletons, alerts, listing grids, auth pages, account pages, and mobile navigation.
- Verify desktop, mobile RTL, reduced motion, loading states, and console health.
