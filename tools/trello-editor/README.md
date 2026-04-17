# Trello Editor

Local API service to manage Trello boards, lists, and cards.

## 1) Setup

```bash
cd tools/trello-editor
npm install
cp .env.example .env
```

Fill `.env`:

```env
PORT=5051
TRELLO_KEY=your_trello_key_here
TRELLO_TOKEN=your_trello_token_here
```

## 2) Run

```bash
npm run dev
```

Health check:

```bash
GET http://localhost:5051/health
```

## 3) API Endpoints

### Boards

- `GET /boards`
- `PUT /boards/:boardId`
  - body: `{ "name"?: string, "desc"?: string, "closed"?: boolean }`

### Lists

- `GET /boards/:boardId/lists`

### Cards

- `GET /boards/:boardId/cards`
- `POST /cards`
  - body: `{ "idList": string, "name": string, "desc"?: string, "due"?: string | null, "pos"?: "top" | "bottom" | number }`
- `PUT /cards/:cardId`
  - body: `{ "name"?: string, "desc"?: string, "due"?: string | null, "closed"?: boolean }`
- `PUT /cards/:cardId/move`
  - body: `{ "targetListId": string }`

## 4) Example Commands (PowerShell)

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:5051/boards"
```

```powershell
Invoke-RestMethod -Method GET -Uri "http://localhost:5051/boards/<boardId>/lists"
```

```powershell
$body = @{
  idList = "<listId>"
  name = "Follow up with partner"
  desc = "Created via trello-editor"
} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://localhost:5051/cards" -ContentType "application/json" -Body $body
```
