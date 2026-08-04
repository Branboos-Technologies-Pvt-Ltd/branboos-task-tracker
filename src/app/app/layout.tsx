import { requireProfile } from "@/lib/auth";
import { memberDisplayName, memberInitials } from "@/lib/members";
import { NamePrompt } from "./name-prompt";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, workspace } = await requireProfile();

  const email = user.email ?? "unknown";
  const memberLike = { fullName: profile.fullName, email };
  const displayName = memberDisplayName(memberLike);
  const initials = memberInitials(memberLike);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="flex min-h-screen">
        <Sidebar
          workspaceName={workspace.name}
          userDisplayName={displayName}
          userEmail={email}
          userInitials={initials}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader
            workspaceName={workspace.name}
            userDisplayName={displayName}
            userEmail={email}
            userInitials={initials}
          />
          <main className="min-w-0 flex-1 px-6 py-6 md:px-8 md:py-8">
            {!profile.fullName && <NamePrompt />}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
