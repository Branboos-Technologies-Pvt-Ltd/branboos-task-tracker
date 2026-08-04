import { avatarGradient, memberInitials } from "@/lib/members";

type Size = "xs" | "sm" | "md" | "lg";

const SIZE_CLASSES: Record<Size, string> = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function Avatar({
  member,
  size = "sm",
  className,
}: {
  member: { id: string; email: string; fullName: string | null };
  size?: Size;
  className?: string;
}) {
  const initials = memberInitials(member);
  const gradient = avatarGradient(member.id || member.email);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm ring-2 ring-white dark:ring-zinc-900 ${gradient} ${SIZE_CLASSES[size]} ${className ?? ""}`}
      title={member.fullName ?? member.email}
    >
      {initials}
    </span>
  );
}
