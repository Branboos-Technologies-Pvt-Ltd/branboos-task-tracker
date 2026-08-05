"use client";

import { useState } from "react";
import { useActionState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { status: "idle" };

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initialState);
  const [visible, setVisible] = useState(false);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            required
            disabled={pending}
            className="pr-9"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? (
              <EyeOffIcon className="h-3.5 w-3.5" />
            ) : (
              <EyeIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
      {state.status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="btn-brand-gradient w-full rounded-md font-semibold shadow-sm disabled:opacity-70"
      >
        {pending ? "Saving..." : "Save password"}
      </Button>
    </form>
  );
}
