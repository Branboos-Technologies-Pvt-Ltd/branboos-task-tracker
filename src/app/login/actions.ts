"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const codeSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .regex(/^\d{6,10}$/, "Enter the numeric code from your email"),
});

export type LoginState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string; email?: string };

export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  const headerList = await headers();
  const rawOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${headerList.get("x-forwarded-proto") ?? "http"}://${headerList.get("host")}`;
  // Strip any trailing slash so we never produce `https://…//auth/callback`,
  // which would fail to match the exact URL in Supabase's allow-list.
  const origin = rawOrigin.replace(/\/+$/, "");

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error("[login] signInWithOtp error:", JSON.stringify(error, null, 2));
    return { status: "error", message: describeAuthError(error) };
  }

  return { status: "sent", email: parsed.data.email };
}

export async function verifyEmailCode(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = codeSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0].message,
      email: String(formData.get("email") ?? ""),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "email",
  });

  if (error) {
    console.error("[login] verifyOtp error:", JSON.stringify(error, null, 2));
    return {
      status: "error",
      message: describeAuthError(error),
      email: parsed.data.email,
    };
  }

  redirect("/app");
}

// Supabase auth errors sometimes have `.message` as an empty object or blank
// string (e.g. when SMTP fails silently). Extract something useful for the UI.
function describeAuthError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const e = err as { message?: unknown; code?: unknown; status?: unknown; name?: unknown };
    if (typeof e.message === "string" && e.message.trim().length > 2) return e.message;
    if (typeof e.code === "string" && e.code.length > 0) return `Error: ${e.code}`;
    if (typeof e.status === "number") {
      if (e.status === 429) return "Email rate limit reached. Wait a minute and try again.";
      if (e.status >= 500) return "Email service is unreachable. Check SMTP config in Supabase.";
      return `Error ${e.status}`;
    }
    if (typeof e.name === "string") return e.name;
  }
  return "Something went wrong. Check the server logs.";
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
