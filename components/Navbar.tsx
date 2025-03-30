'use client';

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* CCPROS Logo / Title */}
        <Link href="/" className="text-2xl font-serif font-bold text-brand hover:opacity-80 transition">
          CCPROS
        </Link>

        {/* Nav Links */}
        <div className="flex gap-6 text-sm font-sans text-gray-700">
          <Link href="/justice-now" className="hover:text-brand-accent transition">
            JusticeNow
          </Link>
          <Link href="/contact" className="hover:text-brand-accent transition">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
