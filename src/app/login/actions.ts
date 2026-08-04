"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

const signUpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  fullName: z
    .string()
    .trim()
    .min(1, "Please enter your name")
    .max(80, "Name is too long"),
  password: passwordSchema,
});

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

const codeSchema = z.object({
  email: z.string().email(),
  code: z
    .string()
    .regex(/^\d{6,10}$/, "Enter the numeric code from your email"),
});

const resetSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type LoginState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "confirm-email"; email: string }
  | { status: "reset-sent"; email: string }
  | { status: "error"; message: string; email?: string };

async function resolveOrigin(): Promise<string> {
  const headerList = await headers();
  const rawOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${headerList.get("x-forwarded-proto") ?? "http"}://${headerList.get("host")}`;
  return rawOrigin.replace(/\/+$/, "");
}

export async function signUpWithPassword(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const origin = await resolveOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    console.error("[login] signUp error:", JSON.stringify(error, null, 2));
    return { status: "error", message: describeAuthError(error) };
  }

  // If the project has "Confirm email" enabled (default), Supabase created the
  // user in a pending state and sent a confirmation email. If it's disabled,
  // the user is immediately signed in — session will already exist.
  if (data.session) {
    redirect("/app");
  }
  return { status: "confirm-email", email: parsed.data.email };
}

export async function signInWithPassword(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    console.error("[login] signInWithPassword error:", JSON.stringify(error, null, 2));
    return { status: "error", message: describeAuthError(error) };
  }

  redirect("/app");
}

export async function requestPasswordReset(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = resetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const origin = await resolveOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    console.error("[login] resetPasswordForEmail error:", JSON.stringify(error, null, 2));
    return { status: "error", message: describeAuthError(error) };
  }
  return { status: "reset-sent", email: parsed.data.email };
}

export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const origin = await resolveOrigin();

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

export async function updatePassword(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = formData.get("password");
  const parsed = passwordSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) {
    console.error("[login] updatePassword error:", JSON.stringify(error, null, 2));
    return { status: "error", message: describeAuthError(error) };
  }
  redirect("/app");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function describeAuthError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const e = err as {
      message?: unknown;
      code?: unknown;
      status?: unknown;
      name?: unknown;
    };
    if (typeof e.message === "string" && e.message.trim().length > 2) return e.message;
    if (typeof e.code === "string" && e.code.length > 0) return `Error: ${e.code}`;
    if (typeof e.status === "number") {
      if (e.status === 400) return "Invalid email or password.";
      if (e.status === 422) return "Please check the details and try again.";
      if (e.status === 429) return "Too many attempts. Wait a minute and try again.";
      if (e.status >= 500) return "Server error. Try again in a moment.";
      return `Error ${e.status}`;
    }
    if (typeof e.name === "string") return e.name;
  }
  return "Something went wrong. Please try again.";
}
