"use client";

import { useState, useTransition } from "react";
import { UserRoundIcon, XIcon } from "lucide-react";
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
import { updateFullName } from "./profile-actions";

export function NamePrompt() {
  const [dismissed, setDismissed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (dismissed) return null;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-900/40 dark:bg-amber-900/20">
        <div className="flex items-center gap-2.5 text-sm text-amber-900 dark:text-amber-200">
          <UserRoundIcon className="h-4 w-4 shrink-0" />
          <span>
            Set your display name so teammates can see who you are on cards.
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="bg-amber-900 text-white hover:bg-amber-800 dark:bg-amber-200 dark:text-amber-900"
          >
            Set name
          </Button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="rounded-md p-1 text-amber-900/60 hover:bg-amber-100 hover:text-amber-900 dark:text-amber-200/60 dark:hover:bg-amber-800/40 dark:hover:text-amber-200"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your display name</DialogTitle>
          </DialogHeader>
          <form
            action={(formData) => {
              setError(null);
              startTransition(async () => {
                const result = await updateFullName(formData);
                if (result?.error) {
                  setError(result.error);
                } else {
                  setDialogOpen(false);
                  setDismissed(true);
                }
              });
            }}
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                autoFocus
                required
                disabled={pending}
              />
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
