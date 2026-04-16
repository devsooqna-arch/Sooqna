# Refactor Summary

## What was done

- Added separated codebase roots:
  - `sooqna-web`
  - `sooqna-mobile`
  - `sooqna-backend`
- Kept legacy folders (`apps/web`, `backend/api`, `backend/functions`) temporarily to avoid breaking live flow during migration.
- Added architecture and integration docs for new direction.

## Deprecated (temporary)

- `apps/web` (legacy web app)
- `backend/api` (legacy backend location before extraction)
- `backend/functions` (deprecated for business logic in target architecture)

## Recommended migration sequence

1. Start backend from `sooqna-backend`
2. Point new web app to it
3. Port needed UI routes/components gradually from `apps/web` to `sooqna-web`
4. Implement mobile runtime wiring in `sooqna-mobile`
5. Remove deprecated folders after parity is confirmed

## Notes

- This phase focuses on safe scaffold + separation baseline.
- Full route-for-route UI migration from legacy web is a follow-up step.

