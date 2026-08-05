import Link from "next/link";
import { formatDistanceToNow, isPast, isToday, differenceInCalendarDays } from "date-fns";
import { LayoutIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { avatarSwatch, boardDot } from "@/lib/members";
import { activityText, type ActivityRow } from "@/lib/activity-render";
import { BoardsSearch } from "./boards-search";
import { NewBoardDialog } from "./new-board-dialog";

const PAGE_SIZE = 12;
type SortKey = "recent" | "az" | "created";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recently updated" },
  { key: "created", label: "Newly created" },
  { key: "az", label: "A → Z" },
];

function parsePage(v: string | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function parseSort(v: string | undefined): SortKey {
  if (v === "az" || v === "created" || v === "recent") return v;
  return "recent";
}

function orderByFor(sort: SortKey) {
  if (sort === "az") return { name: "asc" as const };
  if (sort === "created") return { createdAt: "desc" as const };
  return { updatedAt: "desc" as const };
}

export default async function AppHome({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string; page?: string }>;
}) {
  const { workspace, profile } = await requireProfile();
  const params = await searchParams;
  const search = (params.search ?? "").trim();
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);

  const where = {
    workspaceId: workspace.id,
    archivedAt: null,
    ...(search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  // Load boards page, workspace-wide stats, and user's assigned tasks in parallel
  const now = new Date();
  const soonCutoff = new Date();
  soonCutoff.setDate(soonCutoff.getDate() + 3);

  const [
    boards,
    totalCount,
    statOverdue,
    statDueSoon,
    statCompleted,
    statTotal,
    myTasks,
    recentActivities,
  ] =
    await Promise.all([
      prisma.board.findMany({
        where,
        orderBy: orderByFor(sort),
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          lists: { select: { _count: { select: { cards: true } } } },
        },
      }),
      prisma.board.count({ where }),
      prisma.card.count({
        where: {
          workspaceId: workspace.id,
          archivedAt: null,
          dueDate: { lt: now },
          list: { name: { notIn: ["Done", "Completed", "Shipped"] } },
        },
      }),
      prisma.card.count({
        where: {
          workspaceId: workspace.id,
          archivedAt: null,
          dueDate: { gte: now, lte: soonCutoff },
          list: { name: { notIn: ["Done", "Completed", "Shipped"] } },
        },
      }),
      prisma.card.count({
        where: {
          workspaceId: workspace.id,
          archivedAt: null,
          list: { name: { in: ["Done", "Completed", "Shipped"] } },
        },
      }),
      prisma.card.count({
        where: { workspaceId: workspace.id, archivedAt: null },
      }),
      prisma.card.findMany({
        where: {
          workspaceId: workspace.id,
          assigneeId: profile.id,
          archivedAt: null,
          list: { name: { notIn: ["Done", "Completed", "Shipped"] } },
        },
        orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { updatedAt: "desc" }],
        take: 5,
        include: { list: { include: { board: true } } },
      }),
      prisma.activity.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: {
          actor: { select: { id: true, fullName: true, email: true } },
        },
      }),
    ]);

  const activityRows: ActivityRow[] = recentActivities.map((a) => ({
    id: a.id,
    type: a.type,
    createdAt: a.createdAt,
    actorName:
      a.actor?.fullName?.trim() ||
      (a.actor?.email ? a.actor.email.split("@")[0] : null),
    actorEmail: a.actor?.email ?? null,
    actorInitial: (a.actor?.fullName?.trim() || a.actor?.email || "?")
      .charAt(0)
      .toUpperCase(),
    boardId: a.boardId,
    cardId: a.cardId,
    meta: (a.meta ?? null) as Record<string, unknown> | null,
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);

  function pageHref(p: number): string {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (sort !== "recent") qs.set("sort", sort);
    if (p > 1) qs.set("page", String(p));
    return qs.toString() ? `/app?${qs.toString()}` : "/app";
  }

  function sortHref(s: SortKey): string {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (s !== "recent") qs.set("sort", s);
    return qs.toString() ? `/app?${qs.toString()}` : "/app";
  }

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-7">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#1A1A18]">Boards</h1>
          <div className="mt-1 text-[13px] text-[#6B6B66]">
            {totalCount === 0
              ? search
                ? `No boards match "${search}".`
                : `No boards yet — create your first one to get started.`
              : `${totalCount} board${totalCount === 1 ? "" : "s"} in ${workspace.name}`}
          </div>
        </div>
        <NewBoardDialog />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Overdue" value={statOverdue} dotColor="#EF4444" />
        <StatCard label="Due soon" value={statDueSoon} dotColor="#F59E0B" />
        <StatCard label="Completed" value={statCompleted} dotColor="#22C55E" />
        <StatCard label="Total tasks" value={statTotal} dotColor="#64748B" />
      </div>

      {/* My Tasks + Recent Activity split */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="My Tasks" trailing={`${myTasks.length} assigned`}>
          {myTasks.length === 0 ? (
            <EmptyLine>Nothing assigned to you right now.</EmptyLine>
          ) : (
            <div className="flex flex-col">
              {myTasks.map((card) => {
                const overdue =
                  card.dueDate && isPast(card.dueDate) && !isToday(card.dueDate);
                const soon =
                  card.dueDate &&
                  !overdue &&
                  differenceInCalendarDays(card.dueDate, now) <= 2;
                const dueColor = overdue
                  ? "#DC2626"
                  : soon
                  ? "#B45309"
                  : "#6B6B66";
                const dueLabel = card.dueDate
                  ? formatDistanceToNow(card.dueDate, { addSuffix: true })
                  : "No due date";
                const priorityColor =
                  card.priority === "urgent"
                    ? "#DC2626"
                    : card.priority === "high"
                    ? "#F97316"
                    : card.priority === "medium"
                    ? "#F59E0B"
                    : card.priority === "low"
                    ? "#64748B"
                    : "#D4D4D0";
                return (
                  <Link
                    key={card.id}
                    href={`/app/boards/${card.list.boardId}`}
                    className="flex items-center gap-3 border-b border-[#F1F0EC] py-3 last:border-b-0 hover:bg-[#FAFAF8]"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: priorityColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[#1A1A18]">
                        {card.title}
                      </div>
                      <div className="mt-0.5 text-[12px] text-[#9B9B94]">
                        {workspace.prefix}-{card.number} · {card.list.board.name} ·{" "}
                        {card.list.name}
                      </div>
                    </div>
                    <div
                      className="shrink-0 text-[12px] font-semibold"
                      style={{ color: dueColor }}
                    >
                      {dueLabel}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Panel>
        <Panel title="Recent Activity">
          {activityRows.length === 0 ? (
            <EmptyLine>Nothing to show yet.</EmptyLine>
          ) : (
            <div className="flex flex-col">
              {activityRows.map((a) => (
                <ActivityLine key={a.id} row={a} />
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* All Boards */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-[#1A1A18]">All Boards</h2>
          <div className="flex items-center gap-2">
            <BoardsSearch />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#9B9B94]">Sort:</span>
          <div className="flex items-center gap-1 rounded-lg border border-[#E7E5E0] bg-white p-0.5">
            {SORT_OPTIONS.map((opt) => (
              <Link
                key={opt.key}
                href={sortHref(opt.key)}
                className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                  sort === opt.key
                    ? "bg-[#1A1A18] text-white"
                    : "text-[#6B6B66] hover:bg-[#F3F2EE]"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {boards.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#E7E5E0] bg-white py-16 text-center">
            <LayoutIcon className="h-10 w-10 text-[#9B9B94]" />
            <div>
              <div className="font-heading text-base font-bold text-[#1A1A18]">
                {search ? "Nothing found" : "No boards here yet"}
              </div>
              <div className="mt-1 text-sm text-[#6B6B66]">
                {search
                  ? "Try a different search term."
                  : "Click New board above to create one."}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => {
              const totalCards = board.lists.reduce(
                (sum, l) => sum + l._count.cards,
                0,
              );
              return (
                <Link
                  key={board.id}
                  href={`/app/boards/${board.id}`}
                  className="rounded-2xl border border-[#E7E5E0] bg-white p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="mb-2.5 flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: boardDot(board.name) }}
                    />
                    <div className="font-heading text-[15px] font-bold text-[#1A1A18]">
                      {board.name}
                    </div>
                  </div>
                  <div className="text-xs text-[#6B6B66]">
                    {board.lists.length} list{board.lists.length === 1 ? "" : "s"} ·{" "}
                    {totalCards} card{totalCards === 1 ? "" : "s"}
                  </div>
                  <div className="mt-1 text-[11px] text-[#9B9B94]">
                    Updated {formatDistanceToNow(board.updatedAt, { addSuffix: true })}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#E7E5E0] pt-4 text-xs text-[#6B6B66]">
            <span>
              Page {clampedPage} of {totalPages} · {totalCount} total
            </span>
            <div className="flex items-center gap-1">
              {clampedPage > 1 ? (
                <Link
                  href={pageHref(clampedPage - 1)}
                  className="rounded-md border border-[#E7E5E0] bg-white px-2.5 py-1 hover:bg-[#F9F8F6]"
                >
                  ← Prev
                </Link>
              ) : (
                <span className="rounded-md border border-[#E7E5E0] bg-[#F9F8F6] px-2.5 py-1 text-[#9B9B94]">
                  ← Prev
                </span>
              )}
              {clampedPage < totalPages ? (
                <Link
                  href={pageHref(clampedPage + 1)}
                  className="rounded-md border border-[#E7E5E0] bg-white px-2.5 py-1 hover:bg-[#F9F8F6]"
                >
                  Next →
                </Link>
              ) : (
                <span className="rounded-md border border-[#E7E5E0] bg-[#F9F8F6] px-2.5 py-1 text-[#9B9B94]">
                  Next →
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  dotColor,
}: {
  label: string;
  value: number;
  dotColor: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E7E5E0] bg-white px-5 py-5">
      <div className="mb-2 flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-[11px] font-semibold tracking-wider text-[#6B6B66] uppercase">
          {label}
        </span>
      </div>
      <div className="font-heading text-3xl font-bold text-[#1A1A18]">{value}</div>
    </div>
  );
}

function Panel({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E7E5E0] bg-white p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-heading text-base font-bold text-[#1A1A18]">
          {title}
        </h3>
        {trailing && <span className="text-xs text-[#9B9B94]">{trailing}</span>}
      </div>
      {children}
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-6 text-center text-sm text-[#9B9B94]">{children}</div>
  );
}

function ActivityLine({ row }: { row: ActivityRow }) {
  const swatch = avatarSwatch(row.actorEmail ?? row.id);
  const Wrapper = row.boardId ? Link : "div";
  const wrapperProps = row.boardId
    ? { href: `/app/boards/${row.boardId}` as const }
    : {};

  return (
    <Wrapper
      {...(wrapperProps as { href: `/app/boards/${string}` })}
      className="flex items-start gap-2.5 border-b border-[#F1F0EC] py-2.5 last:border-b-0 hover:bg-[#FAFAF8]"
    >
      <span
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
        style={{ backgroundColor: swatch.bg, color: swatch.text }}
      >
        {row.actorInitial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] leading-snug text-[#1A1A18]">
          {activityText(row)}
        </div>
        <div className="mt-0.5 text-[11px] text-[#9B9B94]">
          {formatDistanceToNow(row.createdAt, { addSuffix: true })}
        </div>
      </div>
    </Wrapper>
  );
}
