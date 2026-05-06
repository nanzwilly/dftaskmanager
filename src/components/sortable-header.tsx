"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type SortableHeaderProps = {
  label: string;
  sortKey: string;
  currentSort: string;
  currentDir: string;
  width?: string;
};

export function SortableHeader({ label, sortKey, currentSort, currentDir, width }: SortableHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isActive = currentSort === sortKey;

  const handleClick = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (isActive) {
      // Toggle direction
      params.set("dir", currentDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", sortKey);
      params.set("dir", "asc");
    }
    params.delete("page");
    router.push(`/dashboard?${params.toString()}`);
  }, [router, searchParams, sortKey, isActive, currentDir]);

  return (
    <th
      className="px-4 py-2 font-medium cursor-pointer bg-teal hover:bg-teal-dark select-none transition-colors"
      style={width ? { width } : undefined}
      onClick={handleClick}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="inline-flex flex-col text-[10px] leading-none gap-0.5 opacity-70">
          <span className={isActive && currentDir === "asc" ? "text-white" : "text-white/40"}>&#9650;</span>
          <span className={isActive && currentDir === "desc" ? "text-white" : "text-white/40"}>&#9660;</span>
        </span>
      </span>
    </th>
  );
}
