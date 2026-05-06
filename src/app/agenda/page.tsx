import { db } from "@/lib/db";
import { agendaDates, agendaItems } from "@/lib/schema";
import { desc, asc } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { AgendaBoard } from "@/components/agenda-board";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AgendaPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const dates = await db
    .select()
    .from(agendaDates)
    .orderBy(desc(agendaDates.date));

  const items = await db
    .select()
    .from(agendaItems)
    .orderBy(asc(agendaItems.sortOrder));

  // Group items by date ID
  const itemsByDateId: Record<number, typeof items> = {};
  for (const item of items) {
    if (!itemsByDateId[item.agendaDateId]) {
      itemsByDateId[item.agendaDateId] = [];
    }
    itemsByDateId[item.agendaDateId].push(item);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Agenda</h1>
        </div>
        <AgendaBoard dates={dates} itemsByDateId={itemsByDateId} />
      </main>
    </>
  );
}
