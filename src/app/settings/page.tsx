import { Navbar } from "@/components/navbar";
import { ChangePasswordForm } from "./change-password-form";

export default function SettingsPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
        <ChangePasswordForm />
      </main>
    </>
  );
}
