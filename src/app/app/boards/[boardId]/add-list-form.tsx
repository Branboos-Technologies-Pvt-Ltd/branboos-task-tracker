"use client";

import { useRef, useState, useTransition } from "react";
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
        className="flex h-11 w-[300px] shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-[#D4D2CC] px-3 text-sm font-semibold text-[#6B6B66] transition-colors hover:border-[#9B9B94] hover:bg-white hover:text-[#1A1A18]"
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
          if (result?.error) setError(result.error);
          else {
            formRef.current?.reset();
            setOpen(false);
          }
        });
      }}
      className="flex w-[300px] shrink-0 flex-col gap-2 rounded-2xl bg-[#F3F2EE] p-3.5"
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
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#1A1A18] px-3.5 py-1.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Adding..." : "Add list"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[#6B6B66] hover:bg-white hover:text-[#1A1A18]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
