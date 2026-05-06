"use client";

import { useRef, useState } from "react";
import { useActionState } from "react";
import {
  addAgendaDateAction,
  addAgendaItemAction,
  toggleAgendaItemAction,
  editAgendaItemAction,
  deleteAgendaItemAction,
  deleteAgendaDateAction,
} from "@/lib/actions";
import type { AgendaDate, AgendaItem } from "@/lib/schema";

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Add Date Form ──────────────────────────────────────────

function AddDateForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await addAgendaDateAction(undefined, formData);
      if (result?.success) formRef.current?.reset();
      return result;
    },
    null,
  );

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-3 mb-6">
      <input
        name="date"
        type="date"
        required
        className="text-xs border border-gray-200 rounded-md px-2.5 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-1 bg-teal text-white rounded-md text-xs font-medium hover:bg-teal-dark transition-colors disabled:opacity-50"
      >
        {isPending ? "Adding..." : "+ Add Date"}
      </button>
      {state?.error && (
        <span className="text-xs text-red-500">{state.error}</span>
      )}
    </form>
  );
}

// ─── Add Item Form ──────────────────────────────────────────

function AddItemForm({ agendaDateId }: { agendaDateId: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await addAgendaItemAction(undefined, formData);
      if (result?.success) formRef.current?.reset();
      return result;
    },
    null,
  );

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-2 py-2">
      <input type="hidden" name="agendaDateId" value={agendaDateId} />
      <input
        name="text"
        type="text"
        placeholder="Add discussion point..."
        required
        className="flex-1 text-xs border border-gray-200 rounded-md px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
      />
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
        title="Add"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      {state?.error && (
        <span className="text-xs text-red-500">{state.error}</span>
      )}
    </form>
  );
}

// ─── Checklist Item ─────────────────────────────────────────

function ChecklistItem({ item }: { item: AgendaItem }) {
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [, editAction, isEditPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await editAgendaItemAction(undefined, formData);
      if (result?.success) {
        setEditing(false);
        formRef.current?.reset();
      }
      return result;
    },
    null,
  );

  if (editing) {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <form ref={formRef} action={editAction} className="flex items-center gap-2 flex-1">
          <input type="hidden" name="id" value={item.id} />
          <input
            name="text"
            type="text"
            defaultValue={item.text}
            autoFocus
            required
            className="flex-1 text-xs border border-gray-200 rounded-md px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
          <button
            type="submit"
            disabled={isEditPending}
            className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
            title="Save"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Cancel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-1.5 group">
      <form action={toggleAgendaItemAction} className="flex">
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="checked" value={String(item.checked)} />
        <button type="submit" className="flex items-center">
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
              item.checked
                ? "bg-teal border-teal text-white"
                : "border-gray-300 hover:border-teal"
            }`}
          >
            {item.checked && (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        </button>
      </form>

      <span
        className={`flex-1 text-xs ${
          item.checked ? "line-through text-gray-400" : "text-gray-700"
        }`}
      >
        {item.text}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-300 hover:text-teal hover:bg-gray-100 transition-colors"
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
        <form action={deleteAgendaItemAction}>
          <input type="hidden" name="id" value={item.id} />
          <button
            type="submit"
            className="inline-flex items-center justify-center w-6 h-6 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Date Group Card ────────────────────────────────────────

function DateGroup({
  dateEntry,
  items,
}: {
  dateEntry: AgendaDate;
  items: AgendaItem[];
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden border-l-2 border-teal">
      {/* Date Header */}
      <div className="bg-white px-4 py-2 flex justify-between items-center border-b border-gray-100">
        <h2 className="flex items-center gap-2 font-semibold text-gray-700 text-xs uppercase tracking-wider">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h18" />
          </svg>
          {formatDate(dateEntry.date)}
        </h2>
        <form action={deleteAgendaDateAction}>
          <input type="hidden" name="id" value={dateEntry.id} />
          <button
            type="submit"
            className="text-gray-300 hover:text-red-500 transition-colors"
            title="Delete date and all items"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
        </form>
      </div>

      {/* Items */}
      <div className="px-4 py-2 divide-y divide-gray-50">
        {items.map((item) => (
          <ChecklistItem key={item.id} item={item} />
        ))}
        <AddItemForm agendaDateId={dateEntry.id} />
      </div>
    </div>
  );
}

// ─── Main Board ─────────────────────────────────────────────

type AgendaBoardProps = {
  dates: AgendaDate[];
  itemsByDateId: Record<number, AgendaItem[]>;
};

export function AgendaBoard({ dates, itemsByDateId }: AgendaBoardProps) {
  return (
    <>
      <AddDateForm />

      {dates.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-sm mb-2">No agenda items yet</p>
          <p className="text-xs">Add a date above to start building your meeting agenda.</p>
        </div>
      ) : (
        dates.map((dateEntry) => (
          <DateGroup
            key={dateEntry.id}
            dateEntry={dateEntry}
            items={itemsByDateId[dateEntry.id] || []}
          />
        ))
      )}
    </>
  );
}
