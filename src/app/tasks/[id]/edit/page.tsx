import { db } from "@/lib/db";
import { tasks, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { EditTaskForm } from "./edit-form";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const taskId = parseInt(id);

  const [task] = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  if (!task) notFound();

  const allUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Task</h1>
        <EditTaskForm task={task} teamUsers={allUsers} />
      </main>
    </>
  );
}
