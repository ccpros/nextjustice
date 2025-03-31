"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import NavBar from "./components/NavBar";
import CodingConsole from "./components/CodingConsole";
import FileTree from "./components/FileTree";

export default function CommandDashboard() {
  const { user, isLoaded } = useUser();
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");


  useEffect(() => {
    if (isLoaded && !user) {
      redirect("/");
    }
  }, [isLoaded, user]);

  const [view, setView] = useState<"default" | "code" | "ai" | "files" | "plugins">("default");
  const [code, setCode] = useState("// Start coding here...");

  if (!isLoaded || !user) return null;

 

  return (
    <div className="h-[calc(100vh-8rem)] bg-black text-white font-mono">
      {/* 🔷 NAVBAR at top */}
      <NavBar onChangeView={setView} />

      {/* 🧱 MAIN CONTENT BELOW NAVBAR */}
      <div className="flex">
        {/* Left Sidebar */}
        {/* Left Sidebar */}
<aside className="w-64 bg-gray-800 border-r border-gray-700 h-[calc(100vh-8rem)] p-4 overflow-y-auto">
  <p className="text-sm text-gray-400 mb-2">Navigation</p>
  <ul className="space-y-2 mb-4">
    <li className="hover:text-blue-400 cursor-pointer" onClick={() => setView("default")}>🧠 Systems</li>
    <li className="hover:text-blue-400 cursor-pointer">📁 Data Vault</li>
    <li className="hover:text-blue-400 cursor-pointer">📡 Communications</li>
    <li className="hover:text-blue-400 cursor-pointer">🧩 Diagnostics</li>
  </ul>

  {view === "code" && (
    <>
      <p className="text-sm text-gray-400 mb-2">🗂 Repo Explorer</p>
      <FileTree
  repo="ccpros/nextjustice"
  onFileSelect={(fileContent, filePath) => {
    setCode(fileContent);
    setSelectedFilePath(filePath);
  }}
/>


    </>
  )}
</aside>


        {/* Central Panel */}
        <main className="flex-1 h-[calc(100vh-8rem)] overflow-y-auto p-6 bg-gradient-to-br from-gray-900 to-black">
          {view === "default" && (
            <div className="border border-gray-700 rounded-xl p-6 bg-black/40 shadow-inner">
              <h2 className="text-2xl font-semibold mb-4">Central Interface</h2>
              <p className="text-gray-300">
                This is where AI-assisted tools, data logs, command modules, and interactive panels will live.
              </p>
            </div>
          )}

          {view === "code" && (
            <CodingConsole code={code} setCode={setCode} selectedFilePath={selectedFilePath} activeView={view} />
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="w-64 bg-gray-800 border-l border-gray-700 h-[calc(100vh-8rem)] p-4">
          <p className="text-sm text-gray-400 mb-2">Status</p>
          <ul className="space-y-2">
            <li>🟢 AI: Online</li>
            <li>🟢 Memory: Stable</li>
            <li>🟡 Comms: Limited</li>
            <li>🔴 Backups: Pending</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
