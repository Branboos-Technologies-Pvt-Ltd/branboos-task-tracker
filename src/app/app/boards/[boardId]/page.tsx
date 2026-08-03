import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { AddCardForm } from "./add-card-form";
import { AddListForm } from "./add-list-form";

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/app" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Boards
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">{board.name}</span>
      </div>

      <div className="-mx-6 overflow-x-auto px-6 pb-4">
        <div className="flex items-start gap-3">
          {board.lists.map((list) => (
            <div
              key={list.id}
              className="flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800"
            >
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {list.name}
                </h3>
                <span className="text-xs text-zinc-500">{list.cards.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {list.cards.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-md bg-white p-2.5 text-sm text-zinc-900 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10"
                  >
                    {card.title}
                  </div>
                ))}
              </div>
              <AddCardForm boardId={board.id} listId={list.id} />
            </div>
          ))}
          <AddListForm boardId={board.id} />
        </div>
      </div>
    </div>
  );
}
