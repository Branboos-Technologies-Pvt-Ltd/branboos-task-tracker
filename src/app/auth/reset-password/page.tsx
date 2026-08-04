import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BranBoosLockup } from "@/components/branboos-logo";
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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BranBoosLockup markSize={48} />
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex flex-col gap-1 text-center">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Set a new password
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
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
