"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPasswordAction } from "@/lib/actions";
import Link from "next/link";
import { Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, formAction, pending] = useActionState(resetPasswordAction, null);

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          Invalid reset link. Please request a new one.
        </div>
        <Link
          href="/forgot-password"
          className="block text-center text-sm text-teal hover:text-teal-dark"
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  if (state?.success) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          Your password has been reset successfully.
        </div>
        <Link
          href="/login"
          className="block w-full text-center px-4 py-2 bg-teal text-white rounded-lg font-medium hover:bg-teal-dark transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoFocus
          minLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2 bg-teal text-white rounded-lg font-medium hover:bg-teal-dark disabled:opacity-50 transition-colors"
      >
        {pending ? "Resetting..." : "Reset Password"}
      </button>

      <Link
        href="/login"
        className="block text-center text-sm text-gray-500 hover:text-gray-700"
      >
        Back to login
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Reset Password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your new password below.
        </p>
        <Suspense fallback={<div className="text-center text-sm text-gray-400">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
