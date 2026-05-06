"use client";

import { useActionState } from "react";
import { inviteUserAction } from "@/lib/actions";
import { useState } from "react";

export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteUserAction, null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  // Show the invite link when successful
  if (state?.success && state?.token && !inviteLink) {
    const link = `${window.location.origin}/register?token=${state.token}`;
    setInviteLink(link);
  }

  return (
    <div>
      <form action={formAction} className="flex gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="colleague@example.com"
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal focus:border-teal outline-none text-xs"
        />
        <button
          type="submit"
          disabled={pending}
          className="px-3 py-1.5 bg-teal text-white rounded-md text-xs font-medium hover:bg-teal-dark disabled:opacity-50 transition-colors"
        >
          {pending ? "Sending..." : "Send Invite"}
        </button>
      </form>

      {state?.error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      {inviteLink && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium mb-1">Invitation created!</p>
          <p className="text-xs text-green-600 mb-2">
            Share this link with the team member:
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="flex-1 px-2 py-1.5 bg-white border border-green-200 rounded text-xs font-mono text-gray-700"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
              }}
              className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
