import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireProfile() {
  const user = await requireUser();

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    include: {
      memberships: {
        include: { workspace: true },
      },
    },
  });

  if (!profile || profile.memberships.length === 0) {
    // Should not happen if the auth trigger is installed correctly.
    redirect("/login?error=no_workspace");
  }

  return {
    user,
    profile,
    workspace: profile.memberships[0].workspace,
    role: profile.memberships[0].role,
  };
}
