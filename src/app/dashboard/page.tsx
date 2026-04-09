import { db } from "@/lib/db";
import { tasks, users } from "@/lib/schema";
import { eq, ne, and, asc, desc, type SQL } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { TaskFilters } from "@/components/task-filters";
import { Pagination } from "@/components/pagination";
import { InlineAddTask } from "@/components/inline-add-task";
import { InlineEditRow } from "@/components/inline-edit-row";
import { SortableHeader } from "@/components/sortable-header";
import { CreateTaskModal } from "@/components/create-task-modal";

const PAGE_SIZE = 30;

const statusOptions = [
  { value: "todo", label: "Not Started", color: "bg-gray-100 text-gray-600" },
  { value: "in_progress", label: "In Progress", color: "bg-teal-light text-teal-dark" },
  { value: "done", label: "Completed", color: "bg-green-100 text-green-700" },
];

const filterStatusOptions = statusOptions.map(({ value, label }) => ({ value, label }));

const SORT_COLUMNS = {
  title: tasks.title,
  status: tasks.status,
  owner: users.name,
  dueDate: tasks.dueDate,
  createdAt: tasks.createdAt,
} as const;

type SortKey = keyof typeof SORT_COLUMNS;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const ownerFilter = typeof params.owner === "string" ? params.owner : "";
  const statusFilter = typeof params.status === "string" ? params.status : "";
  const currentPage = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1", 10) || 1);

  const sortParam = typeof params.sort === "string" ? params.sort : "dueDate";
  const dirParam = typeof params.dir === "string" ? params.dir : "asc";
  const sortKey: SortKey = sortParam in SORT_COLUMNS ? (sortParam as SortKey) : "dueDate";
  const sortDir = dirParam === "asc" ? "asc" : "desc";

  const allUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .orderBy(users.name);

  const conditions: SQL[] = [];
  if (ownerFilter) {
    conditions.push(eq(tasks.ownerId, parseInt(ownerFilter)));
  }
  if (statusFilter && ["todo", "in_progress", "done"].includes(statusFilter)) {
    conditions.push(eq(tasks.status, statusFilter as "todo" | "in_progress" | "done"));
  } else {
    // By default, hide completed tasks
    conditions.push(ne(tasks.status, "done"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const sortColumn = SORT_COLUMNS[sortKey];
  const orderByClause = sortDir === "asc" ? asc(sortColumn) : desc(sortColumn);

  const allFiltered = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
      ownerName: users.name,
      ownerId: tasks.ownerId,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.ownerId, users.id))
    .where(whereClause)
    .orderBy(orderByClause);

  const totalItems = allFiltered.length;
  const paginatedTasks = allFiltered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const headerProps = { currentSort: sortKey, currentDir: sortDir };

  const tableHeader = (
    <thead>
      <tr className="bg-teal text-white text-left text-sm">
        <SortableHeader label="Task" sortKey="title" width="35%" {...headerProps} />
        <SortableHeader label="Status" sortKey="status" {...headerProps} />
        <SortableHeader label="Owner" sortKey="owner" {...headerProps} />
        <SortableHeader label="Due Date" sortKey="dueDate" {...headerProps} />
        <SortableHeader label="Created" sortKey="createdAt" {...headerProps} />
        <th className="px-4 py-3 font-medium">Actions</th>
      </tr>
    </thead>
  );

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
          <CreateTaskModal owners={allUsers} />
        </div>

        <TaskFilters owners={allUsers} statuses={filterStatusOptions} />

        {allFiltered.length === 0 ? (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              {tableHeader}
              <tbody>
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    <p className="text-sm">
                      {ownerFilter || statusFilter
                        ? "No tasks match the filters."
                        : "No tasks yet — add one below."}
                    </p>
                  </td>
                </tr>
                <InlineAddTask owners={allUsers} statuses={filterStatusOptions} />
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              {tableHeader}
              <tbody>
                {paginatedTasks.map((task, i) => (
                  <InlineEditRow
                    key={task.id}
                    task={task}
                    owners={allUsers}
                    statuses={statusOptions}
                    rowIndex={i}
                  />
                ))}
                <InlineAddTask owners={allUsers} statuses={filterStatusOptions} />
              </tbody>
            </table>

            <Pagination
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              currentPage={currentPage}
            />
          </div>
        )}
      </main>
    </>
  );
}
