import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { BoardView } from "./board-view";
import type { CardPriorityValue } from "./types";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const { workspace } = await requireProfile();

  const board = await prisma.board.findFirst({
    where: { id: boardId, workspaceId: workspace.id },
    include: {
      lists: {
        orderBy: { position: "asc" },
        include: {
          cards: {
            orderBy: { position: "asc" },
            where: { archivedAt: null },
          },
        },
      },
    },
  });

  if (!board) notFound();

  const initialLists = board.lists.map((list) => ({
    id: list.id,
    name: list.name,
    position: list.position,
    cards: list.cards.map((card) => ({
      id: card.id,
      title: card.title,
      description: card.description,
      component: card.component,
      position: card.position,
      priority: (card.priority ?? null) as CardPriorityValue | null,
      startDate: card.startDate,
      dueDate: card.dueDate,
      listId: card.listId,
    })),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/app" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Boards
          </Link>
          <span>/</span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {board.name}
        </h1>
      </div>
      <BoardView boardId={board.id} initialLists={initialLists} />
    </div>
  );
}
