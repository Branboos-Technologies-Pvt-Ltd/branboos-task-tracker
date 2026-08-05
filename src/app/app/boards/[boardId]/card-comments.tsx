"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { TrashIcon } from "lucide-react";
import type { Member } from "@/lib/members";
import { avatarSwatch, memberDisplayName, memberInitials } from "@/lib/members";
import { addComment, deleteComment } from "./actions";
import type { CommentData } from "./types";

export function CardComments({
  boardId,
  cardId,
  comments,
  members,
  currentUserId,
  currentUserRole,
}: {
  boardId: string;
  cardId: string;
  comments: CommentData[];
  members: Member[];
  currentUserId: string;
  currentUserRole: "owner" | "admin" | "member";
}) {
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();
  const membersById = new Map(members.map((m) => [m.id, m]));

  function submit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const fd = new FormData();
    fd.set("body", trimmed);
    startTransition(async () => {
      await addComment(boardId, cardId, fd);
      setDraft("");
    });
  }

  return (
    <section>
      <div className="mb-2.5 text-[13px] font-bold text-[#1A1A18]">
        Comments {comments.length > 0 && <span className="text-[#9B9B94]">· {comments.length}</span>}
      </div>

      <div className="flex flex-col gap-2">
        {comments.map((c) => {
          const author = membersById.get(c.authorId);
          const canDelete =
            c.authorId === currentUserId ||
            currentUserRole === "owner" ||
            currentUserRole === "admin";
          return (
            <CommentRow
              key={c.id}
              boardId={boardId}
              comment={c}
              author={author}
              canDelete={canDelete}
            />
          );
        })}
        {comments.length === 0 && (
          <div className="py-1 text-xs text-[#9B9B94]">No comments yet.</div>
        )}
      </div>

      {/* NOT a <form> — rendered inside the card-dialog's outer form; HTML
          forbids nesting. Submit via button onClick + Enter key, both stopping
          propagation so the outer form's Save doesn't fire. */}
      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
              submit();
            }
          }}
          placeholder="Add a comment..."
          disabled={pending}
          className="flex-1 rounded-lg border border-[#E7E5E0] bg-[#F9F8F6] px-3.5 py-2.5 text-sm outline-none focus:border-[#00ACC1]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending || !draft.trim()}
          className="rounded-lg bg-[#1A1A18] px-4 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Posting..." : "Comment"}
        </button>
      </div>
    </section>
  );
}

function CommentRow({
  boardId,
  comment,
  author,
  canDelete,
}: {
  boardId: string;
  comment: CommentData;
  author: Member | undefined;
  canDelete: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const swatch = author
    ? avatarSwatch(author.id || author.email)
    : { bg: "#F3F2EE", text: "#6B6B66" };
  const initial = author ? memberInitials(author) : "?";
  const name = author ? memberDisplayName(author) : "Unknown";

  function remove() {
    if (!confirm("Delete this comment?")) return;
    startTransition(async () => {
      await deleteComment(boardId, comment.id);
    });
  }

  return (
    <div className="group/comment flex gap-2.5">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
        style={{ backgroundColor: swatch.bg, color: swatch.text }}
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-[#1A1A18]">{name}</span>
          <span className="text-[11px] text-[#9B9B94]">
            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
          </span>
          {canDelete && (
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="ml-auto rounded p-0.5 text-[#9B9B94] opacity-0 transition-opacity hover:bg-[#F3F2EE] hover:text-[#DC2626] group-hover/comment:opacity-100"
              aria-label="Delete comment"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="mt-0.5 text-[13px] whitespace-pre-wrap text-[#3F3F3A]">
          {comment.body}
        </div>
      </div>
    </div>
  );
}
