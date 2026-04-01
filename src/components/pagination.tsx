"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type PaginationProps = {
  totalItems: number;
  pageSize: number;
  currentPage: number;
};

export function Pagination({ totalItems, pageSize, currentPage }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams],
  );

  if (totalItems <= pageSize) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
      <span>
        Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of{" "}
        {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &lsaquo;
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-2.5 py-1 rounded border ${
              page === currentPage
                ? "bg-teal text-white border-teal"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          &rsaquo;
        </button>
      </div>
    </div>
  );
}
