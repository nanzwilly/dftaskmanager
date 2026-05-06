"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { globalSearchAction } from "@/lib/actions";

type SearchResults = {
  tasks: { id: number; title: string; status: string; ownerName: string | null }[];
  agendaItems: { id: number; text: string; date: string }[];
  notes: { id: number; snippet: string }[];
};

const STATUS_LABELS: Record<string, string> = {
  todo: "Not Started",
  in_progress: "In Progress",
  done: "Completed",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-gray-100 text-gray-600",
  in_progress: "bg-teal-light text-teal-dark",
  done: "bg-green-100 text-green-700",
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    const res = await globalSearchAction(q);
    setResults(res);
    setOpen(true);
    setLoading(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setQuery(q);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (q.trim().length < 2) {
        setResults(null);
        setOpen(false);
        return;
      }
      timeoutRef.current = setTimeout(() => search(q), 300);
    },
    [search],
  );

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function navigate(path: string) {
    setOpen(false);
    setQuery("");
    setResults(null);
    router.push(path);
  }

  const hasResults =
    results &&
    (results.tasks.length > 0 || results.agendaItems.length > 0 || results.notes.length > 0);

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-2.5 text-gray-400 pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results && setOpen(true)}
          placeholder="Search..."
          className="w-44 pl-8 pr-3 py-1 text-xs bg-gray-100 text-gray-700 placeholder-gray-400 rounded-md border border-transparent focus:outline-none focus:bg-white focus:border-gray-300 transition-colors"
        />
      </div>

      {open && (
        <div className="absolute top-full mt-2 right-0 w-96 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Searching...
            </div>
          ) : !hasResults ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              No results found
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {/* Tasks */}
              {results.tasks.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Tasks ({results.tasks.length})
                  </div>
                  {results.tasks.map((task) => (
                    <button
                      key={`task-${task.id}`}
                      onClick={() => navigate("/dashboard")}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800 flex-1">{task.title}</span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status] || ""}`}
                        >
                          {STATUS_LABELS[task.status] || task.status}
                        </span>
                      </div>
                      {task.ownerName && (
                        <div className="text-xs text-gray-400 mt-0.5">{task.ownerName}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Agenda */}
              {results.agendaItems.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Agenda ({results.agendaItems.length})
                  </div>
                  {results.agendaItems.map((item) => (
                    <button
                      key={`agenda-${item.id}`}
                      onClick={() => navigate("/agenda")}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm text-gray-800">{item.text}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(item.date + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Notes */}
              {results.notes.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Notes ({results.notes.length})
                  </div>
                  {results.notes.map((note) => (
                    <button
                      key={`note-${note.id}`}
                      onClick={() => navigate("/notes")}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm text-gray-600 line-clamp-2">{note.snippet}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
