// Activity + notification helpers. Server-only. Called from server actions to
// keep the log up-to-date and to enqueue notifications to relevant users.
//
// Convention: activities are the workspace-wide event stream (visible to all
// members); notifications are per-user "unread" items shown in the bell
// dropdown. One user action can produce one activity + zero or many notifications.

import { prisma } from "@/lib/prisma";

export type ActivityType =
  | "card.created"
  | "card.moved"
  | "card.assigned"
  | "card.updated"
  | "card.deleted"
  | "card.commented"
  | "list.created"
  | "list.deleted"
  | "board.created"
  | "board.updated";

export async function logActivity(input: {
  workspaceId: string;
  actorId: string;
  type: ActivityType;
  boardId?: string | null;
  cardId?: string | null;
  targetUserId?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.activity.create({
      data: {
        workspaceId: input.workspaceId,
        actorId: input.actorId,
        type: input.type,
        boardId: input.boardId ?? null,
        cardId: input.cardId ?? null,
        targetUserId: input.targetUserId ?? null,
        meta: (input.meta ?? null) as never,
      },
    });
  } catch (err) {
    // Never let logging break the real action.
    console.error("[activity] logActivity failed:", err);
  }
}

export async function createNotification(input: {
  recipientId: string;
  actorId: string;
  type: "assigned" | "commented" | "mentioned";
  boardId?: string | null;
  cardId?: string | null;
  message: string;
}): Promise<void> {
  // Never notify yourself for your own action.
  if (input.recipientId === input.actorId) return;
  try {
    await prisma.notification.create({
      data: {
        recipientId: input.recipientId,
        actorId: input.actorId,
        type: input.type,
        boardId: input.boardId ?? null,
        cardId: input.cardId ?? null,
        message: input.message,
      },
    });
  } catch (err) {
    console.error("[activity] createNotification failed:", err);
  }
}
