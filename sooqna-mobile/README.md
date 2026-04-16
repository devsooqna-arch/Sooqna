# sooqna-mobile (Foundation)

This is a scaffold-only mobile foundation.

## Planned architecture

- Firebase Authentication only (email/password + Google)
- Backend API is source of business logic
- Mobile sends Firebase ID token in `Authorization: Bearer <token>`
- Backend verifies token using Firebase Admin SDK

## Next step

Integrate this structure into Expo or React Native CLI app shell and wire runtime env handling.

