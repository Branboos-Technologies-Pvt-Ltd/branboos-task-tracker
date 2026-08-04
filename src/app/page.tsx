import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckIcon, LayoutGridIcon, UsersIcon } from "lucide-react";
import { BranBoosLockup } from "@/components/branboos-logo";
import { buttonVariants } from "@/components/ui/button";

// If Supabase's magic-link redirect falls back to Site URL (root), the code lands
// here as `?code=...`. Forward it to /auth/callback so the session gets exchanged.
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error_description?: string }>;
}) {
  const params = await searchParams;

  if (params.code) {
    redirect(`/auth/callback?code=${encodeURIComponent(params.code)}`);
  }
  if (params.error_description) {
    redirect(`/login?error=${encodeURIComponent(params.error_description)}`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-zinc-950">
      {/* Subtle brand-gradient washes in the corners */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-red-400/25 via-yellow-300/25 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-400/25 via-cyan-300/25 to-transparent blur-3xl"
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <BranBoosLockup markSize={40} />
        <Link
          href="/login"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Sign in
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 pt-16 pb-24 text-center md:pt-24">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold tracking-widest text-zinc-500 uppercase">
            BranBoos Technologies
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 md:text-6xl dark:text-zinc-50">
            Team tasks, in{" "}
            <span className="bg-gradient-to-r from-red-500 via-orange-500 via-yellow-400 via-lime-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              one place
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            A simple shared Kanban for the whole BranBoos team — boards,
            assignees, due dates, no clutter.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 via-orange-500 via-lime-500 to-blue-500 px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Create an account
          </Link>
        </div>

        <div className="mt-12 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureCard
            icon={<LayoutGridIcon className="h-5 w-5" />}
            title="Kanban boards"
            body="Drag cards through Todo, In Progress, Done. Everyone sees the same board in real time."
          />
          <FeatureCard
            icon={<UsersIcon className="h-5 w-5" />}
            title="Assign teammates"
            body="Give cards owners, dates, priority, and component tags. My Cards page shows what's on your plate."
          />
          <FeatureCard
            icon={<CheckIcon className="h-5 w-5" />}
            title="One-click sign in"
            body="Password login with browser autofill, or magic-link email as a backup."
          />
        </div>
      </main>

      <footer className="relative z-10 border-t border-zinc-200 py-6 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} BranBoos Technologies Pvt. Ltd.</span>
          <Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-100">
            Sign in →
          </Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5 text-left shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 via-orange-400 to-blue-500 text-white">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      <p className="text-xs text-zinc-600 dark:text-zinc-400">{body}</p>
    </div>
  );
}
