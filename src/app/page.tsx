import Link from "next/link";
import { redirect } from "next/navigation";
import { BranBoosMark } from "@/components/branboos-logo";

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
    <div className="min-h-screen bg-[#FAFAF8] text-[#1A1A18]">
      {/* Top nav bar */}
      <header className="flex h-[76px] items-center justify-between border-b border-[#E7E5E0] bg-white px-8 md:px-12">
        <div className="flex items-center gap-3">
          <BranBoosMark size={40} />
          <div>
            <div className="font-heading text-[19px] font-extrabold leading-none">
              BranBoos
            </div>
            <div className="mt-1 h-[3px] w-14 rounded-full bg-gradient-to-r from-[#F4511E] via-[#FDD835] to-[#00ACC1]" />
          </div>
        </div>
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#1A1A18] hover:text-[#3F3F3A]"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="rounded-[9px] bg-gradient-to-r from-[#F4511E] via-[#FDD835] to-[#00ACC1] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[760px] px-6 pt-24 pb-16 text-center md:pt-30">
        <div className="mb-5 text-xs font-bold tracking-[2px] text-[#9B9B94] uppercase">
          BranBoos Technologies
        </div>
        <h1 className="font-heading text-5xl leading-[1.08] font-bold tracking-tight md:text-6xl">
          Team tasks, in{" "}
          <span className="bg-gradient-to-r from-[#F4511E] via-[#FDD835] via-[#8BC34A] to-[#00ACC1] bg-clip-text text-transparent">
            one place
          </span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[#6B6B66]">
          A simple shared Kanban for the whole BranBoos team — boards,
          assignees, due dates, and checklists, with no clutter.
        </p>
        <div className="mt-9 flex items-center justify-center gap-5">
          <Link
            href="/login"
            className="rounded-[10px] bg-gradient-to-r from-[#F4511E] via-[#FDD835] to-[#00ACC1] px-7 py-3.5 text-[15px] font-bold text-white shadow-sm transition-opacity hover:opacity-95"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="text-[15px] font-semibold text-[#1A1A18] hover:text-[#3F3F3A]"
          >
            Create an account →
          </Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto grid max-w-[1000px] grid-cols-1 gap-6 px-6 pb-30 md:grid-cols-3">
        <FeatureCard
          title="Kanban boards"
          body="Drag cards through Todo, In Progress, and Done. Everyone sees the same board update in real time."
          icon={
            <div className="flex items-end gap-[3px]">
              <div className="h-[10px] w-[5px] rounded-sm bg-white" />
              <div className="h-[18px] w-[5px] rounded-sm bg-white" />
              <div className="h-[14px] w-[5px] rounded-sm bg-white" />
            </div>
          }
        />
        <FeatureCard
          title="Assign teammates"
          body="Give cards owners, due dates, priority, and labels. My Tasks shows what's on your plate."
          icon={
            <div className="flex">
              <div className="h-4 w-4 rounded-full bg-white" />
              <div className="-ml-1.5 h-4 w-4 rounded-full bg-white/60" />
            </div>
          }
        />
        <FeatureCard
          title="One-click sign in"
          body="Password login with autofill, or a magic-link email as a backup."
          icon={
            <div className="relative h-[18px] w-[18px]">
              <div className="absolute top-[9px] left-[1px] h-[3px] w-[9px] rotate-45 rounded bg-white" />
              <div className="absolute top-[6px] left-[5px] h-[3px] w-[14px] -rotate-45 rounded bg-white" />
            </div>
          }
        />
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-2.5 border-t border-[#E7E5E0] px-12 py-8 text-[13px] text-[#9B9B94]">
        <BranBoosMark size={20} />© {new Date().getFullYear()} BranBoos Technologies Pvt. Ltd.
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
    <div className="rounded-2xl border border-[#E7E5E0] bg-white p-7">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F4511E] to-[#00ACC1]">
        {icon}
      </div>
      <h3 className="font-heading mb-2 text-base font-bold">{title}</h3>
      <p className="text-sm leading-relaxed text-[#6B6B66]">{body}</p>
    </div>
  );
}
