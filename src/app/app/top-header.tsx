"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon } from "lucide-react";
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E7E5E0] bg-white px-6 md:px-8">
      <div className="flex items-center gap-1 pl-11 text-sm md:pl-0">
        <Link
          href="/app"
          className="text-[#9B9B94] hover:text-[#1A1A18]"
        >
          {workspaceName}
        </Link>
        {section && (
          <>
            <span className="mx-1 text-[#9B9B94]">/</span>
            <span className="font-semibold text-[#1A1A18]">{section}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3.5">
        {/* Notification bell — visual placeholder until we wire real notifications */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E7E5E0] bg-white text-[#1A1A18] transition-colors hover:bg-[#F9F8F6]"
          aria-label="Notifications"
        >
          <BellIcon className="h-4 w-4" />
        </button>

        <UserMenu
          userDisplayName={userDisplayName}
          userEmail={userEmail}
          userInitials={userInitials}
        />
      </div>
    </header>
  );
}
