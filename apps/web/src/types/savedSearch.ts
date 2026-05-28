export type SavedSearchQuery = Record<string, string | number>;

export type SavedSearch = {
  id: string;
  name: string;
  query: SavedSearchQuery;
  createdAt: string;
  updatedAt: string;
};
