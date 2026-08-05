export type CardPriorityValue = "low" | "medium" | "high" | "urgent";

export type LabelData = {
  id: string;
  name: string;
  color: string; // hex, e.g. "#3B82F6"
};

export type CardData = {
  id: string;
  key: string;
  title: string;
  description: string | null;
  component: string | null; // legacy, kept for backfill fallback
  labels: LabelData[];
  position: number;
  priority: CardPriorityValue | null;
  startDate: Date | null;
  dueDate: Date | null;
  listId: string;
  assigneeId: string | null;
};

export type ListData = {
  id: string;
  name: string;
  position: number;
  createdById: string | null;
  cardCount: number;
  cards: CardData[];
};

// Priority pill styling — flat pastel background + darker text (matches design).
export const PRIORITY_STYLES: Record<
  CardPriorityValue,
  { label: string; bg: string; color: string; dot: string }
> = {
  low: { label: "Low", bg: "#E0E7FF", color: "#3730A3", dot: "#64748B" },
  medium: { label: "Medium", bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B" },
  high: { label: "High", bg: "#FEE2E2", color: "#B91C1C", dot: "#F97316" },
  urgent: { label: "Urgent", bg: "#FEE2E2", color: "#991B1B", dot: "#DC2626" },
};

// Component/label tag palette — matches design's label colors.
const COMPONENT_PALETTE: { bg: string; color: string }[] = [
  { bg: "#EDE9FE", color: "#6D28D9" }, // violet (Design)
  { bg: "#DBEAFE", color: "#1D4ED8" }, // blue (Frontend)
  { bg: "#CCFBF1", color: "#0F766E" }, // teal (Backend)
  { bg: "#FEE2E2", color: "#B91C1C" }, // red (Bug)
  { bg: "#F1F5F9", color: "#475569" }, // slate (Docs)
  { bg: "#FCE7F3", color: "#BE185D" }, // pink (Marketing)
  { bg: "#FEF3C7", color: "#92400E" }, // amber
  { bg: "#DCFCE7", color: "#166534" }, // green
];

export function componentColor(name: string): { bg: string; color: string } {
  // Named labels get semantic colors so "Frontend" is always blue etc.
  const named: Record<string, number> = {
    design: 0,
    frontend: 1,
    backend: 2,
    bug: 3,
    docs: 4,
    marketing: 5,
  };
  const key = name.trim().toLowerCase();
  if (key in named) return COMPONENT_PALETTE[named[key]];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return COMPONENT_PALETTE[Math.abs(hash) % COMPONENT_PALETTE.length];
}

// Column dot color, semantic where possible.
const NAMED_COLUMN_DOTS: Record<string, string> = {
  todo: "#8B5CF6",
  backlog: "#8B5CF6",
  "to do": "#8B5CF6",
  "in progress": "#F59E0B",
  doing: "#F59E0B",
  wip: "#F59E0B",
  review: "#3B82F6",
  "in review": "#3B82F6",
  qa: "#3B82F6",
  testing: "#3B82F6",
  done: "#22C55E",
  complete: "#22C55E",
  completed: "#22C55E",
  shipped: "#22C55E",
  deployed: "#0EA5E9",
  blocked: "#EF4444",
  cancelled: "#EF4444",
};

const COLUMN_DOT_PALETTE = [
  "#3B82F6",
  "#8B5CF6",
  "#14B8A6",
  "#F59E0B",
  "#EF4444",
  "#22C55E",
  "#EC4899",
  "#06B6D4",
];

export function columnDot(name: string): string {
  const key = name.trim().toLowerCase();
  if (key in NAMED_COLUMN_DOTS) return NAMED_COLUMN_DOTS[key];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return COLUMN_DOT_PALETTE[Math.abs(hash) % COLUMN_DOT_PALETTE.length];
}
