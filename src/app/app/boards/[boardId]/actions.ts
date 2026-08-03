"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";

async function assertBoardAccess(boardId: string) {
  const { workspace, profile } = await requireProfile();
  const board = await prisma.board.findFirst({
    where: { id: boardId, workspaceId: workspace.id },
  });
  if (!board) throw new Error("Board not found or access denied");
  return { board, profileId: profile.id };
}

const listSchema = z.object({
  name: z.string().trim().min(1).max(60),
});

export async function createList(boardId: string, formData: FormData) {
  await assertBoardAccess(boardId);
  const parsed = listSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const last = await prisma.list.findFirst({
    where: { boardId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1000;

  await prisma.list.create({
    data: { boardId, name: parsed.data.name, position },
  });

  revalidatePath(`/app/boards/${boardId}`);
}

const cardSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export async function createCard(
  boardId: string,
  listId: string,
  formData: FormData,
) {
  const { profileId } = await assertBoardAccess(boardId);
  const parsed = cardSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const last = await prisma.card.findFirst({
    where: { listId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? 0) + 1000;

  await prisma.card.create({
    data: {
      listId,
      title: parsed.data.title,
      position,
      createdById: profileId,
    },
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

export async function deleteCard(boardId: string, cardId: string) {
  await assertBoardAccess(boardId);
  await prisma.card.delete({ where: { id: cardId } });
  revalidatePath(`/app/boards/${boardId}`);
}

export async function deleteList(boardId: string, listId: string) {
  await assertBoardAccess(boardId);
  await prisma.list.delete({ where: { id: listId } });
  revalidatePath(`/app/boards/${boardId}`);
}
