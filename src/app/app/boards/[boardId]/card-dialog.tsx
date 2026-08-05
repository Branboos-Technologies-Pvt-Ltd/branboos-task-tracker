"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import type { Member } from "@/lib/members";
import { avatarSwatch, memberDisplayName, memberInitials } from "@/lib/members";
import type { WorkspaceRole } from "@/lib/permissions";
import { deleteCard, updateCard } from "./actions";
import { CardChecklist } from "./card-checklist";
import { CardComments } from "./card-comments";
import { LabelPicker } from "./label-picker";
import { PRIORITY_STYLES, type CardData, type LabelData } from "./types";

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return format(d, "yyyy-MM-dd");
}

const PRIORITY_OPTIONS = [
  { value: "", label: "— None —" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function CardDialog({
  boardId,
  card,
  members,
  availableLabels,
  currentUserId,
  currentUserRole,
  listName,
  boardName,
  open,
  onOpenChange,
}: {
  boardId: string;
  card: CardData;
  members: Member[];
  availableLabels: LabelData[];
  currentUserId: string;
  currentUserRole: WorkspaceRole;
  listName: string;
  boardName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<LabelData[]>(card.labels);

  const assignee = card.assigneeId
    ? members.find((m) => m.id === card.assigneeId) ?? null
    : null;
  const priorityStyle = card.priority ? PRIORITY_STYLES[card.priority] : null;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updateCard(boardId, card.id, formData);
      if (result?.error) setError(result.error);
      else onOpenChange(false);
    });
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-40 bg-[#141412]/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[86vh] w-[calc(100%-2rem)] max-w-[820px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#E7E5E0] px-7 py-5">
            <div className="text-[12px] text-[#9B9B94]">
              {boardName} / {listName} ·{" "}
              <span className="font-mono font-bold text-[#6B6B66]">
                {card.key}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B6B66] hover:bg-[#F3F2EE]"
              aria-label="Close"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Body — split */}
          <form
            action={handleSubmit}
            className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row"
          >
            {/* Left panel */}
            <div className="min-h-0 flex-[1.6] overflow-y-auto border-b border-[#E7E5E0] p-7 md:border-r md:border-b-0">
              <input
                type="text"
                name="title"
                defaultValue={card.title}
                required
                disabled={pending}
                className="font-heading mb-3 w-full border-0 border-b border-transparent bg-transparent p-0 pb-1 text-xl font-bold text-[#1A1A18] outline-none hover:border-[#E7E5E0] focus:border-[#00ACC1]"
              />

              <textarea
                name="description"
                defaultValue={card.description ?? ""}
                placeholder="Add a description — details, links, acceptance criteria..."
                rows={3}
                disabled={pending}
                className="mb-6 w-full resize-y rounded-md border border-transparent bg-transparent p-0 text-sm leading-relaxed text-[#3F3F3A] outline-none placeholder:text-[#9B9B94] hover:border-[#E7E5E0] focus:border-[#00ACC1]"
              />

              <div className="mb-6">
                <CardChecklist
                  boardId={boardId}
                  cardId={card.id}
                  items={card.checklist}
                />
              </div>

              <CardComments
                boardId={boardId}
                cardId={card.id}
                comments={card.comments}
                members={members}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            </div>

            {/* Right panel */}
            <aside className="flex min-h-0 w-full flex-shrink-0 flex-col gap-5 overflow-y-auto bg-[#FAFAF9] p-7 md:w-[280px]">
              {/* Assignee — select */}
              <div>
                <SectionLabel>Assignee</SectionLabel>
                <div className="flex items-center gap-2">
                  {assignee ? (
                    <AssigneeChip assignee={assignee} />
                  ) : (
                    <span className="text-[13px] text-[#9B9B94]">Unassigned</span>
                  )}
                </div>
                <select
                  name="assigneeId"
                  defaultValue={card.assigneeId ?? ""}
                  disabled={pending}
                  className="mt-2 w-full rounded-md border border-[#E7E5E0] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[#00ACC1]"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {memberDisplayName(m)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <SectionLabel>Priority</SectionLabel>
                {priorityStyle && (
                  <span
                    className="mb-2 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      backgroundColor: priorityStyle.bg,
                      color: priorityStyle.color,
                    }}
                  >
                    {priorityStyle.label}
                  </span>
                )}
                <select
                  name="priority"
                  defaultValue={card.priority ?? ""}
                  disabled={pending}
                  className="w-full rounded-md border border-[#E7E5E0] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[#00ACC1]"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <SectionLabel>Start date</SectionLabel>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={toDateInput(card.startDate)}
                    disabled={pending}
                    className="w-full rounded-md border border-[#E7E5E0] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[#00ACC1]"
                  />
                </div>
                <div>
                  <SectionLabel>Due date</SectionLabel>
                  <input
                    type="date"
                    name="dueDate"
                    defaultValue={toDateInput(card.dueDate)}
                    disabled={pending}
                    className="w-full rounded-md border border-[#E7E5E0] bg-white px-2.5 py-1.5 text-[13px] outline-none focus:border-[#00ACC1]"
                  />
                </div>
              </div>

              {/* Labels */}
              <div>
                <SectionLabel>Labels</SectionLabel>
                <LabelPicker
                  boardId={boardId}
                  cardId={card.id}
                  availableLabels={availableLabels}
                  selectedLabels={selectedLabels}
                  onChange={setSelectedLabels}
                />
              </div>

              {/* Save / Delete actions */}
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="mt-auto flex flex-col gap-2 border-t border-[#E7E5E0] pt-4">
                <button
                  type="submit"
                  disabled={pending || deleting}
                  className="w-full rounded-lg bg-[#1A1A18] py-2.5 text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {pending ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  disabled={pending || deleting}
                  onClick={() => {
                    if (!confirm("Delete this card? This cannot be undone."))
                      return;
                    startDelete(async () => {
                      await deleteCard(boardId, card.id);
                      onOpenChange(false);
                    });
                  }}
                  className="w-full rounded-lg py-2 text-[12px] font-semibold text-[#DC2626] hover:bg-[#FEF2F2] disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete card"}
                </button>
              </div>
            </aside>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-bold tracking-wider text-[#9B9B94] uppercase">
      {children}
    </div>
  );
}

function AssigneeChip({ assignee }: { assignee: Member }) {
  const swatch = avatarSwatch(assignee.id || assignee.email);
  const initials = memberInitials(assignee);
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold"
        style={{ backgroundColor: swatch.bg, color: swatch.text }}
      >
        {initials}
      </span>
      <span className="text-[13px] font-semibold text-[#1A1A18]">
        {memberDisplayName(assignee)}
      </span>
    </div>
  );
}
