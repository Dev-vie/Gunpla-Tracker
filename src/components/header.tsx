"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/auth-actions";
import { useState } from "react";
import logo from "../../public/icon.png";

interface HeaderProps {
  displayName?: string | null;
  avatarUrl?: string | null;
}

export default function Header({ displayName, avatarUrl }: HeaderProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const initial = displayName?.trim().charAt(0).toUpperCase() || null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <header className="border-b border-white/10 bg-white/80 backdrop-blur-lg shadow-sm dark:border-white/5 dark:bg-gray-900/70">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo/Title */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src={logo}
              alt="Gunpla Tracker Logo"
              width={32}
              height={32}
              className="h-8 w-8"
              priority
            />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Gunpla Tracker
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3 sm:gap-4">
            {displayName && (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/40 bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-gray-800 shadow-md backdrop-blur dark:border-white/10 dark:bg-gray-800/80 dark:text-gray-100">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white/70 dark:ring-white/20"
                  />
                ) : initial ? (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold ring-2 ring-white/70 dark:ring-white/20">
                    {initial}
                  </span>
                ) : null}
                <span className="truncate max-w-[12rem]" title={displayName}>
                  {displayName}
                </span>
              </div>
            )}
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white font-medium"
            >
              Profile
            </Link>
            <Link
              href="/add"
              className="rounded-full bg-blue-600 px-4 py-2 text-white font-semibold shadow hover:bg-blue-700 transition-colors"
            >
              + Add Kit
            </Link>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white font-medium disabled:opacity-50"
            >
              {isSigningOut ? "Signing out..." : "Sign Out"}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
