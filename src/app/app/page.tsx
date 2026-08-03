import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { NewBoardDialog } from "./new-board-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="flex items-center justify-between">
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

      {boards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const totalCards = board.lists.reduce(
              (sum, list) => sum + list._count.cards,
              0,
            );
            return (
              <Link key={board.id} href={`/app/boards/${board.id}`}>
                <Card className="transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
                  <CardHeader>
                    <CardTitle>{board.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>
                        {board._count.lists} list{board._count.lists === 1 ? "" : "s"} ·{" "}
                        {totalCards} card{totalCards === 1 ? "" : "s"}
                      </span>
                      <span>
                        updated {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
