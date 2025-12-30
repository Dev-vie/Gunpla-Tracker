"use client";

import { useState } from "react";
import { signUp, signIn } from "@/lib/auth-actions";
import signupBg from "../../public/signup-bg.jpg";
import loginBg from "../../public/login-bg.jpg";
import Image from "next/image";
import icon from "../../public/icon.png";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState(""); // login: email or username
  const [email, setEmail] = useState(""); // signup email
  const [username, setUsername] = useState(""); // signup username
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const backgroundStyle = {
    backgroundImage: `url(${(isSignUp ? signupBg : loginBg).src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#0b0f17",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setError("Username is required");
          setLoading(false);
          return;
        }
        if (!email.trim()) {
          setError("Email is required");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        await (signUp as any)(email, password, username); // allow username to flow through
      } else {
        await signIn(identifier, password);
      }
    } catch (err) {
      // redirect() throws an error, but it's not an actual error
      if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
        // This is expected - redirect is happening
        return;
      }
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={backgroundStyle}
      />
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/70 bg-white/75 p-8 shadow-2xl backdrop-blur-lg backdrop-saturate-150 dark:border-gray-700/80 dark:bg-gray-900/80">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <Image
              src={icon}
              alt="Gunpla Tracker"
              width={48}
              height={48}
              className="h-12 w-12"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gunpla Tracker
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your personal Gundam plastic model collection
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identifier (login) or Username/Email (signup) */}
          {isSignUp ? (
            <>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  placeholder="e.g. gunpla_fan"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </>
          ) : (
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                placeholder="you@example.com or username"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password (Sign Up only) */}
          {isSignUp && (
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        {/* Toggle Form Mode */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
