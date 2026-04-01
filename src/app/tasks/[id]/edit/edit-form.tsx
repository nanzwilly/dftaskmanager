"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateTaskAction } from "@/lib/actions";
import Link from "next/link";
import type { Task } from "@/lib/schema";

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

export function EditTaskForm({
  task,
  teamUsers,
}: {
  task: Task;
  teamUsers: { id: number; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateTaskAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state?.redirect) {
      router.push(state.redirect);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
      <input type="hidden" name="id" value={task.id} />

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={task.title}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={task.description || ""}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={task.status}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-1">
            Assign to
          </label>
          <select
            id="ownerId"
            name="ownerId"
            defaultValue={task.ownerId?.toString() || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
          >
            <option value="">Unassigned</option>
            {teamUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={formatDate(task.dueDate)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 bg-teal text-white rounded-lg font-medium hover:bg-teal-dark disabled:opacity-50 transition-colors"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
