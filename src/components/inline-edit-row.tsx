"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useActionState } from "react";
import { updateTaskAction, deleteTaskAction } from "@/lib/actions";
import { TaskDetailModal } from "./task-detail-modal";

type TaskData = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
  createdAt: Date;
  ownerName: string | null;
  ownerId: number | null;
};

type StatusOption = { value: string; label: string; color: string };

type InlineEditRowProps = {
  task: TaskData;
  owners: { id: number; name: string }[];
  statuses: StatusOption[];
  rowIndex: number;
};

function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}

export function InlineEditRow({ task, owners, statuses, rowIndex }: InlineEditRowProps) {
  const [editing, setEditing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await updateTaskAction(undefined, formData);
      if (result?.success) {
        setEditing(false);
      }
      return result;
    },
    null,
  );

  const statusInfo = statuses.find((s) => s.value === task.status) || statuses[0];

  if (!editing) {
    const isOverdue =
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== "done";

    return (
      <>
        <tr
          className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
            rowIndex % 2 === 1 ? "bg-gray-50/50" : "bg-white"
          }`}
        >
          <td className="px-4 py-3">
            <button
              onClick={() => setShowDetail(true)}
              className="font-medium text-gray-800 hover:text-teal transition-colors text-left"
            >
              {task.title}
            </button>
          </td>
          <td className="px-4 py-3">
            <span
              className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            {task.ownerName || "Unassigned"}
          </td>
          <td className="px-4 py-3 text-sm">
            {task.dueDate ? (
              <span className={isOverdue ? "text-red-600 font-medium" : "text-gray-600"}>
                {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && " (overdue)"}
              </span>
            ) : (
              <span className="text-gray-400">No date</span>
            )}
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-400 hover:text-teal hover:bg-gray-100 transition-colors"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </button>
              <form action={deleteTaskAction} className="flex">
                <input type="hidden" name="id" value={task.id} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </form>
            </div>
          </td>
        </tr>
        {showDetail &&
          createPortal(
            <TaskDetailModal
              task={task}
              statusInfo={statusInfo}
              owners={owners}
              onClose={() => setShowDetail(false)}
            />,
            document.body,
          )}
      </>
    );
  }

  // Edit mode
  return (
    <tr className="border-b border-gray-100 bg-teal-light/20">
      <td colSpan={5} className="p-0">
        <form ref={formRef} action={formAction}>
          <input type="hidden" name="id" value={task.id} />
          <table className="w-full">
            <tbody>
              <tr>
                <td className="px-4 py-2" style={{ width: "35%" }}>
                  <input
                    name="title"
                    type="text"
                    defaultValue={task.title}
                    autoFocus
                    required
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    name="status"
                    defaultValue={task.status}
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
                    defaultValue={task.ownerId ? String(task.ownerId) : ""}
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
                    defaultValue={formatDateForInput(task.dueDate)}
                    className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="inline-flex items-center justify-center w-8 h-8 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                      title="Save"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
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
