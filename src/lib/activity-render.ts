// Client-safe helpers for rendering activity rows. Kept in a separate file
// (no server imports) so it can be used from client components.

export type ActivityRow = {
  id: string;
  type: string;
  createdAt: Date;
  actorName: string | null;
  actorInitial: string;
  actorEmail: string | null;
  boardId: string | null;
  cardId: string | null;
  meta: Record<string, unknown> | null;
};

export function activityText(row: ActivityRow): string {
  const actor = row.actorName ?? "Someone";
  const meta = row.meta ?? {};
  const key = typeof meta.cardKey === "string" ? meta.cardKey : "";
  const title = typeof meta.title === "string" ? meta.title : "";
  const fromList = typeof meta.fromList === "string" ? meta.fromList : "";
  const toList = typeof meta.toList === "string" ? meta.toList : "";
  const listName = typeof meta.listName === "string" ? meta.listName : "";
  const suffix = key && title ? ` ${key} · ${title}` : key ? ` ${key}` : title ? ` ${title}` : "";

  switch (row.type) {
    case "card.created":
      return `${actor} created${suffix}`;
    case "card.moved":
      return `${actor} moved${suffix} from ${fromList} to ${toList}`;
    case "card.assigned":
      return `${actor} assigned${suffix}`;
    case "card.updated":
      return `${actor} updated${suffix}`;
    case "card.deleted":
      return `${actor} deleted${suffix}`;
    case "card.commented":
      return `${actor} commented on${suffix}`;
    case "list.created":
      return `${actor} created list "${listName}"`;
    case "list.deleted":
      return `${actor} deleted list "${listName}"`;
    case "board.created":
      return `${actor} created a board`;
    case "board.updated":
      return `${actor} updated a board`;
    default:
      return `${actor} did something`;
  }
}
