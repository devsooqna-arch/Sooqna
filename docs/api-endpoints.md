# API Endpoints

Base URL example: `http://localhost:5000/api`

## Health

- `GET /health`
  - Public
  - Server health status

## Auth

- `GET /auth/session`
  - Protected
  - Verifies token and returns basic auth session info

## Users

- `POST /users/profile`
  - Protected
  - Create/update local profile from verified Firebase user

- `GET /users/me`
  - Protected
  - Return current local profile

## Uploads

- `POST /uploads/listing-image`
  - Protected
  - multipart/form-data image upload (single file)
  - Returns `url`, `path`, `filename`, `size`

## Listings

- `POST /listings`
  - Protected
  - Create listing (requires `title`, `price`, `categoryId`)

- `GET /listings`
  - Public
  - List listings (non-deleted)

- `GET /listings/:id`
  - Public
  - Get listing by id

- `PATCH /listings/:id`
  - Protected (owner only)
  - Patch listing fields

- `DELETE /listings/:id`
  - Protected (owner only)
  - Soft delete listing

- `POST /listings/:id/images`
  - Protected (owner only)
  - Append uploaded image metadata to listing

## Favorites

- `POST /favorites/:listingId`
  - Protected
  - Add listing to user favorites

- `DELETE /favorites/:listingId`
  - Protected
  - Remove listing from favorites

- `GET /favorites`
  - Protected
  - Get favorite listing IDs for current user

## Messages (Foundation)

- `POST /messages/conversations`
  - Protected
  - Create conversation structure

- `POST /messages/conversations/:conversationId/messages`
  - Protected
  - Create message inside conversation

- `GET /messages/conversations/:conversationId`
  - Public (current foundation)
  - Fetch conversation structure

- `GET /messages/conversations/:conversationId/messages`
  - Public (current foundation)
  - Fetch messages list

