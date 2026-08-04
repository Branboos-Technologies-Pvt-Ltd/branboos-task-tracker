"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  KanbanIcon,
  LogOutIcon,
  MenuIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { signOut } from "@/app/login/actions";
import { BranBoosMark } from "@/components/branboos-logo";
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

const COLLAPSED_KEY = "branboos-sidebar-collapsed";

export function Sidebar({
  workspaceName,
  userDisplayName,
  userEmail,
  userInitials,
}: {
  workspaceName: string;
  userDisplayName: string;
  userEmail: string;
  userInitials: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Hydrate collapsed state from localStorage after mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(COLLAPSED_KEY);
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      }
      return next;
    });
  }

  const desktopContent = (
    <div className="flex h-full flex-col justify-between">
      <div className={`flex flex-col gap-6 ${collapsed ? "p-2" : "p-4"}`}>
        <Link
          href="/app"
          className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}
          title={workspaceName}
        >
          <BranBoosMark size={collapsed ? 32 : 36} className="shrink-0" />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {workspaceName}
              </span>
              <span className="text-[10px] font-medium tracking-wide text-zinc-500">
                Task Tracker
              </span>
            </div>
          )}
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? "justify-center px-2 py-2" : "px-3 py-2"
                } ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={`border-t border-zinc-200 dark:border-zinc-800 ${collapsed ? "p-2" : "p-4"}`}>
        <button
          type="button"
          onClick={toggleCollapsed}
          className={`mb-3 flex w-full items-center gap-2 rounded-md text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 ${
            collapsed ? "justify-center p-2" : "px-2.5 py-1.5"
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRightIcon className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeftIcon className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>

        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-2.5"} mb-3`}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-semibold text-white"
            title={`${userDisplayName} (${userEmail})`}
          >
            {userInitials}
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span
                className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200"
                title={userDisplayName}
              >
                {userDisplayName}
              </span>
              <span
                className="truncate text-[10px] text-zinc-500"
                title={userEmail}
              >
                {userEmail}
              </span>
            </div>
          )}
        </div>

        <form action={signOut}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className={`${collapsed ? "w-full justify-center px-0" : "w-full justify-center"} gap-2`}
            title="Sign out"
          >
            <LogOutIcon className="h-3.5 w-3.5" />
            {!collapsed && "Sign out"}
          </Button>
        </form>
      </div>
    </div>
  );

  // Mobile drawer always shows the expanded layout, regardless of collapsed state.
  const mobileContent = (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-6 p-4">
        <Link
          href="/app"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5"
        >
          <BranBoosMark size={36} className="shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {workspaceName}
            </span>
            <span className="text-[10px] font-medium tracking-wide text-zinc-500">
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-xs font-semibold text-white">
            {userInitials}
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span
              className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200"
              title={userDisplayName}
            >
              {userDisplayName}
            </span>
            <span
              className="truncate text-[10px] text-zinc-500"
              title={userEmail}
            >
              {userEmail}
            </span>
          </div>
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
      {/* Mobile hamburger — visible only on small screens, sits in the sticky
          top header alongside it (rendered here for co-location with drawer). */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-2 left-2 z-40 rounded-md bg-white p-2 text-zinc-700 shadow-sm ring-1 ring-black/5 md:hidden dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10"
        aria-label="Open menu"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* Desktop sidebar — width transitions between collapsed and expanded. */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-zinc-200 bg-white transition-[width] duration-200 md:block dark:border-zinc-800 dark:bg-zinc-900/60 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {desktopContent}
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
            {mobileContent}
          </div>
        </div>
      )}
    </>
  );
}
