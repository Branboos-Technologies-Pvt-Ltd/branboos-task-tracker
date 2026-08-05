"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { BellIcon } from "lucide-react";
import { avatarSwatch } from "@/lib/members";
import type { NotificationRow } from "@/lib/notifications.server";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "./notifications-actions";

export function NotificationsBell({
  items,
  unreadCount,
}: {
  items: NotificationRow[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

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

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsRead();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E7E5E0] bg-white text-[#1A1A18] transition-colors hover:bg-[#F9F8F6]"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <BellIcon className="h-4 w-4" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-[#EF4444] ring-2 ring-white"
            aria-label={`${unreadCount} unread notifications`}
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-11 right-0 z-50 w-[340px] overflow-hidden rounded-xl border border-[#E7E5E0] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center justify-between border-b border-[#F1F0EC] px-3 py-2.5">
            <span className="text-[11px] font-bold tracking-wider text-[#9B9B94] uppercase">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#3B82F6] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-3 py-10 text-center text-[12px] text-[#9B9B94]">
                You&rsquo;re all caught up.
              </div>
            ) : (
              items.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onClick={() => setOpen(false)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  notification,
  onClick,
}: {
  notification: NotificationRow;
  onClick: () => void;
}) {
  const [, startTransition] = useTransition();
  const swatchKey = notification.actorId ?? notification.actorEmail ?? notification.id;
  const swatch = avatarSwatch(swatchKey);
  const initial = (notification.actorName ?? notification.actorEmail ?? "?")
    .charAt(0)
    .toUpperCase();

  function handleClick() {
    if (!notification.readAt) {
      startTransition(async () => {
        await markNotificationRead(notification.id);
      });
    }
    onClick();
  }

  const href = notification.cardId
    ? `/app/boards/${notification.boardId}`
    : notification.boardId
    ? `/app/boards/${notification.boardId}`
    : "/app";

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex items-start gap-2.5 border-b border-[#F1F0EC] px-3 py-3 transition-colors last:border-b-0 hover:bg-[#FAFAF8] ${
        !notification.readAt ? "bg-[#FAFAF8]" : ""
      }`}
    >
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
        style={{ backgroundColor: swatch.bg, color: swatch.text }}
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] leading-snug text-[#1A1A18]">
          {notification.message}
        </div>
        <div className="mt-0.5 text-[11px] text-[#9B9B94]">
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </div>
      </div>
      {!notification.readAt && (
        <span
          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#3B82F6]"
          aria-label="Unread"
        />
      )}
    </Link>
  );
}
