import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <main className="flex w-full max-w-2xl flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
            Branboos Technologies
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Task Tracker
          </h1>
          <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
            A simple, shared Kanban board for the whole team.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Sign in
          </Link>
          <Link href="/app" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Go to boards
          </Link>
        </div>
      </main>
    </div>
  );
}
