import { db } from "@/lib/db";
import { notes } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { NoteEditor } from "@/components/note-editor";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NotesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, session.userId))
    .limit(1);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Notes</h1>
        </div>
        <NoteEditor initialContent={note?.content || ""} />
      </main>
    </>
  );
}
