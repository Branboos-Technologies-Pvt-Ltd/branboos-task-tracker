import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/app");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col gap-1">
          <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
            Branboos Technologies
          </p>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Sign in</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We&rsquo;ll email you a link to sign in — no password needed.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
