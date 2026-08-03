import Link from "next/link";
import { notFound } from "next/navigation";
import { LayoutIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { BoardView } from "./board-view";
import type { CardPriorityValue } from "./types";

const GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-cyan-500 to-teal-500",
  "from-lime-500 to-green-500",
];

function gradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

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

  const totalCards = board.lists.reduce((sum, l) => sum + l.cards.length, 0);
  const gradient = gradientFor(board.name);

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
        <div className={`h-2 w-full bg-gradient-to-r ${gradient}`} />
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-sm`}
            >
              <LayoutIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <Link
                href="/app"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Boards
              </Link>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {board.name}
              </h1>
            </div>
          </div>
          <div className="hidden gap-4 text-xs text-zinc-500 sm:flex">
            <span>
              <strong className="text-zinc-900 dark:text-zinc-100">
                {board.lists.length}
              </strong>{" "}
              lists
            </span>
            <span>
              <strong className="text-zinc-900 dark:text-zinc-100">{totalCards}</strong>{" "}
              cards
            </span>
          </div>
        </div>
      </div>
      <BoardView boardId={board.id} initialLists={initialLists} />
    </div>
  );
}
