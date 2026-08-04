"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";
import { UserMenu } from "./user-menu";

const ROUTE_LABELS: { match: RegExp; label: string }[] = [
  { match: /^\/app\/my/, label: "My Cards" },
  { match: /^\/app\/members/, label: "Members" },
  { match: /^\/app\/boards\/[^/]+/, label: "Board" },
  { match: /^\/app$/, label: "Boards" },
];

function currentSection(pathname: string): string {
  for (const r of ROUTE_LABELS) if (r.match.test(pathname)) return r.label;
  return "";
}

export function TopHeader({
  workspaceName,
  userDisplayName,
  userEmail,
  userInitials,
}: {
  workspaceName: string;
  userDisplayName: string;
  userEmail: string;
  userInitials: string;
}) {
  const pathname = usePathname();
  const section = currentSection(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/85 px-4 backdrop-blur md:px-6 dark:border-zinc-800 dark:bg-zinc-900/85">
      <div className="flex items-center gap-2 pl-12 text-sm md:pl-0">
        <Link
          href="/app"
          className="font-semibold text-zinc-900 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
        >
          {workspaceName}
        </Link>
        {section && (
          <>
            <ChevronRightIcon className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-zinc-600 dark:text-zinc-400">{section}</span>
          </>
        )}
      </div>

      <UserMenu
        userDisplayName={userDisplayName}
        userEmail={userEmail}
        userInitials={userInitials}
      />
    </header>
  );
}
