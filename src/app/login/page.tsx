import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BranBoosBlackLogo } from "@/components/branboos-logo";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/app");

  const { mode } = await searchParams;
  const initialMode: "signin" | "signup" = mode === "signup" ? "signup" : "signin";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAF8] px-4 py-8 sm:px-6">
      {/* Back-to-home link, fixed top-left so it's always reachable */}
      <Link
        href="/"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-semibold text-[#6B6B66] transition-colors hover:bg-white hover:text-[#1A1A18] sm:top-6 sm:left-6"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Home
      </Link>

      {/* Radial gradient blooms behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[120px] -right-[120px] h-[280px] w-[280px] rounded-full opacity-[0.15] blur-[10px] sm:h-[360px] sm:w-[360px]"
        style={{
          background: "radial-gradient(circle, #3B82F6, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[140px] -left-[140px] h-[320px] w-[320px] rounded-full opacity-[0.15] blur-[10px] sm:h-[400px] sm:w-[400px]"
        style={{
          background: "radial-gradient(circle, #F59E0B, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-[440px]">
        {/* Logo also links back home — clicking the brand is a familiar way out */}
        <Link
          href="/"
          className="mb-5 flex justify-center sm:mb-7"
          aria-label="Back to BranBoos home"
        >
          <BranBoosBlackLogo
            height={60}
            className="h-11 w-auto sm:h-[60px]"
          />
        </Link>
        <div className="rounded-[20px] border border-[#E7E5E0] bg-white p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] sm:p-9">
          <LoginForm initialMode={initialMode} />
        </div>
      </div>
    </div>
  );
}
