"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";

const newBoardSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
});

export async function createBoard(formData: FormData) {
  const { profile, workspace } = await requireProfile();

  const parsed = newBoardSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const board = await prisma.board.create({
    data: {
      workspaceId: workspace.id,
      name: parsed.data.name,
      createdById: profile.id,
      lists: {
        create: [
          { name: "Todo", position: 1000 },
          { name: "In Progress", position: 2000 },
          { name: "Done", position: 3000 },
        ],
      },
    },
  });

  revalidatePath("/app");
  redirect(`/app/boards/${board.id}`);
}
