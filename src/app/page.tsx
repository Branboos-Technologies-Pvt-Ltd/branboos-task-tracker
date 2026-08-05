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
      {/* Top nav bar — uses the full logo PNG so the tagline is visible on the white bar */}
      <header className="flex h-20 flex-shrink-0 items-center justify-between border-b border-[#E7E5E0] bg-white px-6 md:px-12">
        <Link href="/" className="flex items-center" aria-label="BranBoos home">
          <Image
            src="/brand/branboos-logo-black.png"
            alt="BranBoos Technologies Pvt. Ltd."
            width={220}
            height={56}
            className="h-11 w-auto md:h-12"
            priority
          />
        </Link>
        <div className="flex items-center gap-4 md:gap-5">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#1A1A18] hover:text-[#3F3F3A]"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="rounded-[9px] bg-gradient-to-r from-[#F4511E] via-[#FDD835] to-[#00ACC1] px-4 py-2 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95 md:px-5 md:py-2.5"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero — tightened padding so features are visible above the fold on most laptops */}
      <section className="mx-auto max-w-[760px] flex-shrink-0 px-6 pt-12 pb-8 text-center md:pt-16 md:pb-10">
        <div className="mb-3 text-xs font-bold tracking-[2px] text-[#9B9B94] uppercase">
          BranBoos Technologies
        </div>
        <h1 className="font-heading text-4xl leading-[1.1] font-bold tracking-tight md:text-5xl lg:text-6xl">
          Team tasks, in{" "}
          <span className="bg-gradient-to-r from-[#F4511E] via-[#FDD835] via-[#8BC34A] to-[#00ACC1] bg-clip-text text-transparent">
            one place
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-base leading-relaxed text-[#6B6B66] md:text-lg">
          A simple shared workspace where the whole team sees what needs doing,
          who&rsquo;s on it, and what&rsquo;s already done.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4 md:mt-8 md:gap-5">
          <Link
            href="/login"
            className="rounded-[10px] bg-gradient-to-r from-[#F4511E] via-[#FDD835] to-[#00ACC1] px-6 py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95 md:px-7 md:py-3.5 md:text-[15px]"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="text-sm font-semibold text-[#1A1A18] hover:text-[#3F3F3A] md:text-[15px]"
          >
            Create an account →
          </Link>
        </div>
      </section>

      {/* Feature grid — 6 cards (3x2 desktop, 2x3 tablet, 1-col mobile). Each ~one
          sentence, plain-language, no jargon. */}
      <section className="mx-auto w-full max-w-[1100px] flex-1 px-6 pb-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<KanbanSquareIcon className="h-5 w-5" />}
            title="Kanban boards"
            body="Drag cards through Todo, In Progress, and Done. Everyone sees the same board update in real time."
          />
          <FeatureCard
            icon={<UsersIcon className="h-5 w-5" />}
            title="Assign & prioritize"
            body="Give cards owners, due dates, and priority. My Tasks shows everything on your plate across boards."
          />
          <FeatureCard
            icon={<CheckSquareIcon className="h-5 w-5" />}
            title="Checklists that track progress"
            body="Break a card into small steps. A progress bar shows how close it is to done at a glance."
          />
          <FeatureCard
            icon={<TagIcon className="h-5 w-5" />}
            title="Labels & filters"
            body="Tag cards by area — Frontend, Sales, Bug, whatever. Filter the board to see just what matters."
          />
          <FeatureCard
            icon={<MessageSquareIcon className="h-5 w-5" />}
            title="Discuss on the card"
            body="Comment where the work lives. No more hunting through Slack to find what someone said about a task."
          />
          <FeatureCard
            icon={<BellIcon className="h-5 w-5" />}
            title="Stay in the loop"
            body="A bell in the header pings you when someone assigns you a card or comments on your work."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-shrink-0 items-center justify-center gap-2.5 border-t border-[#E7E5E0] px-6 py-5 text-[12px] text-[#9B9B94] md:px-12">
        <Image
          src="/brand/branboos-icon.png"
          alt=""
          width={18}
          height={18}
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
    <div className="rounded-2xl border border-[#E7E5E0] bg-white p-5 transition-shadow hover:shadow-sm md:p-6">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F4511E] to-[#00ACC1] text-white">
        {icon}
      </div>
      <h3 className="font-heading mb-1.5 text-[15px] font-bold text-[#1A1A18]">
        {title}
      </h3>
      <p className="text-[13px] leading-relaxed text-[#6B6B66]">{body}</p>
    </div>
  );
}
