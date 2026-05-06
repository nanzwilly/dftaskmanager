import { db } from "@/lib/db";
import { users, invitations } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Navbar } from "@/components/navbar";
import { InviteForm } from "./invite-form";
import { formatDate } from "@/lib/format";

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
          <h1 className="text-xl font-semibold text-gray-800">Team Management</h1>
        </div>

        {/* Invite Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-teal mb-4 uppercase tracking-wider">Invite Team Member</h2>
          <InviteForm />
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-teal text-white text-left text-xs uppercase tracking-wider">
                <th className="px-4 py-2 font-medium bg-teal">Name</th>
                <th className="px-4 py-2 font-medium bg-teal">Email</th>
                <th className="px-4 py-2 font-medium bg-teal">Role</th>
                <th className="px-4 py-2 font-medium bg-teal">Joined</th>
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
                  <td className="px-4 py-2 text-[13px] font-medium text-gray-800">{user.name}</td>
                  <td className="px-4 py-2 text-xs text-gray-600">{user.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        user.role === "admin"
                          ? "bg-teal-light text-teal-dark"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-600">
                    {formatDate(user.createdAt)}
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
                <tr className="bg-teal text-white text-left text-xs uppercase tracking-wider">
                  <th className="px-4 py-2 font-medium bg-teal">Email</th>
                  <th className="px-4 py-2 font-medium bg-teal">Invited</th>
                  <th className="px-4 py-2 font-medium bg-teal">Invite Link</th>
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
                    <td className="px-4 py-2 text-xs text-gray-800">{invite.email}</td>
                    <td className="px-4 py-2 text-xs text-gray-600">
                      {formatDate(invite.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500 font-mono">
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
