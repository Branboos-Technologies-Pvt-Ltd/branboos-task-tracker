import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function AppHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex flex-col">
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Branboos
            </p>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Task Tracker
            </h1>
          </div>
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
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            You&rsquo;re signed in
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Boards and cards are coming next. Your Branboos workspace is ready.
          </p>
        </div>
      </main>
    </div>
  );
}
