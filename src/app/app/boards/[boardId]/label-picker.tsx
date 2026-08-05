"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { createLabel, setCardLabels } from "./actions";
import type { LabelData } from "./types";

// Small palette of colors to pick from when creating a new label.
const NEW_LABEL_COLORS = [
  "#8B5CF6",
  "#3B82F6",
  "#14B8A6",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#64748B",
];

export function LabelPicker({
  boardId,
  cardId,
  availableLabels,
  selectedLabels,
  onChange,
}: {
  boardId: string;
  cardId: string;
  availableLabels: LabelData[];
  selectedLabels: LabelData[];
  onChange: (labels: LabelData[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [creating, startCreate] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  const selectedIds = useMemo(
    () => new Set(selectedLabels.map((l) => l.id)),
    [selectedLabels],
  );

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  function toggleLabel(label: LabelData) {
    const next = selectedIds.has(label.id)
      ? selectedLabels.filter((l) => l.id !== label.id)
      : [...selectedLabels, label];
    onChange(next);
    startTransition(async () => {
      await setCardLabels(boardId, {
        cardId,
        labelIds: next.map((l) => l.id),
      });
    });
  }

  const trimmed = query.trim();
  const filtered = trimmed
    ? availableLabels.filter((l) =>
        l.name.toLowerCase().includes(trimmed.toLowerCase()),
      )
    : availableLabels;

  const exactMatch = availableLabels.some(
    (l) => l.name.toLowerCase() === trimmed.toLowerCase(),
  );
  const canCreate = trimmed.length > 0 && !exactMatch;

  async function handleCreate() {
    const color = NEW_LABEL_COLORS[Math.floor(Math.random() * NEW_LABEL_COLORS.length)];
    const formData = new FormData();
    formData.set("name", trimmed);
    formData.set("color", color);
    startCreate(async () => {
      const result = await createLabel(boardId, formData);
      if ("error" in result) {
        alert(result.error);
        return;
      }
      const newLabel: LabelData = { id: result.id, name: result.name, color: result.color };
      const next = [...selectedLabels, newLabel];
      onChange(next);
      await setCardLabels(boardId, {
        cardId,
        labelIds: next.map((l) => l.id),
      });
      setQuery("");
    });
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex flex-wrap items-center gap-1">
        {selectedLabels.map((label) => (
          <span
            key={label.id}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: `${label.color}20`, color: label.color }}
          >
            {label.name}
            <button
              type="button"
              onClick={() => toggleLabel(label)}
              className="rounded-full hover:bg-black/10"
              aria-label={`Remove ${label.name}`}
            >
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-[#D4D2CC] px-2 py-0.5 text-[11px] font-semibold text-[#6B6B66] hover:border-[#9B9B94] hover:text-[#1A1A18]"
        >
          <PlusIcon className="h-3 w-3" />
          Add label
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 z-40 mt-2 w-64 rounded-xl border border-[#E7E5E0] bg-white p-2 shadow-lg">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or create..."
            autoFocus
            className="mb-1.5 w-full rounded-md border border-[#E7E5E0] bg-[#F9F8F6] px-2.5 py-1.5 text-sm outline-none focus:border-[#00ACC1]"
          />
          <div className="max-h-56 overflow-y-auto">
            {filtered.map((label) => {
              const checked = selectedIds.has(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label)}
                  disabled={pending}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-[#F3F2EE]"
                >
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="flex-1 text-[#1A1A18]">{label.name}</span>
                  {checked && (
                    <span className="text-xs text-[#22C55E]">✓</span>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && !canCreate && (
              <div className="px-2 py-2 text-xs text-[#9B9B94]">
                No matching labels.
              </div>
            )}
          </div>
          {canCreate && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="mt-1 flex w-full items-center gap-2 rounded-md border-t border-[#F1F0EC] px-2 py-2 text-left text-sm text-[#3B82F6] hover:bg-[#F3F2EE] disabled:opacity-60"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              {creating ? "Creating..." : `Create "${trimmed}"`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
