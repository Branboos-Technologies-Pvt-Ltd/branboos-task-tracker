"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteCard, updateCard } from "./actions";
import type { CardData } from "./types";

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return format(d, "yyyy-MM-dd");
}

export function CardDialog({
  boardId,
  card,
  open,
  onOpenChange,
}: {
  boardId: string;
  card: CardData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Card details</DialogTitle>
        </DialogHeader>
        <form
          action={(formData) => {
            setError(null);
            startTransition(async () => {
              const result = await updateCard(boardId, card.id, formData);
              if (result?.error) {
                setError(result.error);
              } else {
                onOpenChange(false);
              }
            });
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={card.title}
              required
              disabled={pending}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={card.description ?? ""}
              placeholder="Add more detail, links, acceptance criteria..."
              disabled={pending}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="component">Component</Label>
              <Input
                id="component"
                name="component"
                defaultValue={card.component ?? ""}
                placeholder="e.g. Frontend, Sales"
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                name="priority"
                defaultValue={card.priority ?? ""}
                disabled={pending}
                className="h-8 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
              >
                <option value="">— None —</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={toDateInput(card.startDate)}
                disabled={pending}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={toDateInput(card.dueDate)}
                disabled={pending}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <DialogFooter className="items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={deleting || pending}
              onClick={() => {
                if (!confirm("Delete this card? This cannot be undone.")) return;
                startDelete(async () => {
                  await deleteCard(boardId, card.id);
                  onOpenChange(false);
                });
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
            <Button type="submit" disabled={pending || deleting}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
