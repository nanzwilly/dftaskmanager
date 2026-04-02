import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ProfileDropdown } from "./profile-dropdown";

export async function Navbar() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <nav className="bg-teal text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-lg font-bold text-white">
              TaskManager
            </Link>
            <Link
              href="/agenda"
              className="text-sm text-white/80 hover:text-white"
            >
              Agenda
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-white/80 hover:text-white"
            >
              Tasks
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin/users"
                className="text-sm text-white/80 hover:text-white"
              >
                Team
              </Link>
            )}
          </div>

          <ProfileDropdown name={user.name} role={user.role} />
        </div>
      </div>
    </nav>
  );
}
