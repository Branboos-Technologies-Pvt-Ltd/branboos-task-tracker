"use client";

import { useRef, useState, useTransition } from "react";
import { PlusIcon, TrashIcon } from "lucide-react";
import {
  addChecklistItem,
  deleteChecklistItem,
  toggleChecklistItem,
  updateChecklistItemText,
} from "./actions";
import type { ChecklistItemData } from "./types";

export function CardChecklist({
  boardId,
  cardId,
  items,
}: {
  boardId: string;
  cardId: string;
  items: ChecklistItemData[];
}) {
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const progressPct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <section>
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[13px] font-bold text-[#1A1A18]">Checklist</div>
        {total > 0 && (
          <div className="text-xs text-[#9B9B94]">
            {done}/{total}
          </div>
        )}
      </div>

      {total > 0 && (
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#F1F0EC]">
          <div
            className="h-full transition-[width] duration-300 bg-gradient-to-r from-[#F4511E] via-[#FDD835] to-[#00ACC1]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      <div className="flex flex-col">
        {items.map((item) => (
          <ChecklistRow
            key={item.id}
            boardId={boardId}
            item={item}
          />
        ))}
      </div>

      <AddItemForm boardId={boardId} cardId={cardId} hasItems={total > 0} />
    </section>
  );
}

function ChecklistRow({
  boardId,
  item,
}: {
  boardId: string;
  item: ChecklistItemData;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);

  function toggle() {
    startTransition(async () => {
      await toggleChecklistItem(boardId, item.id, !item.done);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteChecklistItem(boardId, item.id);
    });
  }

  function saveText() {
    const trimmed = text.trim();
    if (!trimmed || trimmed === item.text) {
      setEditing(false);
      setText(item.text);
      return;
    }
    const fd = new FormData();
    fd.set("text", trimmed);
    startTransition(async () => {
      await updateChecklistItemText(boardId, item.id, fd);
      setEditing(false);
    });
  }

  return (
    <div className="group/row flex items-center gap-2.5 py-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={item.done ? "Mark not done" : "Mark done"}
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          item.done
            ? "border-transparent bg-gradient-to-br from-[#F4511E] to-[#00ACC1]"
            : "border-[#D4D2CC] bg-white hover:border-[#9B9B94]"
        }`}
      >
        {item.done && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white">
            <path
              d="M2 6l3 3 5-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {editing ? (
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={saveText}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              saveText();
            }
            if (e.key === "Escape") {
              setEditing(false);
              setText(item.text);
            }
          }}
          autoFocus
          className="flex-1 rounded border border-[#E7E5E0] bg-white px-1.5 py-0.5 text-sm outline-none focus:border-[#00ACC1]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`flex-1 truncate text-left text-sm ${
            item.done ? "text-[#9B9B94] line-through" : "text-[#1A1A18]"
          }`}
          title="Click to edit"
        >
          {item.text}
        </button>
      )}

      <button
        type="button"
        onClick={remove}
        disabled={pending}
        aria-label="Delete item"
        className="rounded p-1 text-[#9B9B94] opacity-0 transition-opacity hover:bg-[#F3F2EE] hover:text-[#DC2626] group-hover/row:opacity-100"
      >
        <TrashIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function AddItemForm({
  boardId,
  cardId,
  hasItems,
}: {
  boardId: string;
  cardId: string;
  hasItems: boolean;
}) {
  const [open, setOpen] = useState(!hasItems);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const fd = new FormData();
    fd.set("text", trimmed);
    startTransition(async () => {
      await addChecklistItem(boardId, cardId, fd);
      setText("");
      inputRef.current?.focus();
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-[#6B6B66] hover:bg-[#F3F2EE] hover:text-[#1A1A18]"
      >
        <PlusIcon className="h-3 w-3" />
        Add an item
      </button>
    );
  }

  // NOTE: NOT a <form> — this widget is rendered inside the card-dialog's outer
  // form and HTML forbids nested forms. We handle submit via button onClick +
  // Enter key on the input, both preventing bubbling to the outer form.
  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            submit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            setText("");
            setOpen(hasItems ? false : true);
          }
        }}
        placeholder="Add an item..."
        autoFocus
        disabled={pending}
        className="flex-1 rounded-md border border-[#E7E5E0] bg-[#F9F8F6] px-2.5 py-1.5 text-sm outline-none focus:border-[#00ACC1]"
      />
      <button
        type="button"
        onClick={submit}
        disabled={pending || !text.trim()}
        className="rounded-md bg-[#1A1A18] px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add"}
      </button>
      {hasItems && (
        <button
          type="button"
          onClick={() => {
            setText("");
            setOpen(false);
          }}
          className="rounded-md px-2 py-1.5 text-xs font-semibold text-[#6B6B66] hover:bg-[#F3F2EE]"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
