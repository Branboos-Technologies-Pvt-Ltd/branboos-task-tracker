import Link from "next/link";
import { format, isPast, isToday } from "date-fns";
import { CalendarIcon, LayoutIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import {
  PRIORITY_STYLES,
  componentColor,
} from "@/app/app/boards/[boardId]/types";
import type { CardPriorityValue } from "@/app/app/boards/[boardId]/types";

export default async function MyCardsPage() {
  const { workspace, profile } = await requireProfile();

  const cards = await prisma.card.findMany({
    where: {
      workspaceId: workspace.id,
      assigneeId: profile.id,
      archivedAt: null,
    },
    orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { updatedAt: "desc" }],
    include: {
      list: { include: { board: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          My Cards
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {cards.length === 0
            ? "Nothing assigned to you. Enjoy the quiet."
            : `${cards.length} open card${cards.length === 1 ? "" : "s"} assigned to you across all boards.`}
        </p>
      </div>

      {cards.length > 0 && (
        <div className="flex flex-col gap-2">
          {cards.map((card) => {
            const priority = (card.priority ?? null) as CardPriorityValue | null;
            const priStyle = priority ? PRIORITY_STYLES[priority] : null;
            const overdue = card.dueDate && isPast(card.dueDate) && !isToday(card.dueDate);
            const key = `${workspace.prefix}-${card.number}`;

            return (
              <Link
                key={card.id}
                href={`/app/boards/${card.list.boardId}`}
                className="group flex items-center gap-3 overflow-hidden rounded-lg bg-white p-3 shadow-sm ring-1 ring-black/5 transition-colors hover:ring-black/15 dark:bg-zinc-900 dark:ring-white/10 dark:hover:ring-white/20"
              >
                {priStyle && <div className={`h-8 w-1 shrink-0 rounded-sm ${priStyle.bar}`} />}

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold text-zinc-500">
                      {key}
                    </span>
                    <span className="truncate text-sm text-zinc-900 dark:text-zinc-100">
                      {card.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <LayoutIcon className="h-3 w-3" />
                      {card.list.board.name} · {card.list.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {card.component && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${componentColor(card.component)}`}
                    >
                      {card.component}
                    </span>
                  )}
                  {priStyle && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priStyle.tag}`}
                    >
                      {priStyle.label}
                    </span>
                  )}
                  {card.dueDate && (
                    <span
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        overdue
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      <CalendarIcon className="h-3 w-3" />
                      {format(card.dueDate, "MMM d")}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
