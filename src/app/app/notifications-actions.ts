"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";

export async function markAllNotificationsRead() {
  const { profile } = await requireProfile();
  await prisma.notification.updateMany({
    where: { recipientId: profile.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/app", "layout");
}

export async function markNotificationRead(notificationId: string) {
  const { profile } = await requireProfile();
  await prisma.notification.updateMany({
    where: { id: notificationId, recipientId: profile.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/app", "layout");
}
