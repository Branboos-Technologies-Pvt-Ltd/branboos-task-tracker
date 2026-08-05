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
    <div className="mx-auto flex max-w-[1000px] flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-[#1A1A18]">My Cards</h1>
        <p className="mt-1 text-sm text-[#6B6B66]">
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
            const componentStyle = card.component
              ? componentColor(card.component)
              : null;
            const overdue =
              card.dueDate && isPast(card.dueDate) && !isToday(card.dueDate);
            const key = `${workspace.prefix}-${card.number}`;

            return (
              <Link
                key={card.id}
                href={`/app/boards/${card.list.boardId}`}
                className="flex items-center gap-3 rounded-xl border border-[#E7E5E0] bg-white p-3.5 transition-shadow hover:shadow-sm"
              >
                {priStyle && (
                  <span
                    className="h-8 w-1 shrink-0 rounded-sm"
                    style={{ backgroundColor: priStyle.dot }}
                  />
                )}

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-semibold text-[#9B9B94]">
                      {key}
                    </span>
                    <span className="truncate text-sm font-semibold text-[#1A1A18]">
                      {card.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#9B9B94]">
                    <span className="flex items-center gap-1">
                      <LayoutIcon className="h-3 w-3" />
                      {card.list.board.name} · {card.list.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {componentStyle && card.component && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: componentStyle.bg,
                        color: componentStyle.color,
                      }}
                    >
                      {card.component}
                    </span>
                  )}
                  {priStyle && (
                    <span
                      className="rounded-md px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: priStyle.bg,
                        color: priStyle.color,
                      }}
                    >
                      {priStyle.label}
                    </span>
                  )}
                  {card.dueDate && (
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        backgroundColor: overdue ? "#FEE2E2" : "#F3F2EE",
                        color: overdue ? "#B91C1C" : "#6B6B66",
                      }}
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
