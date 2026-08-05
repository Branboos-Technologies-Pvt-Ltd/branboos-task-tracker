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

// Flat pastel palette used for member avatars (matches design mockup).
// Each entry is a background + darker text color pair, deterministic by user id.
export type AvatarSwatch = { bg: string; text: string };

const AVATAR_SWATCHES: AvatarSwatch[] = [
  { bg: "#FFEDD5", text: "#C2410C" },   // warm orange
  { bg: "#DBEAFE", text: "#1D4ED8" },   // blue
  { bg: "#FCE7F3", text: "#BE185D" },   // pink
  { bg: "#DCFCE7", text: "#15803D" },   // green
  { bg: "#EDE9FE", text: "#6D28D9" },   // violet
  { bg: "#FEF3C7", text: "#B45309" },   // amber
  { bg: "#CFFAFE", text: "#0E7490" },   // cyan
  { bg: "#FEE2E2", text: "#B91C1C" },   // red
  { bg: "#E0E7FF", text: "#3730A3" },   // indigo
  { bg: "#F5D0FE", text: "#A21CAF" },   // fuchsia
];

export function avatarSwatch(key: string): AvatarSwatch {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return AVATAR_SWATCHES[Math.abs(hash) % AVATAR_SWATCHES.length];
}

// Legacy helper — kept for the (still-gradient) sign-in success animation
// and other spots that used a gradient. Prefer avatarSwatch() for new code.
export function avatarGradient(key: string): string {
  const s = avatarSwatch(key);
  return `linear-gradient(135deg, ${s.text}, ${s.bg})`;
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

// Colored dot for boards in the sidebar — deterministic per board name.
const BOARD_DOTS = [
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#14B8A6", // teal
  "#F59E0B", // amber
  "#EF4444", // red
  "#22C55E", // green
  "#EC4899", // pink
  "#06B6D4", // cyan
];

export function boardDot(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return BOARD_DOTS[Math.abs(hash) % BOARD_DOTS.length];
}
