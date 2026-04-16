# Upload Flow (Server Filesystem)

## Goal

Store listing images on your own server and attach metadata to listings through backend APIs.

## Endpoint

`POST /api/uploads/listing-image`

- Protected route
- Header: `Authorization: Bearer <firebase-id-token>`
- Body: `multipart/form-data` with one file field: `image`

## Validation

- Allowed MIME types:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
- Max file size: 5MB
- File names are sanitized and renamed to:
  - `{timestamp}_{randomHex}_{safeOriginalName}.{ext}`

## Storage location

Files are stored at:

- `backend/api/uploads/listings/{userId}/filename.ext`

## Response shape

```json
{
  "success": true,
  "url": "https://yourdomain.com/uploads/listings/{userId}/filename.jpg",
  "path": "uploads/listings/{userId}/filename.jpg",
  "filename": "....jpg",
  "size": 123456
}
```

## Attach uploaded image to listing

After upload, call:

`POST /api/listings/:id/images`

with body:

```json
{
  "url": "...",
  "path": "...",
  "filename": "optional"
}
```

Backend appends image metadata to `listing.images[]` and maintains:

- `order`
- `isPrimary` (first image only)

