"use client";

import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/login/actions";
import { avatarSwatch } from "@/lib/members";

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
  const swatch = avatarSwatch(userEmail);

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
        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold outline-none transition-shadow hover:ring-2 hover:ring-[#E7E5E0] focus-visible:ring-2 focus-visible:ring-[#00ACC1]"
        style={{ backgroundColor: swatch.bg, color: swatch.text }}
        aria-label={`Account menu for ${userDisplayName}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {userInitials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-11 right-0 z-50 w-[220px] overflow-hidden rounded-xl border border-[#E7E5E0] bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
        >
          <div className="mb-1 border-b border-[#F1F0EC] px-3 py-2.5">
            <div className="text-[13px] font-bold text-[#1A1A18]">
              {userDisplayName}
            </div>
            <div className="text-[11px] text-[#9B9B94]" title={userEmail}>
              {userEmail}
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-[#DC2626] hover:bg-[#FEF2F2]"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
