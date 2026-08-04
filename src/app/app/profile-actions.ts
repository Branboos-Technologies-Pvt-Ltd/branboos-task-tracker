"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

const nameSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Please enter your name")
    .max(80, "Name is too long"),
});

export async function updateFullName(formData: FormData) {
  const user = await requireUser();
  const parsed = nameSchema.safeParse({ fullName: formData.get("fullName") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Update both the profile row (used by the app) and auth.users.user_metadata
  // (used by the auth-bridge trigger and any other Supabase integrations).
  await prisma.profile.update({
    where: { id: user.id },
    data: { fullName: parsed.data.fullName },
  });

  const supabase = await createClient();
  await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  });

  revalidatePath("/app", "layout");
  return { success: true };
}
