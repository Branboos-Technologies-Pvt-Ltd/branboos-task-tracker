import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BellIcon,
  CheckSquareIcon,
  KanbanSquareIcon,
  MessageSquareIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";

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
    <div className="flex min-h-screen flex-col bg-[#FAFAF8] text-[#1A1A18]">
      {/* Slimmer header (64px) with the real logo. */}
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#E7E5E0] bg-white px-6 md:px-12">
        <Link href="/" className="flex items-center" aria-label="BranBoos home">
          <Image
            src="/brand/branboos-logo-black.png"
            alt="BranBoos Technologies Pvt. Ltd."
            width={220}
            height={44}
            className="h-9 w-auto md:h-10"
            priority
          />
        </Link>
        <div className="flex items-center gap-3 md:gap-5">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#1A1A18] hover:text-[#3F3F3A]"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="rounded-[9px] bg-gradient-to-r from-[#F4511E] via-[#FDD835] to-[#00ACC1] px-4 py-2 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Compact hero — target: top row of feature cards visible above the fold
          on a ~720px viewport. */}
      <section className="mx-auto max-w-[720px] flex-shrink-0 px-6 pt-6 pb-6 text-center md:pt-8 md:pb-7">
        <div className="mb-2 text-[11px] font-bold tracking-[2px] text-[#9B9B94] uppercase">
          BranBoos Technologies
        </div>
        <h1 className="font-heading text-3xl leading-[1.1] font-bold tracking-tight md:text-4xl lg:text-5xl">
          Team tasks, in{" "}
          <span className="bg-gradient-to-r from-[#F4511E] via-[#FDD835] via-[#8BC34A] to-[#00ACC1] bg-clip-text text-transparent">
            one place
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-[520px] text-sm leading-relaxed text-[#6B6B66] md:text-base">
          A simple shared workspace where the whole team sees what needs doing,
          who&rsquo;s on it, and what&rsquo;s already done.
        </p>
        <div className="mt-5 flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-[10px] bg-gradient-to-r from-[#F4511E] via-[#FDD835] to-[#00ACC1] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="text-sm font-semibold text-[#1A1A18] hover:text-[#3F3F3A]"
          >
            Create an account →
          </Link>
        </div>
      </section>

      {/* Feature grid — 6 cards (3x2 desktop, 2x3 tablet, 1-col mobile).
          Compact padding so a full row fits above the fold on standard laptops. */}
      <section className="mx-auto w-full max-w-[1100px] flex-1 px-6 pb-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          <FeatureCard
            icon={<KanbanSquareIcon className="h-4 w-4" />}
            title="Kanban boards"
            body="Drag cards through Todo, In Progress, and Done. Everyone sees the same board update in real time."
          />
          <FeatureCard
            icon={<UsersIcon className="h-4 w-4" />}
            title="Assign & prioritize"
            body="Give cards owners, due dates, and priority. My Tasks shows everything on your plate across boards."
          />
          <FeatureCard
            icon={<CheckSquareIcon className="h-4 w-4" />}
            title="Checklists that track progress"
            body="Break a card into small steps. A progress bar shows how close it is to done at a glance."
          />
          <FeatureCard
            icon={<TagIcon className="h-4 w-4" />}
            title="Labels & filters"
            body="Tag cards by area — Frontend, Sales, Bug, whatever. Filter the board to see just what matters."
          />
          <FeatureCard
            icon={<MessageSquareIcon className="h-4 w-4" />}
            title="Discuss on the card"
            body="Comment where the work lives. No more hunting through Slack to find what someone said about a task."
          />
          <FeatureCard
            icon={<BellIcon className="h-4 w-4" />}
            title="Stay in the loop"
            body="A bell in the header pings you when someone assigns you a card or comments on your work."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-shrink-0 items-center justify-center gap-2 border-t border-[#E7E5E0] px-6 py-3.5 text-[11px] text-[#9B9B94] md:px-12">
        <Image
          src="/brand/branboos-icon.png"
          alt=""
          width={16}
          height={16}
          className="h-4 w-auto"
        />
        © {new Date().getFullYear()} BranBoos Technologies Pvt. Ltd.
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
    <div className="rounded-xl border border-[#E7E5E0] bg-white p-4 transition-shadow hover:shadow-sm md:p-5">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#F4511E] to-[#00ACC1] text-white">
        {icon}
      </div>
      <h3 className="font-heading mb-1 text-[14px] font-bold text-[#1A1A18]">
        {title}
      </h3>
      <p className="text-[12px] leading-relaxed text-[#6B6B66]">{body}</p>
    </div>
  );
}
