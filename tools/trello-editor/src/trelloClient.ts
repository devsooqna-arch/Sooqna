const TRELLO_API_BASE = "https://api.trello.com/1";

type TrelloHttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export type TrelloClientConfig = {
  key: string;
  token: string;
};

export class TrelloClient {
  private readonly key: string;
  private readonly token: string;

  constructor(config: TrelloClientConfig) {
    this.key = config.key;
    this.token = config.token;
  }

  public async getBoards() {
    return this.request("/members/me/boards", "GET", {
      fields: "id,name,desc,closed,url,prefs,dateLastActivity",
    });
  }

  public async getBoardLists(boardId: string) {
    return this.request(`/boards/${boardId}/lists`, "GET", {
      fields: "id,name,closed,pos,idBoard",
      cards: "none",
      filter: "open",
    });
  }

  public async getBoardCards(boardId: string) {
    return this.request(`/boards/${boardId}/cards`, "GET", {
      fields: "id,name,desc,idList,idBoard,due,closed,pos,url,dateLastActivity",
      filter: "open",
    });
  }

  public async createCard(input: {
    idList: string;
    name: string;
    desc?: string;
    due?: string | null;
    pos?: "top" | "bottom" | number;
  }) {
    return this.request("/cards", "POST", input);
  }

  public async updateCard(
    cardId: string,
    input: {
      name?: string;
      desc?: string;
      due?: string | null;
      dueComplete?: boolean;
      closed?: boolean;
      pos?: "top" | "bottom" | number;
    }
  ) {
    return this.request(`/cards/${cardId}`, "PUT", input);
  }

  public async moveCard(cardId: string, targetListId: string) {
    return this.request(`/cards/${cardId}`, "PUT", {
      idList: targetListId,
    });
  }

  public async updateBoard(
    boardId: string,
    input: {
      name?: string;
      desc?: string;
      closed?: boolean;
    }
  ) {
    return this.request(`/boards/${boardId}`, "PUT", input);
  }

  public async createChecklist(cardId: string, name: string) {
    return this.request("/checklists", "POST", {
      idCard: cardId,
      name,
    });
  }

  public async addChecklistItem(
    checklistId: string,
    input: { name: string; checked?: boolean }
  ) {
    return this.request(`/checklists/${checklistId}/checkItems`, "POST", {
      name: input.name,
      checked: input.checked ?? false,
    });
  }

  public async updateChecklist(checklistId: string, name: string) {
    return this.request(`/checklists/${checklistId}`, "PUT", { name });
  }

  public async deleteChecklist(checklistId: string) {
    return this.request(`/checklists/${checklistId}`, "DELETE");
  }

  private async request(
    path: string,
    method: TrelloHttpMethod,
    queryOrBody: Record<string, unknown> = {}
  ): Promise<unknown> {
    const url = new URL(`${TRELLO_API_BASE}${path}`);
    url.searchParams.set("key", this.key);
    url.searchParams.set("token", this.token);

    let requestInit: RequestInit = { method };

    if (method === "GET" || method === "DELETE") {
      for (const [key, value] of Object.entries(queryOrBody)) {
        if (value === undefined) continue;
        url.searchParams.set(key, String(value));
      }
    } else {
      requestInit = {
        ...requestInit,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryOrBody),
      };
    }

    const response = await fetch(url.toString(), requestInit);
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message =
        (payload && typeof payload.message === "string" && payload.message) ||
        `Trello request failed: ${response.status}`;
      throw new Error(message);
    }

    return payload;
  }
}
