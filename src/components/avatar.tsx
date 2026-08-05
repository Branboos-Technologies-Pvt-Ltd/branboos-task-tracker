import { avatarSwatch, memberInitials } from "@/lib/members";

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
  const swatch = avatarSwatch(member.id || member.email);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${SIZE_CLASSES[size]} ${className ?? ""}`}
      style={{ backgroundColor: swatch.bg, color: swatch.text }}
      title={member.fullName ?? member.email}
    >
      {initials}
    </span>
  );
}
