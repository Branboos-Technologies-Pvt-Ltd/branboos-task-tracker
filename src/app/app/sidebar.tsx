"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsLeftIcon,
  ChevronsRightIcon,
  KanbanIcon,
  MenuIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { BranBoosMark } from "@/components/branboos-logo";

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
    match: (p) => p === "/app",
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

export type SidebarBoard = {
  id: string;
  name: string;
};

export function Sidebar({
  workspaceName,
  recentBoards,
  totalBoards,
  boardsListLimit,
}: {
  workspaceName: string;
  recentBoards: SidebarBoard[];
  totalBoards: number;
  boardsListLimit: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

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

  const hasMoreBoards = totalBoards > boardsListLimit;

  const desktopContent = (
    <div className="flex h-full flex-col">
      <div className={`flex flex-col gap-5 ${collapsed ? "p-2" : "p-4"}`}>
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

      {/* Recent boards — only when expanded. Scrolls if there are lots. */}
      {!collapsed && recentBoards.length > 0 && (
        <div className="min-h-0 flex-1 overflow-y-auto border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
              Boards
            </span>
            <span className="text-[10px] text-zinc-400">{totalBoards}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {recentBoards.map((board) => {
              const active = pathname === `/app/boards/${board.id}`;
              return (
                <Link
                  key={board.id}
                  href={`/app/boards/${board.id}`}
                  className={`truncate rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  }`}
                  title={board.name}
                >
                  {board.name}
                </Link>
              );
            })}
          </div>
          {hasMoreBoards && (
            <Link
              href="/app"
              className="mt-2 block rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              View all boards →
            </Link>
          )}
        </div>
      )}

      {/* Bottom: collapse toggle only */}
      <div className={`border-t border-zinc-200 dark:border-zinc-800 ${collapsed ? "p-2" : "p-3"}`}>
        <button
          type="button"
          onClick={toggleCollapsed}
          className={`flex w-full items-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 ${
            collapsed ? "justify-center p-2" : "justify-center p-2"
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRightIcon className="h-4 w-4" />
          ) : (
            <ChevronsLeftIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  const mobileContent = (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-5 p-4">
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
      {recentBoards.length > 0 && (
        <div className="min-h-0 flex-1 overflow-y-auto border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">
              Boards
            </span>
            <span className="text-[10px] text-zinc-400">{totalBoards}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {recentBoards.map((board) => (
              <Link
                key={board.id}
                href={`/app/boards/${board.id}`}
                onClick={() => setMobileOpen(false)}
                className="truncate rounded-md px-2.5 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                {board.name}
              </Link>
            ))}
          </div>
          {hasMoreBoards && (
            <Link
              href="/app"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block rounded-md px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              View all boards →
            </Link>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-2 left-2 z-40 rounded-md bg-white p-2 text-zinc-700 shadow-sm ring-1 ring-black/5 md:hidden dark:bg-zinc-900 dark:text-zinc-300 dark:ring-white/10"
        aria-label="Open menu"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-zinc-200 bg-white transition-[width] duration-200 md:block dark:border-zinc-800 dark:bg-zinc-900/60 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {desktopContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-white shadow-xl dark:bg-zinc-900">
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
