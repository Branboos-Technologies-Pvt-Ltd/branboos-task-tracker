"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { differenceInCalendarDays, format, isPast, isToday } from "date-fns";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarIcon } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { Member } from "@/lib/members";
import { moveCard } from "./actions";
import { AddCardForm } from "./add-card-form";
import { AddListForm } from "./add-list-form";
import { CardDialog } from "./card-dialog";
import {
  FilterBar,
  cardMatches,
  emptyFilters,
  type BoardFilters,
} from "./filter-bar";
import {
  PRIORITY_STYLES,
  columnTheme,
  componentColor,
  type CardData,
  type ListData,
} from "./types";

export function BoardView({
  boardId,
  initialLists,
  members,
  currentUserId,
}: {
  boardId: string;
  initialLists: ListData[];
  members: Member[];
  currentUserId: string;
}) {
  const [lists, setLists] = useState<ListData[]>(initialLists);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [filters, setFilters] = useState<BoardFilters>(emptyFilters);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLists(initialLists);
  }, [initialLists]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const membersById = useMemo(() => {
    const map = new Map<string, Member>();
    for (const m of members) map.set(m.id, m);
    return map;
  }, [members]);

  const filteredLists = useMemo(
    () =>
      lists.map((list) => ({
        ...list,
        cards: list.cards.filter((c) => cardMatches(c, filters)),
        totalCards: list.cards.length,
      })),
    [lists, filters],
  );

  function findCard(id: string): { card: CardData; listId: string } | null {
    for (const list of lists) {
      const card = list.cards.find((c) => c.id === id);
      if (card) return { card, listId: list.id };
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const found = findCard(String(event.active.id));
    if (found) setActiveCard(found.card);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const source = findCard(activeId);
    if (!source) return;

    const overCard = findCard(overId);
    const destListId = overCard?.listId ?? overId;
    const destList = lists.find((l) => l.id === destListId);
    if (!destList) return;

    const sameList = source.listId === destListId;

    let reorderedDestCards: CardData[];
    let insertAt: number;

    if (sameList) {
      const activeIndex = destList.cards.findIndex((c) => c.id === activeId);
      const overIndex = overCard
        ? destList.cards.findIndex((c) => c.id === overId)
        : destList.cards.length - 1;
      if (activeIndex === overIndex) return;
      reorderedDestCards = arrayMove(destList.cards, activeIndex, overIndex);
      insertAt = overIndex;
    } else {
      const overIndex = overCard
        ? destList.cards.findIndex((c) => c.id === overId)
        : destList.cards.length;
      reorderedDestCards = [...destList.cards];
      reorderedDestCards.splice(insertAt = overIndex, 0, {
        ...source.card,
        listId: destListId,
      });
    }

    const newPosition = calcPosition(reorderedDestCards, insertAt);
    const finalDestCards = reorderedDestCards.map((c, i) =>
      i === insertAt ? { ...c, position: newPosition, listId: destListId } : c,
    );

    setLists((prev) =>
      prev.map((l) => {
        if (l.id === destListId) return { ...l, cards: finalDestCards };
        if (!sameList && l.id === source.listId) {
          return { ...l, cards: l.cards.filter((c) => c.id !== activeId) };
        }
        return l;
      }),
    );

    startTransition(() => {
      moveCard(boardId, {
        cardId: activeId,
        targetListId: destListId,
        targetPosition: newPosition,
      });
    });
  }

  const openCard =
    openCardId != null
      ? lists.flatMap((l) => l.cards).find((c) => c.id === openCardId) ?? null
      : null;

  return (
    <div className="flex flex-col gap-4">
      <FilterBar
        members={members}
        currentUserId={currentUserId}
        filters={filters}
        onChange={setFilters}
      />

      <div className="scroll-hide -mx-6 overflow-x-auto px-6 pb-3 md:-mx-8 md:px-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-start gap-4">
            {filteredLists.map((list) => (
              <ListColumn
                key={list.id}
                boardId={boardId}
                list={list}
                totalCards={list.totalCards}
                membersById={membersById}
                onCardClick={setOpenCardId}
              />
            ))}
            <AddListForm boardId={boardId} />
          </div>
          <DragOverlay>
            {activeCard && (
              <div className="w-72 rotate-2">
                <CardBody
                  card={activeCard}
                  assignee={
                    activeCard.assigneeId
                      ? membersById.get(activeCard.assigneeId) ?? null
                      : null
                  }
                  elevated
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {openCard && (
        <CardDialog
          boardId={boardId}
          card={openCard}
          members={members}
          open={true}
          onOpenChange={(open) => {
            if (!open) setOpenCardId(null);
          }}
        />
      )}
    </div>
  );
}

function ListColumn({
  boardId,
  list,
  totalCards,
  membersById,
  onCardClick,
}: {
  boardId: string;
  list: ListData;
  totalCards: number;
  membersById: Map<string, Member>;
  onCardClick: (id: string) => void;
}) {
  const cardIds = list.cards.map((c) => c.id);
  const { setNodeRef, isOver } = useDroppable({ id: list.id });
  const theme = columnTheme(list.name);
  const hiddenByFilter = totalCards - list.cards.length;

  return (
    <SortableContext id={list.id} items={cardIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        data-list-id={list.id}
        className={`flex w-72 shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/[0.04] transition-colors dark:bg-zinc-900 dark:ring-white/[0.06] ${
          isOver ? theme.droppableBg : ""
        }`}
      >
        <div className={`h-1 w-full ${theme.accentBar}`} />
        <div className="flex flex-col gap-2 p-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${theme.headerDot}`} />
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {list.name}
              </h3>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${theme.countBadge}`}
            >
              {list.cards.length}
              {hiddenByFilter > 0 && (
                <span className="ml-1 opacity-60">/{totalCards}</span>
              )}
            </span>
          </div>
          <div className="flex min-h-4 flex-col gap-2">
            {list.cards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                assignee={
                  card.assigneeId ? membersById.get(card.assigneeId) ?? null : null
                }
                onClick={() => onCardClick(card.id)}
              />
            ))}
            {list.cards.length === 0 && (
              <div className="rounded-md border border-dashed border-zinc-200 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700">
                {hiddenByFilter > 0 ? "No matching cards" : "Drop cards here"}
              </div>
            )}
          </div>
          <AddCardForm boardId={boardId} listId={list.id} />
        </div>
      </div>
    </SortableContext>
  );
}

function SortableCard({
  card,
  assignee,
  onClick,
}: {
  card: CardData;
  assignee: Member | null;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      role="button"
      tabIndex={0}
      className="cursor-grab select-none rounded-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 hover:-translate-y-0.5 active:cursor-grabbing"
    >
      <CardBody card={card} assignee={assignee} />
    </div>
  );
}

function CardBody({
  card,
  assignee,
  elevated = false,
}: {
  card: CardData;
  assignee: Member | null;
  elevated?: boolean;
}) {
  const priorityStyle = card.priority ? PRIORITY_STYLES[card.priority] : null;
  const due = card.dueDate;
  const overdue = due && isPast(due) && !isToday(due);
  const dueSoon = due && !overdue && differenceInCalendarDays(due, new Date()) <= 2;

  return (
    <div
      className={`overflow-hidden rounded-md bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 ${
        elevated
          ? "shadow-lg ring-1 ring-black/10 dark:ring-white/20"
          : "shadow-sm ring-1 ring-black/5 hover:ring-black/10 dark:ring-white/10 dark:hover:ring-white/20"
      }`}
    >
      <div className="flex">
        {priorityStyle && <div className={`w-1 shrink-0 ${priorityStyle.bar}`} />}
        <div className="flex flex-1 flex-col gap-2 p-2.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-snug text-zinc-900 dark:text-zinc-100">
              {card.title}
            </p>
            {assignee && <Avatar member={assignee} size="xs" />}
          </div>

          {(card.component || card.priority) && (
            <div className="flex flex-wrap gap-1">
              {card.component && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${componentColor(card.component)}`}
                >
                  {card.component}
                </span>
              )}
              {priorityStyle && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${priorityStyle.tag}`}
                >
                  {priorityStyle.label}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            <span className="font-mono text-[10px] text-zinc-500">{card.key}</span>
            {due && (
              <span
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                  overdue
                    ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                    : dueSoon
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                <CalendarIcon className="h-3 w-3" />
                {format(due, "MMM d")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function calcPosition(cards: CardData[], insertAt: number): number {
  const before = cards[insertAt - 1];
  const after = cards[insertAt + 1];
  if (before && after) return (before.position + after.position) / 2;
  if (after) return after.position - 1000;
  if (before) return before.position + 1000;
  return 1000;
}
