import { format } from "date-fns";
import { requireProfile } from "@/lib/auth";
import { memberDisplayName } from "@/lib/members";
import { listWorkspaceMembers } from "@/lib/members.server";
import { Avatar } from "@/components/avatar";

const ROLE_STYLES: Record<string, string> = {
  owner: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  admin: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  member: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export default async function MembersPage() {
  const { workspace, user } = await requireProfile();
  const members = await listWorkspaceMembers(workspace.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Members
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Everyone who can access <strong>{workspace.name}</strong>. New members
          join automatically when they sign in with a magic link.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10"
          >
            <Avatar member={member} size="lg" />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {memberDisplayName(member)}
                </span>
                {member.id === user.id && (
                  <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    you
                  </span>
                )}
              </div>
              <span
                className="truncate text-xs text-zinc-500"
                title={member.email}
              >
                {member.email}
              </span>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${ROLE_STYLES[member.role]}`}
                >
                  {member.role}
                </span>
                <span className="text-[10px] text-zinc-500">
                  joined {format(member.joinedAt, "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
