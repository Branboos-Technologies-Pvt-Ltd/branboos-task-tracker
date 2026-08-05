"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBoard } from "./actions";

export function NewBoardDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="rounded-[10px] bg-[#1A1A18] px-5 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          >
            New board
          </button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a board</DialogTitle>
          <DialogDescription>
            Boards hold lists of cards. Create one per project, team, or workflow.
          </DialogDescription>
        </DialogHeader>
        <form
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await createBoard(formData);
              if (result?.error) setError(result.error);
              else setOpen(false);
            });
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Board name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Product roadmap"
              autoFocus
              required
              disabled={pending}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
          <DialogFooter>
            <button
              type="submit"
              disabled={pending}
              className="rounded-[10px] bg-[#1A1A18] px-5 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Creating..." : "Create board"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
