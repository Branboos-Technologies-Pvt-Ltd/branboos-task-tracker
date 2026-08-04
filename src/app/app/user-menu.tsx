"use client";

import { useEffect, useRef, useState } from "react";
import { LogOutIcon } from "lucide-react";
import { signOut } from "@/app/login/actions";

export function UserMenu({
  userDisplayName,
  userEmail,
  userInitials,
}: {
  userDisplayName: string;
  userEmail: string;
  userInitials: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-semibold text-white shadow-sm outline-none ring-offset-2 ring-offset-white transition-shadow hover:ring-2 hover:ring-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-500 dark:ring-offset-zinc-900"
        aria-label={`Account menu for ${userDisplayName}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {userInitials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-2.5 border-b border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-semibold text-white">
              {userInitials}
            </div>
            <div className="flex min-w-0 flex-col leading-tight">
              <span
                className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50"
                title={userDisplayName}
              >
                {userDisplayName}
              </span>
              <span
                className="truncate text-xs text-zinc-500"
                title={userEmail}
              >
                {userEmail}
              </span>
            </div>
          </div>
          <form action={signOut} className="p-1">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <LogOutIcon className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
