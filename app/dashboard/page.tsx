"use client";

import Link from "next/link";
import { SignInButton, SignedOut, SignedIn, UserButton } from "@clerk/nextjs";

export default function DashboardLanding() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-50 px-4 py-12 text-center">
        <div className="flex flex-col items-center text-center content-center justify-center border border-rounded-lg border-blue-200/100 shadow-lg p-8 bg-white/50 rounded-lg max-w-4xl w-full">
      <h1 className="item-center text-center content-center justify-center text-4xl text-gray-900/80 font-bold mb-4">Welcome to CCPROS</h1>
      <h2 className="text-xl font-semibold text-green-800/70 item-center text-center content-center justify-center">Where advanced generative AI truly helps people!</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-xl text-center item-center content-center justify-center">
        Sign in or create an account to access your personalized dashboard with all tools and features.
      </p>

      <div className="flex gap-4 item-center text-center content-center justify-center">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="item-center text-center content-center justify-center bg-black text-white px-6 py-2 rounded-md hover:bg-gray-900">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <Link href="/dashboard/command">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Go to Your Dashboard
            </button>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
      </div>
    </main>
  );
}
