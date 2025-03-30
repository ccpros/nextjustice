import  SydneyChat  from "@/components/SydneyChat";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12 bg-brand-light text-brand">
      {/* Hero Section */}
     

      {/* Dynamic App Zone */}
      <section className="w-full max-w-screen-xl min-h-[300px] bg-white rounded-xl shadow-soft p-6 text-center">
        <SydneyChat />
      </section>

      {/* Footer */}
      <footer className="mt-16 text-sm text-gray-400 text-center">
        &copy; {new Date().getFullYear()} CCPROS. All rights reserved.
      </footer>
    </main>
  );
}
