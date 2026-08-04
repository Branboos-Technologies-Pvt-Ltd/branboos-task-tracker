import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BranBoosLockup } from "@/components/branboos-logo";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/app");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 px-6 dark:bg-zinc-950">
      {/* subtle brand-gradient wash in the corners */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-red-400/30 via-yellow-300/30 to-transparent blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-blue-400/30 via-cyan-300/30 to-transparent blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <BranBoosLockup markSize={48} showTagline />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5 flex flex-col gap-1 text-center">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Welcome to BranBoos Tasks
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sign in or create your account — no passwords required.
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
