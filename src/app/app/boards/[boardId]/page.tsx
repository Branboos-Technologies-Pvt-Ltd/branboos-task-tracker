import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { listWorkspaceMembers } from "@/lib/members.server";
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
  const { workspace, user } = await requireProfile();

  const [board, members] = await Promise.all([
    prisma.board.findFirst({
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
    }),
    listWorkspaceMembers(workspace.id),
  ]);

  if (!board) notFound();

  const initialLists = board.lists.map((list) => ({
    id: list.id,
    name: list.name,
    position: list.position,
    cards: list.cards.map((card) => ({
      id: card.id,
      key: `${workspace.prefix}-${card.number}`,
      title: card.title,
      description: card.description,
      component: card.component,
      position: card.position,
      priority: (card.priority ?? null) as CardPriorityValue | null,
      startDate: card.startDate,
      dueDate: card.dueDate,
      listId: card.listId,
      assigneeId: card.assigneeId,
    })),
  }));

  const totalCards = board.lists.reduce((sum, l) => sum + l.cards.length, 0);
  const gradient = gradientFor(board.name);

  return (
    <div className="flex flex-col gap-5">
      <nav className="flex items-center gap-1 text-xs text-zinc-500">
        <Link href="/app" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Boards
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <span className="text-zinc-700 dark:text-zinc-300">{board.name}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${gradient}`}
          />
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {board.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-full bg-white px-2.5 py-1 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
            <strong className="text-zinc-900 dark:text-zinc-100">
              {board.lists.length}
            </strong>{" "}
            {board.lists.length === 1 ? "list" : "lists"}
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10">
            <strong className="text-zinc-900 dark:text-zinc-100">{totalCards}</strong>{" "}
            {totalCards === 1 ? "card" : "cards"}
          </span>
        </div>
      </div>

      <BoardView
        boardId={board.id}
        initialLists={initialLists}
        members={members}
        currentUserId={user.id}
      />
    </div>
  );
}
