"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type TaskFiltersProps = {
  owners: { id: number; name: string }[];
  statuses: { value: string; label: string }[];
  dateRanges?: { value: string; label: string }[];
};

export function TaskFilters({ owners, statuses, dateRanges = [] }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentOwner = searchParams.get("owner") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentDateRange = searchParams.get("dateRange") || "";
  const currentDateFrom = searchParams.get("dateFrom") || "";
  const currentDateTo = searchParams.get("dateTo") || "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // When changing status away from Completed, clear the date range filter
      // since it's based on the completed date and only meaningful then.
      if (key === "status" && value !== "done") {
        params.delete("dateRange");
        params.delete("dateFrom");
        params.delete("dateTo");
      }
      params.delete("page");
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams],
  );

  const updateDateRange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("dateRange", value);
      } else {
        params.delete("dateRange");
      }
      // Clear custom dates when switching to a non-custom preset or clearing
      if (value !== "custom") {
        params.delete("dateFrom");
        params.delete("dateTo");
      }
      params.delete("page");
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const hasFilters = currentOwner || currentStatus || currentDateRange;
  const dateRangeLabel = currentStatus === "done" ? "Completed" : "Created";

  return (
    <div className="flex items-center gap-3 mb-4 flex-wrap">
      <span className="text-xs font-medium text-gray-600">Filters:</span>

      <select
        value={currentOwner}
        onChange={(e) => updateFilter("owner", e.target.value)}
        className="text-xs border border-gray-200 rounded-md px-2.5 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
      >
        <option value="">All Owners</option>
        {owners.map((owner) => (
          <option key={owner.id} value={String(owner.id)}>
            {owner.name}
          </option>
        ))}
      </select>

      <select
        value={currentStatus}
        onChange={(e) => updateFilter("status", e.target.value)}
        className="text-xs border border-gray-200 rounded-md px-2.5 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
      >
        <option value="">All Statuses</option>
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {dateRanges.length > 0 && currentStatus === "done" && (
        <>
          <select
            value={currentDateRange}
            onChange={(e) => updateDateRange(e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-2.5 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            title={`Filter by ${dateRangeLabel} date`}
          >
            <option value="">All Time</option>
            {dateRanges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          {currentDateRange === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={currentDateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                title="From"
              />
              <span className="text-xs text-gray-400">to</span>
              <input
                type="date"
                value={currentDateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                title="To"
              />
            </div>
          )}
        </>
      )}

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}
