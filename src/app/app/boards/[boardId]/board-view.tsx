"use client";

import { useEffect, useState, useTransition } from "react";
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

    // Resolve destination: `over` can be another card id OR a list id (empty column).
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

  return (
    <div className="-mx-6 overflow-x-auto px-6 pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
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
  const { setNodeRef, isOver } = useDroppable({ id: list.id });

  return (
    <SortableContext id={list.id} items={cardIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        data-list-id={list.id}
        className={`flex w-72 shrink-0 flex-col gap-2 rounded-lg p-3 transition-colors ${
          isOver
            ? "bg-zinc-200 dark:bg-zinc-700"
            : "bg-zinc-100 dark:bg-zinc-800"
        }`}
      >
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            {list.name}
          </h3>
          <span className="text-xs text-zinc-500">{list.cards.length}</span>
        </div>
        <div className="flex min-h-4 flex-col gap-2">
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

// Fractional positioning: dropped cards land between their neighbours so drag-drop
// reordering never has to renumber siblings. New cards get position = last + 1000.
function calcPosition(cards: CardData[], insertAt: number): number {
  const before = cards[insertAt - 1];
  const after = cards[insertAt + 1];
  if (before && after) return (before.position + after.position) / 2;
  if (after) return after.position - 1000;
  if (before) return before.position + 1000;
  return 1000;
}
