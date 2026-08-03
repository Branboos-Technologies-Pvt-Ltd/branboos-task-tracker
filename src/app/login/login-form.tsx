"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestMagicLink, verifyEmailCode, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const [emailState, emailAction, emailPending] = useActionState(
    requestMagicLink,
    initialState,
  );
  const [codeState, codeAction, codePending] = useActionState(
    verifyEmailCode,
    initialState,
  );

  const sentEmail =
    emailState.status === "sent"
      ? emailState.email
      : codeState.status === "error" && codeState.email
      ? codeState.email
      : null;

  if (sentEmail) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            We sent a sign-in email to <span className="font-medium">{sentEmail}</span>.
          </p>
          <p className="text-xs text-zinc-500">
            Click the link in the email, <em>or</em> enter the 6-digit code below.
          </p>
        </div>
        <form action={codeAction} className="flex flex-col gap-3">
          <input type="hidden" name="email" value={sentEmail} />
          <label
            htmlFor="code"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            6-digit code
          </label>
          <Input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="123456"
            autoComplete="one-time-code"
            required
            disabled={codePending}
          />
          {codeState.status === "error" && (
            <p className="text-sm text-red-600 dark:text-red-400">{codeState.message}</p>
          )}
          <Button type="submit" disabled={codePending}>
            {codePending ? "Verifying..." : "Sign in"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <form action={emailAction} className="flex flex-col gap-3">
      <label
        htmlFor="email"
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Work email
      </label>
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="you@branboos.com"
        autoComplete="email"
        required
        disabled={emailPending}
      />
      {emailState.status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{emailState.message}</p>
      )}
      <Button type="submit" disabled={emailPending}>
        {emailPending ? "Sending..." : "Send code"}
      </Button>
    </form>
  );
}
