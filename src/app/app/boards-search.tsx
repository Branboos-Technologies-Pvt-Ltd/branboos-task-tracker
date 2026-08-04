"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

export function BoardsSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initial = searchParams.get("search") ?? "";
  const [value, setValue] = useState(initial);
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local input in sync when the URL changes externally (browser back / share).
  useEffect(() => {
    setValue(initial);
  }, [initial]);

  function push(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.trim()) params.set("search", next.trim());
    else params.delete("search");
    params.delete("page"); // reset to page 1 on any new search
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/app?${qs}` : "/app");
    });
  }

  function handleChange(next: string) {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push(next), 300);
  }

  return (
    <div className="relative w-full max-w-xs">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search boards by name..."
        className="pl-8"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("");
            push("");
          }}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Clear search"
        >
          <XIcon className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
