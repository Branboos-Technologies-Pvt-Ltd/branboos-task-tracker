import { requireProfile } from "@/lib/auth";
import { Sidebar } from "./sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace } = await requireProfile();
  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="flex min-h-screen flex-col md:flex-row">
        <Sidebar
          workspaceName={workspace.name}
          userEmail={user.email ?? "unknown"}
          userInitial={initial}
        />
        <main className="min-w-0 flex-1 px-6 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
