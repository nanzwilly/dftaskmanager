import { db } from "@/lib/db";
import { tasks, users } from "@/lib/schema";
import { eq, ne, and, gte, lte, asc, desc, type SQL } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { TaskFilters } from "@/components/task-filters";
import { Pagination } from "@/components/pagination";
import { InlineAddTask } from "@/components/inline-add-task";
import { InlineEditRow } from "@/components/inline-edit-row";
import { SortableHeader } from "@/components/sortable-header";
import { CreateTaskModal } from "@/components/create-task-modal";

const PAGE_SIZE = 50;

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
  completedAt: tasks.completedAt,
} as const;

const dateRangeOptions = [
  { value: "thisWeek", label: "This Week" },
  { value: "lastWeek", label: "Last Week" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "custom", label: "Custom..." },
];

function getDateRange(
  range: string,
  customFrom?: string,
  customTo?: string,
): { start: Date; end: Date } | null {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (range === "custom") {
    if (!customFrom || !customTo) return null;
    const start = new Date(customFrom + "T00:00:00");
    const end = new Date(customTo + "T00:00:00");
    end.setDate(end.getDate() + 1); // include the end day
    return { start, end };
  }

  if (range === "last7days") {
    const start = new Date(startOfDay);
    start.setDate(start.getDate() - 7);
    return { start, end: new Date(startOfDay.getTime() + 86400000) };
  }

  if (range === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }

  // For week-based ranges, use Sunday as start of week
  const dayOfWeek = startOfDay.getDay(); // 0 = Sunday
  const startOfThisWeek = new Date(startOfDay);
  startOfThisWeek.setDate(startOfThisWeek.getDate() - dayOfWeek);

  if (range === "thisWeek") {
    const end = new Date(startOfThisWeek);
    end.setDate(end.getDate() + 7);
    return { start: startOfThisWeek, end };
  }

  if (range === "lastWeek") {
    const start = new Date(startOfThisWeek);
    start.setDate(start.getDate() - 7);
    return { start, end: startOfThisWeek };
  }

  return null;
}

type SortKey = keyof typeof SORT_COLUMNS;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const ownerFilter = typeof params.owner === "string" ? params.owner : "";
  const statusFilter = typeof params.status === "string" ? params.status : "";
  const dateRangeFilter = typeof params.dateRange === "string" ? params.dateRange : "";
  const dateFrom = typeof params.dateFrom === "string" ? params.dateFrom : "";
  const dateTo = typeof params.dateTo === "string" ? params.dateTo : "";
  const currentPage = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1", 10) || 1);

  const sortParam = typeof params.sort === "string" ? params.sort : "dueDate";
  const dirParam = typeof params.dir === "string" ? params.dir : "asc";
  const sortKey: SortKey = sortParam in SORT_COLUMNS ? (sortParam as SortKey) : "dueDate";
  const sortDir = dirParam === "asc" ? "asc" : "desc";

  const showCompletedColumn = statusFilter === "done";

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

  // Date range filter — only applies when filtering by Completed status,
  // and filters by the completedAt timestamp.
  if (dateRangeFilter && showCompletedColumn) {
    const range = getDateRange(dateRangeFilter, dateFrom, dateTo);
    if (range) {
      conditions.push(gte(tasks.completedAt, range.start));
      conditions.push(lte(tasks.completedAt, range.end));
    }
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
      completedAt: tasks.completedAt,
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

  const totalColumns = showCompletedColumn ? 7 : 6;

  const taskColWidth = showCompletedColumn ? "28%" : "35%";

  const tableHeader = (
    <thead>
      <tr className="bg-gray-50 text-gray-700 text-left text-[13px] font-semibold uppercase tracking-wider border-b-2 border-teal">
        <SortableHeader label="Task" sortKey="title" width={taskColWidth} {...headerProps} />
        <SortableHeader label="Status" sortKey="status" {...headerProps} />
        <SortableHeader label="Owner" sortKey="owner" {...headerProps} />
        <SortableHeader label="Due Date" sortKey="dueDate" {...headerProps} />
        <SortableHeader label="Created" sortKey="createdAt" {...headerProps} />
        {showCompletedColumn && (
          <SortableHeader label="Completed" sortKey="completedAt" {...headerProps} />
        )}
        <th className="px-4 py-2 font-medium whitespace-nowrap">Actions</th>
      </tr>
    </thead>
  );

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Tasks <span className="ml-1 text-sm font-medium text-gray-400">({totalItems})</span>
          </h1>
          <CreateTaskModal owners={allUsers} />
        </div>

        <TaskFilters owners={allUsers} statuses={filterStatusOptions} dateRanges={dateRangeOptions} />

        {allFiltered.length === 0 ? (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              {tableHeader}
              <tbody>
                <tr>
                  <td colSpan={totalColumns} className="text-center py-10 text-gray-500">
                    <p className="text-sm">
                      {ownerFilter || statusFilter
                        ? "No tasks match the filters."
                        : "No tasks yet — add one below."}
                    </p>
                  </td>
                </tr>
                <InlineAddTask owners={allUsers} statuses={filterStatusOptions} extraColumns={showCompletedColumn ? 1 : 0} />
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
                    showCompletedColumn={showCompletedColumn}
                  />
                ))}
                <InlineAddTask owners={allUsers} statuses={filterStatusOptions} extraColumns={showCompletedColumn ? 1 : 0} />
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
