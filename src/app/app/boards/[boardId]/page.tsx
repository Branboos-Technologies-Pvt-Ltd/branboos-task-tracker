import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { listWorkspaceMembers } from "@/lib/members.server";
import { boardDot } from "@/lib/members";
import type { WorkspaceRole } from "@/lib/permissions";
import { BoardView } from "./board-view";
import type { CardPriorityValue } from "./types";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const { workspace, user, role } = await requireProfile();

  const [board, members, workspaceLabels] = await Promise.all([
    prisma.board.findFirst({
      where: { id: boardId, workspaceId: workspace.id },
      include: {
        lists: {
          orderBy: { position: "asc" },
          include: {
            cards: {
              orderBy: { position: "asc" },
              where: { archivedAt: null },
              include: {
                labels: { include: { label: true } },
                checklistItems: { orderBy: { position: "asc" } },
                comments: { orderBy: { createdAt: "asc" } },
              },
            },
          },
        },
      },
    }),
    listWorkspaceMembers(workspace.id),
    prisma.label.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!board) notFound();

  const initialLists = board.lists.map((list) => ({
    id: list.id,
    name: list.name,
    position: list.position,
    createdById: list.createdById,
    cardCount: list.cards.length,
    cards: list.cards.map((card) => ({
      id: card.id,
      key: `${workspace.prefix}-${card.number}`,
      title: card.title,
      description: card.description,
      component: card.component,
      labels: card.labels.map((cl) => ({
        id: cl.label.id,
        name: cl.label.name,
        color: cl.label.color,
      })),
      checklist: card.checklistItems.map((it) => ({
        id: it.id,
        text: it.text,
        done: it.done,
        position: it.position,
      })),
      comments: card.comments.map((c) => ({
        id: c.id,
        authorId: c.authorId,
        body: c.body,
        createdAt: c.createdAt,
      })),
      position: card.position,
      priority: (card.priority ?? null) as CardPriorityValue | null,
      startDate: card.startDate,
      dueDate: card.dueDate,
      listId: card.listId,
      assigneeId: card.assigneeId,
    })),
  }));

  const totalCards = board.lists.reduce((sum, l) => sum + l.cards.length, 0);
  const dot = boardDot(board.name);

  const availableLabels = workspaceLabels.map((l) => ({
    id: l.id,
    name: l.name,
    color: l.color,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: dot }}
          />
          <h1 className="font-heading text-2xl font-bold tracking-tight text-[#1A1A18]">
            {board.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Pill>
            {board.lists.length} {board.lists.length === 1 ? "list" : "lists"}
          </Pill>
          <Pill>
            {totalCards} {totalCards === 1 ? "card" : "cards"}
          </Pill>
        </div>
      </div>

      <BoardView
        boardId={board.id}
        boardName={board.name}
        initialLists={initialLists}
        members={members}
        currentUserId={user.id}
        currentUserRole={role as WorkspaceRole}
        availableLabels={availableLabels}
      />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#E7E5E0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1A1A18]">
      {children}
    </span>
  );
}
