"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KanbanSquareIcon,
  MenuIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { BranBoosMark } from "@/components/branboos-logo";
import { boardDot } from "@/lib/members";

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
    icon: KanbanSquareIcon,
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

export type SidebarBoard = { id: string; name: string };

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
      {/* Top: brand + toggle */}
      <div className={`${collapsed ? "p-3" : "px-5 py-6"} flex flex-col gap-6`}>
        <div
          className={`flex items-center ${collapsed ? "flex-col gap-2" : "justify-between gap-2"}`}
        >
          <Link
            href="/app"
            className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}
            title={workspaceName}
          >
            <BranBoosMark size={collapsed ? 32 : 36} className="shrink-0" />
            {!collapsed && (
              <div className="leading-tight">
                <div className="font-heading text-sm font-extrabold text-[#1A1A18]">
                  {workspaceName}
                </div>
                <div className="text-[11px] text-[#9B9B94]">Task Tracker</div>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="rounded-md p-1.5 text-[#9B9B94] transition-colors hover:bg-[#F3F2EE] hover:text-[#1A1A18]"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpenIcon className="h-4 w-4" />
            ) : (
              <PanelLeftCloseIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`flex items-center gap-2.5 rounded-[9px] text-[13px] font-semibold transition-colors ${
                  collapsed ? "justify-center px-2 py-2" : "px-3 py-2.5"
                } ${
                  active
                    ? "bg-[#1A1A18] text-white"
                    : "text-[#3F3F3A] hover:bg-[#F3F2EE]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Boards list — only when expanded */}
      {!collapsed && (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[1px] text-[#9B9B94] uppercase">
              Boards
            </span>
            <span className="text-[11px] font-bold text-[#9B9B94]">
              {totalBoards}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {recentBoards.map((board) => {
              const active = pathname === `/app/boards/${board.id}`;
              return (
                <Link
                  key={board.id}
                  href={`/app/boards/${board.id}`}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] transition-colors ${
                    active
                      ? "bg-[#F3F2EE] font-semibold text-[#1A1A18]"
                      : "font-medium text-[#3F3F3A] hover:bg-[#F3F2EE]"
                  }`}
                  title={board.name}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: boardDot(board.name) }}
                  />
                  <span className="truncate">{board.name}</span>
                </Link>
              );
            })}
          </div>
          {hasMoreBoards && (
            <Link
              href="/app"
              className="mt-2 block rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-[#9B9B94] hover:bg-[#F3F2EE] hover:text-[#1A1A18]"
            >
              View all boards →
            </Link>
          )}
        </div>
      )}
    </div>
  );

  const mobileContent = (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-6 px-5 py-6">
        <Link
          href="/app"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5"
        >
          <BranBoosMark size={36} className="shrink-0" />
          <div className="leading-tight">
            <div className="font-heading text-sm font-extrabold text-[#1A1A18]">
              {workspaceName}
            </div>
            <div className="text-[11px] text-[#9B9B94]">Task Tracker</div>
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
                className={`flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-[13px] font-semibold transition-colors ${
                  active
                    ? "bg-[#1A1A18] text-white"
                    : "text-[#3F3F3A] hover:bg-[#F3F2EE]"
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
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[1px] text-[#9B9B94] uppercase">
              Boards
            </span>
            <span className="text-[11px] font-bold text-[#9B9B94]">
              {totalBoards}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            {recentBoards.map((board) => (
              <Link
                key={board.id}
                href={`/app/boards/${board.id}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-[#3F3F3A] hover:bg-[#F3F2EE]"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: boardDot(board.name) }}
                />
                <span className="truncate">{board.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-40 rounded-md bg-white p-2 text-[#3F3F3A] shadow-sm ring-1 ring-[#E7E5E0] md:hidden"
        aria-label="Open menu"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 border-r border-[#E7E5E0] bg-white transition-[width] duration-200 md:block ${
          collapsed ? "w-16" : "w-[260px]"
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
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-white shadow-xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 rounded-md p-1.5 text-[#6B6B66] hover:bg-[#F3F2EE]"
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
