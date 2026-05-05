"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useActionState } from "react";
import { updateTaskAction, deleteTaskAction } from "@/lib/actions";
import { formatDate } from "@/lib/format";

type TaskData = {
  id: number;
  title: string;
  description: string | null;
  status: string;
  dueDate: Date | null;
  ownerName: string | null;
  ownerId: number | null;
  createdAt: Date;
};

type StatusInfo = { label: string; color: string };

type TaskDetailModalProps = {
  task: TaskData;
  statusInfo: StatusInfo;
  owners: { id: number; name: string }[];
  onClose: () => void;
};

function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

export function TaskDetailModal({ task, statusInfo, owners, onClose }: TaskDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const result = await updateTaskAction(undefined, formData);
      if (result?.success) {
        setEditing(false);
        onClose();
      }
      return result;
    },
    null,
  );

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editing) setEditing(false);
        else onClose();
      }
    },
    [onClose, editing],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [handleEscape]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < today &&
    task.status !== "done";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {editing ? (
          /* ─── Edit Mode ─── */
          <>
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <h2 className="text-lg font-semibold text-gray-800">Edit Task</h2>
              <button
                onClick={() => setEditing(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form ref={formRef} action={formAction} className="px-6 pb-6 space-y-4 overflow-y-auto flex-1">
              <input type="hidden" name="id" value={task.id} />

              {state?.error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {state.error}
                </div>
              )}

              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  id="edit-title"
                  name="title"
                  type="text"
                  required
                  autoFocus
                  defaultValue={task.title}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                />
              </div>

              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  defaultValue={task.description || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="edit-status"
                    name="status"
                    defaultValue={task.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                  >
                    <option value="todo">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-owner" className="block text-sm font-medium text-gray-700 mb-1">
                    Assign to
                  </label>
                  <select
                    id="edit-owner"
                    name="ownerId"
                    defaultValue={task.ownerId ? String(task.ownerId) : ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                  >
                    <option value="">Unassigned</option>
                    {owners.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    id="edit-dueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={formatDateForInput(task.dueDate)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-teal text-white rounded-lg font-medium hover:bg-teal-dark disabled:opacity-50 transition-colors"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        ) : (
          /* ─── View Mode ─── */
          <>
            <div className="flex items-start justify-between px-6 pt-6 pb-2">
              <h2 className="text-lg font-semibold text-gray-800 pr-4">{task.title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                  {task.description || "No description"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Owner
                  </label>
                  <p className="mt-1 text-sm text-gray-700">
                    {task.ownerName || "Unassigned"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Due Date
                  </label>
                  <p className="mt-1 text-sm">
                    {task.dueDate ? (
                      <span className={isOverdue ? "text-red-600" : "text-gray-700"}>
                        {formatDate(task.dueDate)}
                      </span>
                    ) : (
                      <span className="text-gray-400">No date</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Created
                  </label>
                  <p className="mt-1 text-sm text-gray-700">
                    {formatDate(task.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <form action={deleteTaskAction}>
                <input type="hidden" name="id" value={task.id} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </form>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal text-white rounded-lg text-sm font-medium hover:bg-teal-dark transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
                Edit Task
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
