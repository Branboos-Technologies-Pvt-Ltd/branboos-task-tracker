"use client";

import { useState } from "react";
import { useActionState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestMagicLink,
  requestPasswordReset,
  signInWithPassword,
  signUpWithPassword,
  verifyEmailCode,
  type LoginState,
} from "./actions";

const initialState: LoginState = { status: "idle" };

type Mode = "signin" | "signup" | "forgot" | "magiclink";

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin");

  const [signInState, signInAction, signInPending] = useActionState(
    signInWithPassword,
    initialState,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUpWithPassword,
    initialState,
  );
  const [magicState, magicAction, magicPending] = useActionState(
    requestMagicLink,
    initialState,
  );
  const [resetState, resetAction, resetPending] = useActionState(
    requestPasswordReset,
    initialState,
  );
  const [codeState, codeAction, codePending] = useActionState(
    verifyEmailCode,
    initialState,
  );

  // If a signup or magiclink flow reached the "sent" state, or we're mid code entry
  // due to a code-verification error, show the code / confirm-email screen.
  if (signUpState.status === "confirm-email") {
    return (
      <MessagePanel
        title="Check your email"
        body={
          <>
            We sent a confirmation link to{" "}
            <span className="font-medium">{signUpState.email}</span>. Click the link
            in the email to activate your account, then sign in with your password.
          </>
        }
        onBack={() => setMode("signin")}
      />
    );
  }

  if (resetState.status === "reset-sent") {
    return (
      <MessagePanel
        title="Password reset sent"
        body={
          <>
            Check <span className="font-medium">{resetState.email}</span> for a link
            to reset your password. It expires in 1 hour.
          </>
        }
        onBack={() => setMode("signin")}
      />
    );
  }

  const magicSentEmail =
    magicState.status === "sent"
      ? magicState.email
      : codeState.status === "error" && codeState.email
      ? codeState.email
      : null;

  if (magicSentEmail) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            We sent a sign-in email to{" "}
            <span className="font-medium">{magicSentEmail}</span>.
          </p>
          <p className="text-xs text-zinc-500">
            Click the link in the email, <em>or</em> enter the code below.
          </p>
        </div>
        <form action={codeAction} className="flex flex-col gap-3">
          <input type="hidden" name="email" value={magicSentEmail} />
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
            <p className="text-sm text-red-600 dark:text-red-400">
              {codeState.message}
            </p>
          )}
          <BrandButton type="submit" disabled={codePending}>
            {codePending ? "Verifying..." : "Continue"}
          </BrandButton>
          <LinkButton onClick={() => setMode("signin")}>
            Back to sign in
          </LinkButton>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ModeTabs
        mode={mode === "forgot" || mode === "magiclink" ? "signin" : mode}
        onChange={setMode}
      />

      {mode === "signin" && (
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
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <LinkButton onClick={() => setMode("forgot")}>
                Forgot password?
              </LinkButton>
            </div>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
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
            {signInPending ? "Signing in..." : "Sign in"}
          </BrandButton>
          <div className="text-center">
            <LinkButton onClick={() => setMode("magiclink")}>
              Trouble signing in? Email me a code instead
            </LinkButton>
          </div>
        </form>
      )}

      {mode === "signup" && (
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <PasswordInput
              id="signup-password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="At least 8 characters"
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

      {mode === "forgot" && (
        <form action={resetAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Reset password
            </h2>
            <p className="text-xs text-zinc-500">
              We&rsquo;ll email you a link to set a new password.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reset-email">Work email</Label>
            <Input
              id="reset-email"
              name="email"
              type="email"
              placeholder="you@branboos.com"
              autoComplete="email"
              required
              disabled={resetPending}
            />
          </div>
          {resetState.status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {resetState.message}
            </p>
          )}
          <BrandButton type="submit" disabled={resetPending}>
            {resetPending ? "Sending..." : "Send reset link"}
          </BrandButton>
          <LinkButton onClick={() => setMode("signin")}>
            Back to sign in
          </LinkButton>
        </form>
      )}

      {mode === "magiclink" && (
        <form action={magicAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Email me a sign-in code
            </h2>
            <p className="text-xs text-zinc-500">
              For accounts without a password, or if you&rsquo;ve forgotten yours.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="magic-email">Work email</Label>
            <Input
              id="magic-email"
              name="email"
              type="email"
              placeholder="you@branboos.com"
              autoComplete="email"
              required
              disabled={magicPending}
            />
          </div>
          {magicState.status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {magicState.message}
            </p>
          )}
          <BrandButton type="submit" disabled={magicPending}>
            {magicPending ? "Sending..." : "Send sign-in code"}
          </BrandButton>
          <LinkButton onClick={() => setMode("signin")}>
            Back to sign in
          </LinkButton>
        </form>
      )}
    </div>
  );
}

function ModeTabs({
  mode,
  onChange,
}: {
  mode: "signin" | "signup";
  onChange: (m: Mode) => void;
}) {
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

function LinkButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium text-zinc-600 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
    >
      {children}
    </button>
  );
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-9" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon className="h-3.5 w-3.5" /> : <EyeIcon className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

function MessagePanel({
  title,
  body,
  onBack,
}: {
  title: string;
  body: React.ReactNode;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <p className="text-sm text-zinc-700 dark:text-zinc-300">{body}</p>
      <LinkButton onClick={onBack}>Back to sign in</LinkButton>
    </div>
  );
}
