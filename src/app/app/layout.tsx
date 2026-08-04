import { requireProfile } from "@/lib/auth";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace } = await requireProfile();
  const initial = (user.email ?? "?").charAt(0).toUpperCase();
  const email = user.email ?? "unknown";

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="flex min-h-screen">
        <Sidebar
          workspaceName={workspace.name}
          userEmail={email}
          userInitial={initial}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopHeader
            workspaceName={workspace.name}
            userInitial={initial}
            userEmail={email}
          />
          <main className="min-w-0 flex-1 px-6 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
