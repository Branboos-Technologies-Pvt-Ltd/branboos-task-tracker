"use client";

import { useEffect, useState, useTransition } from "react";
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
import { moveCard } from "./actions";
import { AddCardForm } from "./add-card-form";
import { AddListForm } from "./add-list-form";
import { CardDialog } from "./card-dialog";
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
}: {
  boardId: string;
  initialLists: ListData[];
}) {
  const [lists, setLists] = useState<ListData[]>(initialLists);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLists(initialLists);
  }, [initialLists]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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
    <>
      <div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {lists.map((list) => (
              <ListColumn
                key={list.id}
                boardId={boardId}
                list={list}
                onCardClick={setOpenCardId}
              />
            ))}
            <AddListForm boardId={boardId} />
          </div>
          <DragOverlay>
            {activeCard && (
              <div className="w-72 rotate-2">
                <CardBody card={activeCard} elevated />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {openCard && (
        <CardDialog
          boardId={boardId}
          card={openCard}
          open={true}
          onOpenChange={(open) => {
            if (!open) setOpenCardId(null);
          }}
        />
      )}
    </>
  );
}

function ListColumn({
  boardId,
  list,
  onCardClick,
}: {
  boardId: string;
  list: ListData;
  onCardClick: (id: string) => void;
}) {
  const cardIds = list.cards.map((c) => c.id);
  const { setNodeRef, isOver } = useDroppable({ id: list.id });
  const theme = columnTheme(list.name);

  return (
    <SortableContext id={list.id} items={cardIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        data-list-id={list.id}
        className={`flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/[0.04] transition-colors dark:bg-zinc-900 dark:ring-white/[0.06] ${
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
            </span>
          </div>
          <div className="flex min-h-4 flex-col gap-2">
            {list.cards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                onClick={() => onCardClick(card.id)}
              />
            ))}
            {list.cards.length === 0 && (
              <div className="rounded-md border border-dashed border-zinc-200 py-4 text-center text-xs text-zinc-400 dark:border-zinc-700">
                Drop cards here
              </div>
            )}
          </div>
          <AddCardForm boardId={boardId} listId={list.id} />
        </div>
      </div>
    </SortableContext>
  );
}

function SortableCard({ card, onClick }: { card: CardData; onClick: () => void }) {
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
      <CardBody card={card} />
    </div>
  );
}

function CardBody({ card, elevated = false }: { card: CardData; elevated?: boolean }) {
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
          <p className="text-sm leading-snug">{card.title}</p>

          {(card.component || card.priority) && (
            <div className="flex flex-wrap gap-1">
              {card.component && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${componentColor(
                    card.component,
                  )}`}
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

          {due && (
            <div
              className={`inline-flex w-fit items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                overdue
                  ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                  : dueSoon
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              <CalendarIcon className="h-3 w-3" />
              {format(due, "MMM d")}
            </div>
          )}
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
