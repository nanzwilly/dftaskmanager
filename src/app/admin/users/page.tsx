import { db } from "@/lib/db";
import { users, invitations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { InviteForm } from "./invite-form";

export default async function AdminUsersPage() {
  const allUsers = await db.select().from(users).orderBy(users.createdAt);

  const pendingInvites = await db
    .select()
    .from(invitations)
    .where(eq(invitations.accepted, false))
    .orderBy(invitations.createdAt);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
        </div>

        {/* Invite Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-teal mb-4">Invite Team Member</h2>
          <InviteForm />
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-teal text-white text-left text-sm">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    i % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                        user.role === "admin"
                          ? "bg-teal-light text-teal-dark"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-teal text-white text-left text-sm">
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Invited</th>
                  <th className="px-4 py-3 font-medium">Invite Link</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvites.map((invite, i) => (
                  <tr
                    key={invite.id}
                    className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                      i % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-800">{invite.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
                      /register?token={invite.token}&email={invite.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
