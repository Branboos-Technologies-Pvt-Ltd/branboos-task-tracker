import { prisma } from "@/lib/prisma";

export type NotificationRow = {
  id: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  type: string;
  boardId: string | null;
  cardId: string | null;
  message: string;
  readAt: Date | null;
  createdAt: Date;
};

export async function listNotifications(
  recipientId: string,
  limit = 20,
): Promise<{ items: NotificationRow[]; unreadCount: number }> {
  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: { select: { id: true, fullName: true, email: true } },
      },
    }),
    prisma.notification.count({
      where: { recipientId, readAt: null },
    }),
  ]);

  return {
    items: items.map((n) => ({
      id: n.id,
      actorId: n.actorId,
      actorName: n.actor?.fullName ?? null,
      actorEmail: n.actor?.email ?? null,
      type: n.type,
      boardId: n.boardId,
      cardId: n.cardId,
      message: n.message,
      readAt: n.readAt,
      createdAt: n.createdAt,
    })),
    unreadCount,
  };
}
