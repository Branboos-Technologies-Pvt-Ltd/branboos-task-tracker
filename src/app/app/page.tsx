import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { LayoutIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { boardGradient } from "@/lib/board-gradients";
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
  const { workspace } = await requireProfile();
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

  const [boards, totalCount] = await Promise.all([
    prisma.board.findMany({
      where,
      orderBy: orderByFor(sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        _count: { select: { lists: true } },
        lists: {
          select: { _count: { select: { cards: true } } },
        },
      },
    }),
    prisma.board.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);

  function pageHref(p: number, extraKey?: string, extraVal?: string): string {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (sort !== "recent") qs.set("sort", sort);
    if (p > 1) qs.set("page", String(p));
    if (extraKey && extraVal) qs.set(extraKey, extraVal);
    return qs.toString() ? `/app?${qs.toString()}` : "/app";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Boards
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {totalCount === 0
              ? search
                ? `No boards match "${search}".`
                : "No boards yet — create your first one to get started."
              : `${totalCount} board${totalCount === 1 ? "" : "s"} in ${workspace.name}`}
          </p>
        </div>
        <NewBoardDialog />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <BoardsSearch />
        <SortDropdown sort={sort} makeHref={(s) => sortHref(search, s)} />
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-white/60 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
          <LayoutIcon className="h-10 w-10 text-zinc-400" />
          <div>
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              {search ? "Nothing found" : "No boards here yet"}
            </p>
            <p className="text-sm text-zinc-500">
              {search
                ? "Try a different search term."
                : "Click New board above to create one."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => {
              const totalCards = board.lists.reduce(
                (sum, l) => sum + l._count.cards,
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              <span>
                Page {clampedPage} of {totalPages} · {totalCount} total
              </span>
              <div className="flex items-center gap-1">
                {clampedPage > 1 ? (
                  <Link
                    href={pageHref(clampedPage - 1)}
                    className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    ← Prev
                  </Link>
                ) : (
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50">
                    ← Prev
                  </span>
                )}
                {clampedPage < totalPages ? (
                  <Link
                    href={pageHref(clampedPage + 1)}
                    className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50">
                    Next →
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function sortHref(search: string, sort: SortKey): string {
  const qs = new URLSearchParams();
  if (search) qs.set("search", search);
  if (sort !== "recent") qs.set("sort", sort);
  return qs.toString() ? `/app?${qs.toString()}` : "/app";
}

function SortDropdown({
  sort,
  makeHref,
}: {
  sort: SortKey;
  makeHref: (s: SortKey) => string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-zinc-500">Sort:</span>
      <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
        {SORT_OPTIONS.map((opt) => (
          <Link
            key={opt.key}
            href={makeHref(opt.key)}
            className={`rounded px-2 py-1 font-medium transition-colors ${
              sort === opt.key
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
