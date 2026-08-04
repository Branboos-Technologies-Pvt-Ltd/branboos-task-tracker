import "server-only";
import { prisma } from "@/lib/prisma";
import type { Member } from "@/lib/members";

export async function listWorkspaceMembers(workspaceId: string): Promise<Member[]> {
  const rows = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    include: { profile: true },
  });

  return rows.map((row) => ({
    id: row.profile.id,
    email: row.profile.email,
    fullName: row.profile.fullName,
    avatarUrl: row.profile.avatarUrl,
    role: row.role as "owner" | "admin" | "member",
    joinedAt: row.joinedAt,
  }));
}
