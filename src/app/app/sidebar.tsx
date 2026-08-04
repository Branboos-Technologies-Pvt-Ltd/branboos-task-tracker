"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KanbanIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  match: (pathname: string) => boolean;
};

const NAV: NavItem[] = [
  {
    href: "/app",
    label: "Boards",
    icon: KanbanIcon,
    match: (p) => p === "/app" || p.startsWith("/app/boards"),
  },
  {
    href: "/app/my",
    label: "My Cards",
    icon: UserIcon,
    match: (p) => p.startsWith("/app/my"),
  },
  {
    href: "/app/members",
    label: "Members",
    icon: UsersIcon,
    match: (p) => p.startsWith("/app/members"),
  },
];

export function Sidebar({
  workspaceName,
  userEmail,
  userInitial,
}: {
  workspaceName: string;
  userEmail: string;
  userInitial: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const content = (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-6 p-4">
        <Link
          href="/app"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">
            B
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-medium tracking-wide text-zinc-500 uppercase">
              {workspaceName}
            </span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Task Tracker
            </span>
          </div>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-medium text-white">
            {userInitial}
          </div>
          <span
            className="truncate text-xs text-zinc-700 dark:text-zinc-300"
            title={userEmail}
          >
            {userEmail}
          </span>
        </div>
        <form action={signOut}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2"
          >
            <LogOutIcon className="h-3.5 w-3.5" />
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/85 px-4 py-2.5 backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-900/85">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-1.5 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Open menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
            B
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Task Tracker
          </span>
        </div>
        <div className="w-8" />
      </div>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-zinc-200 bg-white md:block dark:border-zinc-800 dark:bg-zinc-900/60">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-xl dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close menu"
            >
              <XIcon className="h-5 w-5" />
            </button>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
