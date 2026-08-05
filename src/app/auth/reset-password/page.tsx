import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BranBoosBlackLogo } from "@/components/branboos-logo";
import { ResetPasswordForm } from "./reset-password-form";

// Users land here after clicking the password-reset email link. Supabase
// exchanges the recovery token via /auth/callback first, which establishes
// a temporary session — then redirects here so the user can set a new password.
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session = they arrived here without going through the recovery link.
  if (!user) redirect("/login?error=reset_link_invalid");

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-semibold text-[#6B6B66] transition-colors hover:bg-white hover:text-[#1A1A18] sm:top-6 sm:left-6"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        Home
      </Link>

      <div className="w-full max-w-[440px]">
        <Link href="/" className="mb-5 flex justify-center sm:mb-7" aria-label="Back to BranBoos home">
          <BranBoosBlackLogo height={60} className="h-11 w-auto sm:h-[60px]" />
        </Link>
        <div className="rounded-[20px] border border-[#E7E5E0] bg-white p-6 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] sm:p-9">
          <div className="mb-4 flex flex-col gap-1 text-center">
            <h1 className="font-heading text-xl font-bold text-[#1A1A18]">
              Set a new password
            </h1>
            <p className="text-[13px] text-[#6B6B66]">
              Signed in as {user.email}. Pick a password you&rsquo;ll remember —
              your browser can save it.
            </p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
