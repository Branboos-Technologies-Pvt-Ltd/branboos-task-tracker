import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace } = await requireProfile();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/app" className="flex flex-col">
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              {workspace.name}
            </p>
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Task Tracker
            </span>
          </Link>
          <form action={signOut}>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{user.email}</span>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </div>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
