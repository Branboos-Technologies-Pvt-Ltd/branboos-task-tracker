// Small, pure helpers for role-based access. Used from both server (to enforce)
// and client (to hide UI). Server checks are the source of truth — client
// hides purely for UX, never for security.

export type WorkspaceRole = "owner" | "admin" | "member";

export function isAdmin(role: WorkspaceRole): boolean {
  return role === "owner" || role === "admin";
}

/**
 * Can the current user delete this list?
 * - Admin/owner: always
 * - Member: only if they created the list AND it has zero cards
 */
export function canDeleteList(args: {
  role: WorkspaceRole;
  listCreatedById: string | null;
  currentUserId: string;
  cardCount: number;
}): boolean {
  if (isAdmin(args.role)) return true;
  if (args.cardCount > 0) return false;
  return args.listCreatedById === args.currentUserId;
}

/**
 * Explanation string for tooltips / error messages when a user CAN'T delete
 * a list. Returns null when they can.
 */
export function whyCantDeleteList(args: {
  role: WorkspaceRole;
  listCreatedById: string | null;
  currentUserId: string;
  cardCount: number;
}): string | null {
  if (canDeleteList(args)) return null;
  if (args.cardCount > 0)
    return "This list has cards. Only an admin or owner can delete it.";
  if (args.listCreatedById !== args.currentUserId)
    return "Only the creator or an admin/owner can delete this list.";
  return "You don't have permission to delete this list.";
}
