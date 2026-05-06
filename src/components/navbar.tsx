import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { ProfileDropdown } from "./profile-dropdown";
import { GlobalSearch } from "./global-search";

export async function Navbar() {
  const user = await getCurrentUser();
  if (!user) return null;

  const linkClass = "text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors";

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12 items-center">
          <div className="flex items-center gap-5">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-base font-semibold text-gray-900 mr-6"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-teal"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
                <path d="m9 16 2 2 4-4" />
              </svg>
              <span>MeetingManager</span>
            </Link>
            <Link href="/agenda" className={linkClass}>
              Agenda
            </Link>
            <Link href="/dashboard" className={linkClass}>
              Tasks
            </Link>
            <Link href="/notes" className={linkClass}>
              Notes
            </Link>
            {user.role === "admin" && (
              <Link href="/admin/users" className={linkClass}>
                Team
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <GlobalSearch />
            <ProfileDropdown name={user.name} role={user.role} />
          </div>
        </div>
      </div>
    </nav>
  );
}
