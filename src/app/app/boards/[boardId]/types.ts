export type CardPriorityValue = "low" | "medium" | "high" | "urgent";

export type CardData = {
  id: string;
  title: string;
  description: string | null;
  component: string | null;
  position: number;
  priority: CardPriorityValue | null;
  startDate: Date | null;
  dueDate: Date | null;
  listId: string;
};

export type ListData = {
  id: string;
  name: string;
  position: number;
  cards: CardData[];
};

export const PRIORITY_STYLES: Record<
  CardPriorityValue,
  { label: string; bar: string; tag: string }
> = {
  low: {
    label: "Low",
    bar: "bg-slate-400",
    tag: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  medium: {
    label: "Medium",
    bar: "bg-sky-400",
    tag: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  },
  high: {
    label: "High",
    bar: "bg-amber-400",
    tag: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  },
  urgent: {
    label: "Urgent",
    bar: "bg-red-500",
    tag: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
};

// Deterministic hash → color for the component tag, so "Frontend" is always the
// same colour regardless of which board or session you view it on.
const COMPONENT_PALETTE = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
  "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/50 dark:text-fuchsia-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300",
];

export function componentColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return COMPONENT_PALETTE[Math.abs(hash) % COMPONENT_PALETTE.length];
}

// Column accent themes. Well-known names (Todo, Done, etc.) get semantic colours;
// custom column names fall back to a deterministic hash over the palette.
export type ColumnTheme = {
  accentBar: string;
  headerDot: string;
  countBadge: string;
  droppableBg: string;
};

const COLUMN_PALETTE: ColumnTheme[] = [
  {
    accentBar: "bg-gradient-to-r from-indigo-400 to-violet-500",
    headerDot: "bg-indigo-500",
    countBadge: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    droppableBg: "bg-indigo-100/60 dark:bg-indigo-900/30",
  },
  {
    accentBar: "bg-gradient-to-r from-amber-400 to-orange-500",
    headerDot: "bg-amber-500",
    countBadge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    droppableBg: "bg-amber-100/60 dark:bg-amber-900/30",
  },
  {
    accentBar: "bg-gradient-to-r from-emerald-400 to-teal-500",
    headerDot: "bg-emerald-500",
    countBadge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    droppableBg: "bg-emerald-100/60 dark:bg-emerald-900/30",
  },
  {
    accentBar: "bg-gradient-to-r from-sky-400 to-blue-500",
    headerDot: "bg-sky-500",
    countBadge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
    droppableBg: "bg-sky-100/60 dark:bg-sky-900/30",
  },
  {
    accentBar: "bg-gradient-to-r from-pink-400 to-rose-500",
    headerDot: "bg-pink-500",
    countBadge: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    droppableBg: "bg-pink-100/60 dark:bg-pink-900/30",
  },
  {
    accentBar: "bg-gradient-to-r from-fuchsia-400 to-purple-500",
    headerDot: "bg-fuchsia-500",
    countBadge: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
    droppableBg: "bg-fuchsia-100/60 dark:bg-fuchsia-900/30",
  },
];

const NAMED_COLUMNS: Record<string, number> = {
  todo: 0,
  backlog: 0,
  "to do": 0,
  "in progress": 1,
  doing: 1,
  wip: 1,
  review: 3,
  "in review": 3,
  qa: 3,
  testing: 3,
  done: 2,
  complete: 2,
  completed: 2,
  shipped: 2,
  deployed: 5,
  blocked: 4,
  cancelled: 4,
};

export function columnTheme(name: string): ColumnTheme {
  const key = name.trim().toLowerCase();
  if (key in NAMED_COLUMNS) return COLUMN_PALETTE[NAMED_COLUMNS[key]];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return COLUMN_PALETTE[Math.abs(hash) % COLUMN_PALETTE.length];
}
