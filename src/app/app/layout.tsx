import { prisma } from "@/lib/prisma";
import { requireProfile } from "@/lib/auth";
import { memberDisplayName, memberInitials } from "@/lib/members";
import { listNotifications } from "@/lib/notifications.server";
import { NamePrompt } from "./name-prompt";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

// How many boards to show in the sidebar quick-access list.
const SIDEBAR_BOARDS_LIMIT = 8;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, workspace } = await requireProfile();

  const email = user.email ?? "unknown";
  const memberLike = { fullName: profile.fullName, email };
  const displayName = memberDisplayName(memberLike);
  const initials = memberInitials(memberLike);

  const [recentBoards, totalBoards, notifications] = await Promise.all([
    prisma.board.findMany({
      where: { workspaceId: workspace.id, archivedAt: null },
      orderBy: { updatedAt: "desc" },
      take: SIDEBAR_BOARDS_LIMIT,
      select: { id: true, name: true },
    }),
    prisma.board.count({
      where: { workspaceId: workspace.id, archivedAt: null },
    }),
    listNotifications(profile.id, 20),
  ]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="flex min-h-screen">
        <Sidebar
          workspaceName={workspace.name}
          recentBoards={recentBoards}
          totalBoards={totalBoards}
          boardsListLimit={SIDEBAR_BOARDS_LIMIT}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader
            workspaceName={workspace.name}
            userDisplayName={displayName}
            userEmail={email}
            userInitials={initials}
            notifications={notifications.items}
            unreadCount={notifications.unreadCount}
          />
          <main className="min-w-0 flex-1 px-6 py-8 md:px-8">
            {!profile.fullName && <NamePrompt />}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
