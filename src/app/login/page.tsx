import { redirect } from "next/navigation";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAF8] px-6">
      {/* Radial gradient blooms behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[120px] -right-[120px] h-[360px] w-[360px] rounded-full opacity-[0.15] blur-[10px]"
        style={{
          background: "radial-gradient(circle, #3B82F6, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[140px] -left-[140px] h-[400px] w-[400px] rounded-full opacity-[0.15] blur-[10px]"
        style={{
          background: "radial-gradient(circle, #F59E0B, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-[440px]">
        <div className="mb-7 flex justify-center">
          <BranBoosBlackLogo height={60} />
        </div>
        <div className="rounded-[20px] border border-[#E7E5E0] bg-white p-9 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)]">
          <LoginForm initialMode={initialMode} />
        </div>
      </div>
    </div>
  );
}
