import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { Navbar } from "@/components/navbar";
import { NewTaskForm } from "./new-task-form";

export default async function NewTaskPage() {
  const allUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users);

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h1>
        <NewTaskForm teamUsers={allUsers} />
      </main>
    </>
  );
}
