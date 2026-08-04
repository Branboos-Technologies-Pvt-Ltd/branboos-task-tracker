// Client-safe utilities. Do NOT import prisma or anything server-only here —
// this file is used from both server and client components.

export type Member = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
};

// Deterministic avatar gradient from a stable identifier (user id or email).
const AVATAR_GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-sky-500 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-cyan-500 to-teal-500",
  "from-lime-500 to-green-500",
];

export function avatarGradient(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function memberInitials(member: {
  fullName: string | null;
  email: string;
}): string {
  const name = member.fullName?.trim();
  if (name) {
    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return member.email.charAt(0).toUpperCase();
}

export function memberDisplayName(member: {
  fullName: string | null;
  email: string;
}): string {
  return member.fullName?.trim() || member.email.split("@")[0];
}
