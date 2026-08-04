import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { LayoutIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { boardGradient } from "@/lib/board-gradients";
import { NewBoardDialog } from "./new-board-dialog";

export default async function AppHome() {
  const { workspace } = await requireProfile();

  const boards = await prisma.board.findMany({
    where: { workspaceId: workspace.id, archivedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { lists: true } },
      lists: {
        select: { _count: { select: { cards: true } } },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Boards
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {boards.length === 0
              ? "No boards yet — create your first one to get started."
              : `${boards.length} board${boards.length === 1 ? "" : "s"} in ${workspace.name}`}
          </p>
        </div>
        <NewBoardDialog />
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-white/60 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <LayoutIcon className="h-10 w-10 text-zinc-400" />
          <div>
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              No boards here yet
            </p>
            <p className="text-sm text-zinc-500">
              Click <span className="font-medium">New board</span> above to create one.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const totalCards = board.lists.reduce(
              (sum, list) => sum + list._count.cards,
              0,
            );
            const gradient = boardGradient(board.name);
            return (
              <Link
                key={board.id}
                href={`/app/boards/${board.id}`}
                className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:shadow-md hover:ring-black/10 dark:bg-zinc-900 dark:ring-white/10 dark:hover:ring-white/20"
              >
                <div className={`h-14 bg-gradient-to-br ${gradient}`} />
                <div className="flex flex-col gap-2 p-4">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                    {board.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {board._count.lists} list{board._count.lists === 1 ? "" : "s"} ·{" "}
                      {totalCards} card{totalCards === 1 ? "" : "s"}
                    </span>
                    <span>
                      {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
