"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/lib/actions";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Forgot Password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {state?.success ? (
          <div className="space-y-4">
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              If an account exists with that email, a password reset link has been sent. Please check your inbox.
            </div>
            <Link
              href="/login"
              className="block text-center text-sm text-teal hover:text-teal-dark"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {state.error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-teal outline-none"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full px-4 py-2 bg-teal text-white rounded-lg font-medium hover:bg-teal-dark disabled:opacity-50 transition-colors"
            >
              {pending ? "Sending..." : "Send Reset Link"}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
