"use client";

import { useState, useRef } from "react";
import { useActionState } from "react";
import { createTaskAction } from "@/lib/actions";

type InlineAddTaskProps = {
  owners: { id: number; name: string }[];
  statuses: { value: string; label: string }[];
  extraColumns?: number;
};

export function InlineAddTask({ owners, statuses, extraColumns = 0 }: InlineAddTaskProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await createTaskAction(undefined, formData);
      if (result?.success) {
        setOpen(false);
        formRef.current?.reset();
      }
      return result;
    },
    null,
  );

  if (!open) {
    return (
      <tr>
        <td colSpan={6 + extraColumns} className="px-4 py-2">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal transition-colors"
          >
            <span className="text-base leading-none">+</span>
            New Task
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-gray-100 bg-teal-light/20">
      <td colSpan={6 + extraColumns} className="p-0">
        <form ref={formRef} action={formAction}>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="px-4 py-2" style={{ width: "35%" }}>
                  <input
                    name="title"
                    type="text"
                    placeholder="Task name"
                    autoFocus
                    required
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    name="status"
                    className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select
                    name="ownerId"
                    className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  >
                    <option value="">Unassigned</option>
                    {owners.map((o) => (
                      <option key={o.id} value={String(o.id)}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    name="dueDate"
                    type="date"
                    className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                      title="Add"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      title="Cancel"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  {state?.error && (
                    <span className="text-xs text-red-500 block mt-1">{state.error}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </td>
    </tr>
  );
}
