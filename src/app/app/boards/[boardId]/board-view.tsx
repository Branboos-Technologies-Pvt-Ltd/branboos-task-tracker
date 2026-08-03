"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { moveCard } from "./actions";
import { AddCardForm } from "./add-card-form";
import { AddListForm } from "./add-list-form";

type CardData = { id: string; title: string; position: number; listId: string };
type ListData = { id: string; name: string; position: number; cards: CardData[] };

export function BoardView({
  boardId,
  initialLists,
}: {
  boardId: string;
  initialLists: ListData[];
}) {
  const [lists, setLists] = useState<ListData[]>(initialLists);
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const [, startTransition] = useTransition();

  // Keep local state in sync with server data when it changes
  // (e.g., after another user adds a card and revalidatePath fires).
  useEffect(() => {
    setLists(initialLists);
  }, [initialLists]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const cardById = useMemo(() => {
    const map = new Map<string, CardData>();
    for (const list of lists) for (const card of list.cards) map.set(card.id, card);
    return map;
  }, [lists]);

  const findListIdOfCard = (cardId: string): string | null => {
    for (const list of lists) {
      if (list.cards.some((c) => c.id === cardId)) return list.id;
    }
    return null;
  };

  function handleDragStart(event: DragStartEvent) {
    const card = cardById.get(String(event.active.id));
    if (card) setActiveCard(card);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeListId = findListIdOfCard(activeId);
    if (!activeListId) return;

    // over target is either a card id or a list id (drop-zone)
    const overListId = findListIdOfCard(overId) ?? overId;
    if (activeListId === overListId) return;

    setLists((prev) => {
      const activeList = prev.find((l) => l.id === activeListId);
      const overList = prev.find((l) => l.id === overListId);
      if (!activeList || !overList) return prev;

      const activeCard = activeList.cards.find((c) => c.id === activeId);
      if (!activeCard) return prev;

      const overIndex = overList.cards.findIndex((c) => c.id === overId);
      const insertAt = overIndex === -1 ? overList.cards.length : overIndex;

      return prev.map((list) => {
        if (list.id === activeListId) {
          return { ...list, cards: list.cards.filter((c) => c.id !== activeId) };
        }
        if (list.id === overListId) {
          const next = [...list.cards];
          next.splice(insertAt, 0, { ...activeCard, listId: overListId });
          return { ...list, cards: next };
        }
        return list;
      });
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const destListId = findListIdOfCardIn(lists, activeId);
    if (!destListId) return;
    const destList = lists.find((l) => l.id === destListId);
    if (!destList) return;

    const activeIndex = destList.cards.findIndex((c) => c.id === activeId);
    const overIndex = destList.cards.findIndex((c) => c.id === overId);
    if (activeIndex === -1) return;

    const insertAt =
      overIndex === -1 || activeIndex === overIndex ? activeIndex : overIndex;

    const reordered = [...destList.cards];
    const [moved] = reordered.splice(activeIndex, 1);
    reordered.splice(insertAt, 0, moved);

    const newPosition = calcPosition(reordered, insertAt);
    const finalCards = reordered.map((c, i) =>
      i === insertAt ? { ...c, position: newPosition, listId: destListId } : c,
    );

    setLists((prev) =>
      prev.map((l) => (l.id === destListId ? { ...l, cards: finalCards } : l)),
    );

    startTransition(() => {
      moveCard(boardId, {
        cardId: activeId,
        targetListId: destListId,
        targetPosition: newPosition,
      });
    });
  }

  return (
    <div className="-mx-6 overflow-x-auto px-6 pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start gap-3">
          {lists.map((list) => (
            <ListColumn key={list.id} boardId={boardId} list={list} />
          ))}
          <AddListForm boardId={boardId} />
        </div>
        <DragOverlay>
          {activeCard && (
            <div className="rotate-2 rounded-md bg-white p-2.5 text-sm text-zinc-900 shadow-lg ring-1 ring-black/10 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/20">
              {activeCard.title}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function ListColumn({ boardId, list }: { boardId: string; list: ListData }) {
  const cardIds = list.cards.map((c) => c.id);
  return (
    <SortableContext id={list.id} items={cardIds} strategy={verticalListSortingStrategy}>
      <div
        data-list-id={list.id}
        className="flex w-72 shrink-0 flex-col gap-2 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800"
      >
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {list.name}
          </h3>
          <span className="text-xs text-zinc-500">{list.cards.length}</span>
        </div>
        <div className="flex min-h-1 flex-col gap-2">
          {list.cards.map((card) => (
            <SortableCard key={card.id} card={card} />
          ))}
        </div>
        <AddCardForm boardId={boardId} listId={list.id} />
      </div>
    </SortableContext>
  );
}

function SortableCard({ card }: { card: CardData }) {
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
      className="cursor-grab rounded-md bg-white p-2.5 text-sm text-zinc-900 shadow-sm ring-1 ring-black/5 select-none active:cursor-grabbing dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10"
    >
      {card.title}
    </div>
  );
}

function findListIdOfCardIn(lists: ListData[], cardId: string): string | null {
  for (const list of lists) {
    if (list.cards.some((c) => c.id === cardId)) return list.id;
  }
  return null;
}

// Fractional positioning: place a card between its neighbours so drag-drop
// reordering never has to renumber siblings. New cards get position = last + 1000.
function calcPosition(cards: CardData[], insertAt: number): number {
  const before = cards[insertAt - 1];
  const after = cards[insertAt + 1];
  if (before && after) return (before.position + after.position) / 2;
  if (after) return after.position - 1000;
  if (before) return before.position + 1000;
  return 1000;
}
