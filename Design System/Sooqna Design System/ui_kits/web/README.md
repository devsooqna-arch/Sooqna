# Sooqna Web UI Kit

A high-fidelity interactive prototype of the Sooqna web marketplace (`apps/web`).

## Screens

| Screen | Description |
|---|---|
| **Home** | Hero banner slider + category grid + listings grid + sidebar |
| **Listings** | Browse/filter by category, sort, paginate |
| **Listing Detail** | Image gallery, price, description, seller card, favorite/message actions |
| **Submit Listing** | Multi-step form: title, category, city, price, description, image upload |
| **Messages** | Conversation list + chat thread |
| **Login** | Email/password form |

## Components

| File | Exports |
|---|---|
| `Shell.jsx` | `SooqnaShell` — header + bottom nav + theme switcher |
| `ListingCard.jsx` | `ListingCard`, `CategoryGrid`, `StatBar` |
| `HomePage.jsx` | `HomePage` |
| `ListingsPage.jsx` | `ListingsPage` |
| `ListingDetail.jsx` | `ListingDetail` |
| `index.html` | Full interactive prototype wiring all screens |

## Usage

Open `index.html` in any browser. Use the header nav/search to explore screens.
Theme switcher (كلاسيك / فاتح / داكن) is in the top bar.

## Design Sources
- CSS tokens: `../../colors_and_type.css`
- Logo/assets: `../../assets/`
- Codebase reference: `devsooqna-arch/Sooqna → apps/web/src/components/`
