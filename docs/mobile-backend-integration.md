# Mobile <-> Backend Integration

## Foundation status

`sooqna-mobile` is scaffolded as structure-only foundation for now.

## Auth flow (target)

1. User signs in via Firebase Auth SDK (React Native).
2. Mobile retrieves Firebase ID token.
3. Mobile calls backend with:
   - `Authorization: Bearer <token>`
4. Backend verifies token via Firebase Admin and serves data/actions.

## Current scaffold

Services exist under `sooqna-mobile/src/services` to enforce same backend contract naming as web.

Next step is wiring these service methods into the chosen RN runtime stack (Expo or RN CLI).

