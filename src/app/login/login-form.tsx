"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestMagicLink, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(requestMagicLink, initialState);

  if (state.status === "sent") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          Check <span className="font-medium">{state.email}</span> for a sign-in link.
        </p>
        <p className="text-xs text-zinc-500">
          The link expires in 1 hour. You can close this tab.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Work email
      </label>
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="you@branboos.com"
        autoComplete="email"
        required
        disabled={pending}
      />
      {state.status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Sending..." : "Send magic link"}
      </Button>
    </form>
  );
}
