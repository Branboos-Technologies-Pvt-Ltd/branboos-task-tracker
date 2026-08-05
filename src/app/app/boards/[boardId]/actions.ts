"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CardPriority } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { canDeleteList, type WorkspaceRole } from "@/lib/permissions";

async function assertBoardAccess(boardId: string) {
  const { workspace, profile, role } = await requireProfile();
  const board = await prisma.board.findFirst({
    where: { id: boardId, workspaceId: workspace.id },
  });
  if (!board) throw new Error("Board not found or access denied");
  return {
    board,
    profileId: profile.id,
    workspaceId: workspace.id,
    role: role as WorkspaceRole,
  };
}

const listSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export async function createList(boardId: string, formData: FormData) {
  const { profileId } = await assertBoardAccess(boardId);
  const parsed = listSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const last = await prisma.list.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1000;

  await prisma.list.create({
    data: {
      boardId,
      name: parsed.data.name,
      position,
      createdById: profileId,
    },
  });

  revalidatePath(`/app/boards/${boardId}`);
}

const cardCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export async function createCard(
  boardId: string,
  listId: string,
  formData: FormData,
) {
  const { profileId, workspaceId } = await assertBoardAccess(boardId);
  const parsed = cardCreateSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const last = await prisma.card.findFirst({
    where: { listId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1000;

  await prisma.$transaction(async (tx) => {
    const seq = await tx.workspaceCardSequence.upsert({
      where: { workspaceId },
      update: { lastNumber: { increment: 1 } },
      create: { workspaceId, lastNumber: 1 },
    });

    await tx.card.create({
      data: {
        workspaceId,
        number: seq.lastNumber,
        listId,
        title: parsed.data.title,
        position,
        createdById: profileId,
      },
    });
  });

  revalidatePath(`/app/boards/${boardId}`);
}

const moveCardSchema = z.object({
  cardId: z.string().uuid(),
  targetListId: z.string().uuid(),
  targetPosition: z.number(),
});

export async function moveCard(
  boardId: string,
  input: z.input<typeof moveCardSchema>,
) {
  await assertBoardAccess(boardId);
  const parsed = moveCardSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid move" };

  await prisma.card.update({
    where: { id: parsed.data.cardId },
    data: {
      listId: parsed.data.targetListId,
      position: parsed.data.targetPosition,
    },
  });

  revalidatePath(`/app/boards/${boardId}`);
}

const PRIORITY_VALUES = ["low", "medium", "high", "urgent"] as const;

function readString(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function readDate(formData: FormData, key: string): Date | null | { error: string } {
  const v = readString(formData, key);
  if (v === null) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return { error: `Invalid ${key}` };
  return d;
}

export async function updateCard(
  boardId: string,
  cardId: string,
  formData: FormData,
) {
  await assertBoardAccess(boardId);

  const title = readString(formData, "title");
  if (!title) return { error: "Title is required" };
  if (title.length > 200) return { error: "Title is too long" };

  const description = readString(formData, "description");
  const component = readString(formData, "component");

  const priorityRaw = readString(formData, "priority");
  const priority =
    priorityRaw && (PRIORITY_VALUES as readonly string[]).includes(priorityRaw)
      ? (priorityRaw as CardPriority)
      : null;

  const startDate = readDate(formData, "startDate");
  if (startDate && "error" in startDate) return startDate;

  const dueDate = readDate(formData, "dueDate");
  if (dueDate && "error" in dueDate) return dueDate;

  const assigneeRaw = readString(formData, "assigneeId");
  const assigneeId =
    assigneeRaw && /^[0-9a-f-]{36}$/i.test(assigneeRaw) ? assigneeRaw : null;

  try {
    await prisma.card.update({
      where: { id: cardId },
      data: {
        title,
        description,
        component,
        priority,
        startDate: startDate as Date | null,
        dueDate: dueDate as Date | null,
        assigneeId,
      },
    });
  } catch (err) {
    console.error("updateCard failed:", err);
    return {
      error: err instanceof Error ? err.message : "Failed to save changes",
    };
  }

  revalidatePath(`/app/boards/${boardId}`);
}

export async function deleteCard(boardId: string, cardId: string) {
  await assertBoardAccess(boardId);
  await prisma.card.delete({ where: { id: cardId } });
  revalidatePath(`/app/boards/${boardId}`);
}

export async function deleteList(boardId: string, listId: string) {
  const { profileId, role } = await assertBoardAccess(boardId);

  const list = await prisma.list.findFirst({
    where: { id: listId, boardId },
    select: {
      createdById: true,
      _count: { select: { cards: true } },
    },
  });
  if (!list) return { error: "List not found" };

  const allowed = canDeleteList({
    role,
    listCreatedById: list.createdById,
    currentUserId: profileId,
    cardCount: list._count.cards,
  });

  if (!allowed) {
    return {
      error:
        list._count.cards > 0
          ? "This list has cards. Only an admin or owner can delete it."
          : "Only the creator or an admin/owner can delete this list.",
    };
  }

  await prisma.list.delete({ where: { id: listId } });
  revalidatePath(`/app/boards/${boardId}`);
}

const labelInputSchema = z.object({
  cardId: z.string().uuid(),
  labelIds: z.array(z.string().uuid()).max(20),
});

export async function setCardLabels(
  boardId: string,
  input: z.input<typeof labelInputSchema>,
) {
  const { workspaceId } = await assertBoardAccess(boardId);
  const parsed = labelInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid labels" };

  // Validate every label belongs to this workspace (prevents cross-workspace label injection)
  if (parsed.data.labelIds.length > 0) {
    const validCount = await prisma.label.count({
      where: {
        id: { in: parsed.data.labelIds },
        workspaceId,
      },
    });
    if (validCount !== parsed.data.labelIds.length) {
      return { error: "One or more labels are invalid" };
    }
  }

  await prisma.$transaction([
    prisma.cardLabel.deleteMany({ where: { cardId: parsed.data.cardId } }),
    ...(parsed.data.labelIds.length > 0
      ? [
          prisma.cardLabel.createMany({
            data: parsed.data.labelIds.map((labelId) => ({
              cardId: parsed.data.cardId,
              labelId,
            })),
          }),
        ]
      : []),
  ]);

  revalidatePath(`/app/boards/${boardId}`);
}

/* ---------- Checklist items ---------- */

const checklistTextSchema = z.string().trim().min(1).max(300);

export async function addChecklistItem(
  boardId: string,
  cardId: string,
  formData: FormData,
) {
  const { profileId } = await assertBoardAccess(boardId);
  const parsed = checklistTextSchema.safeParse(formData.get("text"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const last = await prisma.cardChecklistItem.findFirst({
    where: { cardId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  await prisma.cardChecklistItem.create({
    data: {
      cardId,
      text: parsed.data,
      position: (last?.position ?? 0) + 1000,
      createdById: profileId,
    },
  });

  revalidatePath(`/app/boards/${boardId}`);
}

export async function toggleChecklistItem(
  boardId: string,
  itemId: string,
  done: boolean,
) {
  const { profileId } = await assertBoardAccess(boardId);
  await prisma.cardChecklistItem.update({
    where: { id: itemId },
    data: {
      done,
      doneAt: done ? new Date() : null,
      doneById: done ? profileId : null,
    },
  });
  revalidatePath(`/app/boards/${boardId}`);
}

export async function updateChecklistItemText(
  boardId: string,
  itemId: string,
  formData: FormData,
) {
  await assertBoardAccess(boardId);
  const parsed = checklistTextSchema.safeParse(formData.get("text"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.cardChecklistItem.update({
    where: { id: itemId },
    data: { text: parsed.data },
  });
  revalidatePath(`/app/boards/${boardId}`);
}

export async function deleteChecklistItem(boardId: string, itemId: string) {
  await assertBoardAccess(boardId);
  await prisma.cardChecklistItem.delete({ where: { id: itemId } });
  revalidatePath(`/app/boards/${boardId}`);
}

/* ---------- Comments ---------- */

const commentSchema = z.string().trim().min(1).max(2000);

export async function addComment(
  boardId: string,
  cardId: string,
  formData: FormData,
) {
  const { profileId } = await assertBoardAccess(boardId);
  const parsed = commentSchema.safeParse(formData.get("body"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.comment.create({
    data: {
      cardId,
      authorId: profileId,
      body: parsed.data,
    },
  });
  revalidatePath(`/app/boards/${boardId}`);
}

export async function deleteComment(boardId: string, commentId: string) {
  const { profileId, role } = await assertBoardAccess(boardId);
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });
  if (!comment) return { error: "Comment not found" };

  const canDelete =
    comment.authorId === profileId || role === "owner" || role === "admin";
  if (!canDelete) return { error: "You can only delete your own comments" };

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/app/boards/${boardId}`);
}

/* ---------- Labels ---------- */

const createLabelSchema = z.object({
  name: z.string().trim().min(1).max(30),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a hex like #3B82F6"),
});

export async function createLabel(
  boardId: string,
  formData: FormData,
): Promise<{ id: string; name: string; color: string } | { error: string }> {
  const { workspaceId } = await assertBoardAccess(boardId);
  const parsed = createLabelSchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const label = await prisma.label.create({
      data: {
        workspaceId,
        name: parsed.data.name,
        color: parsed.data.color,
      },
    });
    revalidatePath(`/app/boards/${boardId}`);
    return { id: label.id, name: label.name, color: label.color };
  } catch (err) {
    // Unique constraint (workspace_id, name) — label already exists
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "P2002"
    ) {
      const existing = await prisma.label.findFirst({
        where: { workspaceId, name: parsed.data.name },
      });
      if (existing)
        return { id: existing.id, name: existing.name, color: existing.color };
    }
    console.error("createLabel failed:", err);
    return { error: "Failed to create label" };
  }
}
