import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { BoardView } from "./board-view";

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
      position: card.position,
      listId: card.listId,
    })),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/app" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Boards
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">{board.name}</span>
      </div>
      <BoardView boardId={board.id} initialLists={initialLists} />
    </div>
  );
}
