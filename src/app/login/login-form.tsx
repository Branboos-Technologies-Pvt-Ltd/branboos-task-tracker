"use client";

import { useState } from "react";
import { useActionState } from "react";
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

export function LoginForm({ initialMode = "signin" }: { initialMode?: "signin" | "signup" }) {
  const [mode, setMode] = useState<Mode>(initialMode);

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

  // Success screens
  if (signUpState.status === "confirm-email") {
    return (
      <MessagePanel
        title="Check your email"
        body={
          <>
            We sent a confirmation link to{" "}
            <span className="font-semibold">{signUpState.email}</span>. Click the
            link in the email to activate your account, then sign in with your
            password.
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
            Check <span className="font-semibold">{resetState.email}</span> for a
            link to reset your password. It expires in 1 hour.
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
        <PanelHeader
          title="Check your email"
          subtitle={`We sent a sign-in code to ${magicSentEmail}. Enter it below or click the link in the email.`}
        />
        <form action={codeAction} className="flex flex-col gap-4">
          <input type="hidden" name="email" value={magicSentEmail} />
          <FieldLabel>Sign-in code</FieldLabel>
          <TextInput
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
          {codeState.status === "error" && <ErrorText>{codeState.message}</ErrorText>}
          <PrimaryButton disabled={codePending}>
            {codePending ? "Verifying..." : "Continue"}
          </PrimaryButton>
          <LinkButton onClick={() => setMode("signin")}>Back to sign in</LinkButton>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {(mode === "signin" || mode === "signup") && (
        <>
          <PanelHeader
            title={mode === "signin" ? "Welcome back" : "Create your account"}
            subtitle={
              mode === "signin"
                ? "Sign in to your BranBoos workspace"
                : "Start tracking your team's work"
            }
          />
          <ModeTabs mode={mode} onChange={setMode} />
        </>
      )}

      {mode === "signin" && (
        <form action={signInAction} className="flex flex-col gap-4">
          <Field label="Work email">
            <TextInput
              name="email"
              type="email"
              placeholder="you@branboos.com"
              autoComplete="email"
              required
              disabled={signInPending}
            />
          </Field>
          <Field
            label="Password"
            action={
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-xs font-medium text-[#3B82F6] hover:underline"
              >
                Forgot password?
              </button>
            }
          >
            <PasswordInput
              name="password"
              autoComplete="current-password"
              required
              disabled={signInPending}
            />
          </Field>
          {signInState.status === "error" && <ErrorText>{signInState.message}</ErrorText>}
          <PrimaryButton disabled={signInPending}>
            {signInPending ? "Signing in..." : "Sign in"}
          </PrimaryButton>
          <OrDivider />
          <SecondaryButton onClick={() => setMode("magiclink")}>
            Email me a magic link instead
          </SecondaryButton>
          <FooterLink onClick={() => setMode("signup")}>
            New to BranBoos?{" "}
            <span className="font-semibold text-[#3B82F6]">Sign up</span>
          </FooterLink>
        </form>
      )}

      {mode === "signup" && (
        <form action={signUpAction} className="flex flex-col gap-4">
          <Field label="Full name">
            <TextInput
              name="fullName"
              type="text"
              placeholder="Priya Menon"
              autoComplete="name"
              required
              disabled={signUpPending}
            />
          </Field>
          <Field label="Work email">
            <TextInput
              name="email"
              type="email"
              placeholder="priya.menon@branboos.com"
              autoComplete="email"
              required
              disabled={signUpPending}
            />
          </Field>
          <Field label="Password">
            <PasswordInput
              name="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="At least 8 characters"
              required
              disabled={signUpPending}
            />
          </Field>
          {signUpState.status === "error" && <ErrorText>{signUpState.message}</ErrorText>}
          <PrimaryButton disabled={signUpPending}>
            {signUpPending ? "Creating account..." : "Create account"}
          </PrimaryButton>
          <FooterLink onClick={() => setMode("signin")}>
            Already have an account?{" "}
            <span className="font-semibold text-[#3B82F6]">Sign in</span>
          </FooterLink>
        </form>
      )}

      {mode === "forgot" && (
        <>
          <PanelHeader
            title="Reset password"
            subtitle="We'll email you a link to set a new password."
          />
          <form action={resetAction} className="flex flex-col gap-4">
            <Field label="Work email">
              <TextInput
                name="email"
                type="email"
                placeholder="you@branboos.com"
                autoComplete="email"
                required
                disabled={resetPending}
              />
            </Field>
            {resetState.status === "error" && <ErrorText>{resetState.message}</ErrorText>}
            <PrimaryButton disabled={resetPending}>
              {resetPending ? "Sending..." : "Send reset link"}
            </PrimaryButton>
            <LinkButton onClick={() => setMode("signin")}>Back to sign in</LinkButton>
          </form>
        </>
      )}

      {mode === "magiclink" && (
        <>
          <PanelHeader
            title="Email me a sign-in code"
            subtitle="For accounts without a password, or as a one-time login."
          />
          <form action={magicAction} className="flex flex-col gap-4">
            <Field label="Work email">
              <TextInput
                name="email"
                type="email"
                placeholder="you@branboos.com"
                autoComplete="email"
                required
                disabled={magicPending}
              />
            </Field>
            {magicState.status === "error" && <ErrorText>{magicState.message}</ErrorText>}
            <PrimaryButton disabled={magicPending}>
              {magicPending ? "Sending..." : "Send me a code"}
            </PrimaryButton>
            <LinkButton onClick={() => setMode("signin")}>Use password instead</LinkButton>
          </form>
        </>
      )}
    </div>
  );
}

/* ---------- Primitives (design tokens baked in) ---------- */

function PanelHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center">
      <div className="font-heading text-xl font-bold text-[#1A1A18]">{title}</div>
      <div className="mt-1.5 text-[13px] text-[#6B6B66]">{subtitle}</div>
    </div>
  );
}

function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const isSignIn = mode === "signin";
  return (
    <div className="flex rounded-[11px] bg-[#F3F2EE] p-1">
      <TabButton active={isSignIn} onClick={() => onChange("signin")}>
        Sign In
      </TabButton>
      <TabButton active={!isSignIn} onClick={() => onChange("signup")}>
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
      className={`flex-1 rounded-lg px-3 py-2.5 text-[13px] font-bold transition-colors ${
        active
          ? "bg-white text-[#1A1A18] shadow-sm"
          : "text-[#6B6B66] hover:text-[#1A1A18]"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        {action}
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] font-semibold text-[#1A1A18]">{children}</div>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-[9px] border border-[#E7E5E0] bg-[#F9F8F6] px-3.5 py-2.5 text-sm text-[#1A1A18] outline-none placeholder:text-[#9B9B94] focus:border-[#00ACC1] focus:ring-2 focus:ring-[#00ACC1]/20 disabled:opacity-60"
    />
  );
}

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <TextInput {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-[#6B6B66] hover:text-[#1A1A18]"
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

function PrimaryButton({
  children,
  disabled,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="btn-brand-gradient rounded-[10px] py-3 text-sm font-bold shadow-sm disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
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
      className="rounded-[10px] border border-[#E7E5E0] bg-white py-2.5 text-[13px] font-semibold text-[#1A1A18] hover:bg-[#F9F8F6]"
    >
      {children}
    </button>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-[#E7E5E0]" />
      <div className="text-[11px] font-medium text-[#9B9B94]">OR</div>
      <div className="h-px flex-1 bg-[#E7E5E0]" />
    </div>
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
      className="text-center text-[13px] font-semibold text-[#6B6B66] hover:text-[#1A1A18]"
    >
      {children}
    </button>
  );
}

function FooterLink({
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
      className="mt-1 text-center text-[13px] text-[#6B6B66]"
    >
      {children}
    </button>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-red-600">{children}</div>;
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
      <PanelHeader title={title} subtitle="" />
      <p className="text-sm text-[#3F3F3A]">{body}</p>
      <LinkButton onClick={onBack}>Back to sign in</LinkButton>
    </div>
  );
}
