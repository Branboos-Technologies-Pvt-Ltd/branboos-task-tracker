"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestMagicLink,
  requestSignUp,
  verifyEmailCode,
  type LoginState,
} from "./actions";

const initialState: LoginState = { status: "idle" };

type Mode = "signin" | "signup";

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [signInState, signInAction, signInPending] = useActionState(
    requestMagicLink,
    initialState,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    requestSignUp,
    initialState,
  );
  const [codeState, codeAction, codePending] = useActionState(
    verifyEmailCode,
    initialState,
  );

  const activeState = mode === "signin" ? signInState : signUpState;
  const sentEmail =
    activeState.status === "sent"
      ? activeState.email
      : codeState.status === "error" && codeState.email
      ? codeState.email
      : null;

  if (sentEmail) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            We sent a sign-in email to{" "}
            <span className="font-medium">{sentEmail}</span>.
          </p>
          <p className="text-xs text-zinc-500">
            Click the link in the email, <em>or</em> enter the code below.
          </p>
        </div>
        <form action={codeAction} className="flex flex-col gap-3">
          <input type="hidden" name="email" value={sentEmail} />
          <Label htmlFor="code">Sign-in code</Label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="\d{6,10}"
            maxLength={10}
            placeholder="12345678"
            autoComplete="one-time-code"
            required
            disabled={codePending}
          />
          {codeState.status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">{codeState.message}</p>
          )}
          <BrandButton type="submit" disabled={codePending}>
            {codePending ? "Verifying..." : "Continue"}
          </BrandButton>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ModeTabs mode={mode} onChange={setMode} />

      {mode === "signin" ? (
        <form action={signInAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@branboos.com"
              autoComplete="email"
              required
              disabled={signInPending}
            />
          </div>
          {signInState.status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {signInState.message}
            </p>
          )}
          <BrandButton type="submit" disabled={signInPending}>
            {signInPending ? "Sending..." : "Send sign-in code"}
          </BrandButton>
        </form>
      ) : (
        <form action={signUpAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              required
              disabled={signUpPending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-email">Work email</Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="you@branboos.com"
              autoComplete="email"
              required
              disabled={signUpPending}
            />
          </div>
          {signUpState.status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {signUpState.message}
            </p>
          )}
          <BrandButton type="submit" disabled={signUpPending}>
            {signUpPending ? "Creating account..." : "Create account"}
          </BrandButton>
          <p className="text-center text-xs text-zinc-500">
            By continuing, you agree to join the BranBoos workspace.
          </p>
        </form>
      )}
    </div>
  );
}

function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
      <TabButton active={mode === "signin"} onClick={() => onChange("signin")}>
        Sign In
      </TabButton>
      <TabButton active={mode === "signup"} onClick={() => onChange("signup")}>
        Sign Up
      </TabButton>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
          : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

function BrandButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      {...props}
      className="w-full bg-gradient-to-r from-red-500 via-orange-500 via-lime-500 to-blue-500 font-semibold text-white shadow-sm hover:opacity-95 hover:shadow-md disabled:opacity-70"
    >
      {children}
    </Button>
  );
}
