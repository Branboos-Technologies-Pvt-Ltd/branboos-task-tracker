"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Member } from "@/lib/members";
import { memberDisplayName } from "@/lib/members";

export type BoardFilters = {
  search: string;
  assigneeId: string; // "" = any, "none" = unassigned, else profile id
  priority: string; // "" = any, or one of the priority values
  mine: boolean;
};

export const emptyFilters: BoardFilters = {
  search: "",
  assigneeId: "",
  priority: "",
  mine: false,
};

export function filtersActive(f: BoardFilters): boolean {
  return f.search !== "" || f.assigneeId !== "" || f.priority !== "" || f.mine;
}

const SELECT_CLASSES =
  "h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function FilterBar({
  members,
  currentUserId,
  filters,
  onChange,
}: {
  members: Member[];
  currentUserId: string;
  filters: BoardFilters;
  onChange: (f: BoardFilters) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/70 p-2 shadow-sm ring-1 ring-black/[0.04] dark:bg-zinc-900/70 dark:ring-white/[0.06]">
      <div className="relative flex-1 min-w-[200px]">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search cards by title or key..."
          className="pl-8"
        />
      </div>

      <select
        value={filters.assigneeId}
        onChange={(e) => onChange({ ...filters, assigneeId: e.target.value })}
        className={SELECT_CLASSES}
        aria-label="Filter by assignee"
      >
        <option value="">Any assignee</option>
        <option value="none">Unassigned</option>
        <optgroup label="Members">
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {memberDisplayName(m)}
            </option>
          ))}
        </optgroup>
      </select>

      <select
        value={filters.priority}
        onChange={(e) => onChange({ ...filters, priority: e.target.value })}
        className={SELECT_CLASSES}
        aria-label="Filter by priority"
      >
        <option value="">Any priority</option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <label className="flex items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium">
        <input
          type="checkbox"
          checked={filters.mine}
          onChange={(e) =>
            onChange({
              ...filters,
              mine: e.target.checked,
              assigneeId: e.target.checked ? currentUserId : filters.assigneeId,
            })
          }
          className="h-3.5 w-3.5 accent-indigo-500"
        />
        My cards
      </label>

      {filtersActive(filters) && (
        <button
          type="button"
          onClick={() => onChange(emptyFilters)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <XIcon className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
}

export function cardMatches(
  card: {
    title: string;
    key: string;
    priority: string | null;
    assigneeId: string | null;
  },
  filters: BoardFilters,
): boolean {
  if (filters.search) {
    const q = filters.search.toLowerCase();
    if (
      !card.title.toLowerCase().includes(q) &&
      !card.key.toLowerCase().includes(q)
    )
      return false;
  }
  if (filters.priority && card.priority !== filters.priority) return false;
  if (filters.assigneeId) {
    if (filters.assigneeId === "none") {
      if (card.assigneeId !== null) return false;
    } else if (card.assigneeId !== filters.assigneeId) {
      return false;
    }
  }
  return true;
}
