import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { TrelloClient } from "./trelloClient";

dotenv.config();

const port = Number(process.env.PORT ?? 5051);
const trelloKey = process.env.TRELLO_KEY;
const trelloToken = process.env.TRELLO_TOKEN;

const trelloClient =
  trelloKey && trelloToken
    ? new TrelloClient({
        key: trelloKey,
        token: trelloToken,
      })
    : null;

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    service: "trello-editor",
    message: "Trello editor API is running.",
    trelloConfigured: Boolean(trelloClient),
  });
});

function requireTrelloClient(res: Response): TrelloClient | null {
  if (trelloClient) return trelloClient;
  res.status(503).json({
    success: false,
    message: "Missing Trello credentials. Please set TRELLO_KEY and TRELLO_TOKEN in .env.",
  });
  return null;
}

app.get("/boards", async (_req, res, next) => {
  try {
    const client = requireTrelloClient(res);
    if (!client) return;
    const data = await client.getBoards();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

app.get("/boards/:boardId/lists", async (req, res, next) => {
  try {
    const client = requireTrelloClient(res);
    if (!client) return;
    const data = await client.getBoardLists(req.params.boardId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

app.get("/boards/:boardId/cards", async (req, res, next) => {
  try {
    const client = requireTrelloClient(res);
    if (!client) return;
    const data = await client.getBoardCards(req.params.boardId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

app.post("/cards", async (req, res, next) => {
  try {
    const client = requireTrelloClient(res);
    if (!client) return;

    const { idList, name, desc, due, pos } = req.body ?? {};
    if (!idList || !name) {
      res.status(400).json({
        success: false,
        message: "idList and name are required.",
      });
      return;
    }

    const data = await client.createCard({
      idList,
      name,
      desc,
      due,
      pos,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

app.put("/cards/:cardId", async (req, res, next) => {
  try {
    const client = requireTrelloClient(res);
    if (!client) return;

    const data = await client.updateCard(req.params.cardId, {
      name: req.body?.name,
      desc: req.body?.desc,
      due: req.body?.due,
      dueComplete: req.body?.dueComplete,
      closed: req.body?.closed,
      pos: req.body?.pos,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

app.put("/cards/:cardId/move", async (req, res, next) => {
  try {
    const client = requireTrelloClient(res);
    if (!client) return;

    const targetListId = req.body?.targetListId;
    if (!targetListId) {
      res.status(400).json({
        success: false,
        message: "targetListId is required.",
      });
      return;
    }

    const data = await client.moveCard(req.params.cardId, targetListId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

app.post("/cards/:cardId/checklists", async (req, res, next) => {
  try {
    const client = requireTrelloClient(res);
    if (!client) return;

    const name = req.body?.name;
    if (!name || typeof name !== "string") {
      res.status(400).json({
        success: false,
        message: "name is required.",
      });
      return;
    }

    const data = await client.createChecklist(req.params.cardId, name);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

app.post("/checklists/:checklistId/items", async (req, res, next) => {
  try {
    const client = requireTrelloClient(res);
    if (!client) return;

    const name = req.body?.name;
    if (!name || typeof name !== "string") {
      res.status(400).json({
        success: false,
        message: "name is required.",
      });
      return;
    }

    const data = await client.addChecklistItem(req.params.checklistId, {
      name,
      checked: Boolean(req.body?.checked),
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

app.put("/checklists/:checklistId", async (req, res, next) => {
  try {
    const client = requireTrelloClient(res);
    if (!client) return;

    const name = req.body?.name;
    if (!name || typeof name !== "string") {
      res.status(400).json({
        success: false,
        message: "name is required.",
      });
      return;
    }

    const data = await client.updateChecklist(req.params.checklistId, name);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

app.delete("/checklists/:checklistId", async (req, res, next) => {
  try {
    const client = requireTrelloClient(res);
    if (!client) return;

    await client.deleteChecklist(req.params.checklistId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.put("/boards/:boardId", async (req, res, next) => {
  try {
    const client = requireTrelloClient(res);
    if (!client) return;

    const data = await client.updateBoard(req.params.boardId, {
      name: req.body?.name,
      desc: req.body?.desc,
      closed: req.body?.closed,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

app.use((err: unknown, _req: Request, res: Response, _next: () => void) => {
  const message = err instanceof Error ? err.message : "Unknown error";
  res.status(500).json({
    success: false,
    message,
  });
});

app.listen(port, () => {
  // Keep it minimal and easy to discover in terminal output.
  if (!trelloClient) {
    console.warn(
      "trello-editor started without Trello credentials. Set TRELLO_KEY and TRELLO_TOKEN in .env."
    );
  }
  console.log(`trello-editor listening on http://localhost:${port}`);
});
