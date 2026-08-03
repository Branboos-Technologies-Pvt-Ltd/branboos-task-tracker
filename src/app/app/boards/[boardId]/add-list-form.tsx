"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createList } from "./actions";

export function AddListForm({ boardId }: { boardId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-72 shrink-0 rounded-lg border border-dashed border-zinc-300 bg-zinc-100/70 px-3 py-3 text-left text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        + Add another list
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await createList(boardId, formData);
          if (result?.error) {
            setError(result.error);
          } else {
            formRef.current?.reset();
            setOpen(false);
          }
        });
      }}
      className="flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800"
    >
      <Input
        name="name"
        placeholder="List name"
        autoFocus
        required
        disabled={pending}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding..." : "Add list"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
