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
import { CheckSquareIcon, MessageSquareIcon, TrashIcon } from "lucide-react";
import type { Member } from "@/lib/members";
import { avatarSwatch, memberInitials } from "@/lib/members";
import { canDeleteList, type WorkspaceRole } from "@/lib/permissions";
import { deleteList, moveCard } from "./actions";
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
  columnDot,
  type CardData,
  type LabelData,
  type ListData,
} from "./types";

export function BoardView({
  boardId,
  boardName,
  initialLists,
  members,
  currentUserId,
  currentUserRole,
  availableLabels,
}: {
  boardId: string;
  boardName: string;
  initialLists: ListData[];
  members: Member[];
  currentUserId: string;
  currentUserRole: WorkspaceRole;
  availableLabels: LabelData[];
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
      reorderedDestCards.splice((insertAt = overIndex), 0, {
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
  const openCardListName = openCard
    ? lists.find((l) => l.id === openCard.listId)?.name ?? ""
    : "";

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
          id="board-dnd"
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
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            ))}
            <AddListForm boardId={boardId} />
          </div>
          <DragOverlay>
            {activeCard && (
              <div className="w-[300px] rotate-2">
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
          boardName={boardName}
          listName={openCardListName}
          card={openCard}
          members={members}
          availableLabels={availableLabels}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
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
  currentUserId,
  currentUserRole,
}: {
  boardId: string;
  list: ListData & { totalCards: number };
  totalCards: number;
  membersById: Map<string, Member>;
  onCardClick: (id: string) => void;
  currentUserId: string;
  currentUserRole: WorkspaceRole;
}) {
  const cardIds = list.cards.map((c) => c.id);
  const { setNodeRef, isOver } = useDroppable({ id: list.id });
  const dot = columnDot(list.name);
  const hiddenByFilter = totalCards - list.cards.length;

  const canDelete = canDeleteList({
    role: currentUserRole,
    listCreatedById: list.createdById,
    currentUserId,
    cardCount: list.cardCount,
  });

  const [deletePending, startDelete] = useTransition();

  function handleDelete() {
    const message =
      list.cardCount > 0
        ? `Delete "${list.name}" and its ${list.cardCount} card${list.cardCount === 1 ? "" : "s"}? This cannot be undone.`
        : `Delete "${list.name}"?`;
    if (!confirm(message)) return;
    startDelete(async () => {
      const result = await deleteList(boardId, list.id);
      if (result && "error" in result) alert(result.error);
    });
  }

  return (
    <SortableContext id={list.id} items={cardIds} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        data-list-id={list.id}
        className={`group/list flex w-[300px] shrink-0 flex-col rounded-2xl bg-[#F3F2EE] p-3.5 transition-colors ${
          isOver ? "bg-[#E7E5E0]" : ""
        }`}
      >
        <div className="mb-3.5 flex items-center gap-2 px-1">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: dot }}
          />
          <h3 className="font-heading text-sm font-bold text-[#1A1A18]">
            {list.name}
          </h3>
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#6B6B66]">
            {list.cards.length}
            {hiddenByFilter > 0 && (
              <span className="ml-0.5 opacity-60">/{totalCards}</span>
            )}
          </span>
          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deletePending}
              title="Delete this list"
              aria-label="Delete list"
              className="ml-auto rounded-md p-1 text-[#9B9B94] opacity-0 transition-opacity hover:bg-white hover:text-[#DC2626] focus:opacity-100 group-hover/list:opacity-100 disabled:opacity-40"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2.5">
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
            <div className="rounded-lg border border-dashed border-[#D4D2CC] py-4 text-center text-xs text-[#9B9B94]">
              {hiddenByFilter > 0 ? "No matching cards" : "Drop cards here"}
            </div>
          )}
        </div>
        <div className="mt-2">
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
      className="cursor-grab select-none rounded-xl transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ACC1] active:cursor-grabbing"
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
  const dueColor = overdue ? "#DC2626" : dueSoon ? "#B45309" : "#6B6B66";

  // Support the transition: prefer the labels array, fall back to legacy component.
  const labelsToShow: { name: string; color: string }[] = card.labels.length
    ? card.labels.map((l) => ({ name: l.name, color: l.color }))
    : card.component
    ? [{ name: card.component, color: "#64748B" }]
    : [];

  return (
    <div
      className={`rounded-xl bg-white p-3.5 ${
        elevated ? "shadow-lg ring-1 ring-black/10" : "hover:shadow-sm"
      }`}
    >
      {labelsToShow.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {labelsToShow.map((lb) => (
            <LabelPill key={lb.name} name={lb.name} color={lb.color} />
          ))}
        </div>
      )}

      <div className="mb-2.5 text-sm font-semibold leading-snug text-[#1A1A18]">
        {card.title}
      </div>

      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        {priorityStyle && (
          <span
            className="inline-block rounded-md px-2 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.color }}
          >
            {priorityStyle.label}
          </span>
        )}
        {due && (
          <span className="text-[11px] font-semibold" style={{ color: dueColor }}>
            {format(due, "MMM d")}
          </span>
        )}
        {card.checklist.length > 0 && (
          <span
            className="inline-flex items-center gap-1 text-[11px] text-[#9B9B94]"
            title={`${card.checklist.filter((i) => i.done).length} of ${card.checklist.length} done`}
          >
            <CheckSquareIcon className="h-3 w-3" />
            {card.checklist.filter((i) => i.done).length}/{card.checklist.length}
          </span>
        )}
        {card.comments.length > 0 && (
          <span
            className="inline-flex items-center gap-1 text-[11px] text-[#9B9B94]"
            title={`${card.comments.length} comment${card.comments.length === 1 ? "" : "s"}`}
          >
            <MessageSquareIcon className="h-3 w-3" />
            {card.comments.length}
          </span>
        )}
        <span className="ml-auto font-mono text-[10px] text-[#9B9B94]">
          {card.key}
        </span>
      </div>

      <div className="flex justify-end">
        {assignee ? (
          <AssigneeAvatar assignee={assignee} />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-[#D4D2CC] text-[10px] text-[#9B9B94]">
            —
          </div>
        )}
      </div>
    </div>
  );
}

function LabelPill({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {name}
    </span>
  );
}

function AssigneeAvatar({ assignee }: { assignee: Member }) {
  const swatch = avatarSwatch(assignee.id || assignee.email);
  const initials = memberInitials(assignee);
  return (
    <span
      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold"
      style={{ backgroundColor: swatch.bg, color: swatch.text }}
      title={assignee.fullName ?? assignee.email}
    >
      {initials}
    </span>
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
