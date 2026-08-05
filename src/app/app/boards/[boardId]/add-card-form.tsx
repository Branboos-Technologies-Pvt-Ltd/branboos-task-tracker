"use client";

import { useRef, useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { createCard } from "./actions";

export function AddCardForm({
  boardId,
  listId,
}: {
  boardId: string;
  listId: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md px-2 py-1.5 text-left text-[13px] text-[#9B9B94] transition-colors hover:bg-white hover:text-[#1A1A18]"
      >
        + Add a card
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          const result = await createCard(boardId, listId, formData);
          if (result?.error) setError(result.error);
          else formRef.current?.reset();
        });
      }}
      className="flex flex-col gap-2 rounded-xl bg-white p-2.5"
    >
      <Textarea
        name="title"
        placeholder="Enter a title for this card..."
        autoFocus
        rows={2}
        required
        disabled={pending}
        className="resize-none border-none bg-transparent p-0 focus:ring-0"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
          }
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-[#1A1A18] px-3 py-1.5 text-[12px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Adding..." : "Add card"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="rounded-md px-2.5 py-1.5 text-[12px] font-semibold text-[#6B6B66] hover:bg-[#F3F2EE]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
