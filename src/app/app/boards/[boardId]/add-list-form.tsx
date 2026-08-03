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
        className="flex h-11 w-full items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-white/60 px-3 text-sm font-medium text-zinc-600 transition-colors hover:border-zinc-400 hover:bg-white hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
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
      className="flex w-full flex-col gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/[0.04] dark:bg-zinc-900 dark:ring-white/[0.06]"
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
