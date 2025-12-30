"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/profile-actions";

interface ProfileFormProps {
  initialDisplayName: string;
  initialUsername: string;
  email: string;
}

export default function ProfileForm({
  initialDisplayName,
  initialUsername,
  email,
}: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [username, setUsername] = useState(initialUsername);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    startTransition(async () => {
      try {
        await updateProfile({
          displayName: displayName.trim(),
          username: username.trim(),
        });
        setSuccess("Profile updated");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to update profile"
        );
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur-lg dark:border-white/10 dark:bg-gray-900/70">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update how your name appears across the app.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              placeholder="e.g. Amuro Ray"
              maxLength={80}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Shown in the dashboard header.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              placeholder="gunpla_fan"
              maxLength={40}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Used as a fallback if no display name is set.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 text-gray-500 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
