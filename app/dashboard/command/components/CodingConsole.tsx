"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";

interface CodingConsoleProps {
  code: string;
  setCode: (code: string) => void;
  selectedFilePath: string;
  activeView: "default" | "code" | "ai" | "files" | "plugins";
}

export default function CodingConsole({
  code,
  setCode,
  selectedFilePath,
}: CodingConsoleProps) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [command, setCommand] = useState("");

  const handleSave = async () => {
    if (!selectedFilePath) return;

    setSaveStatus("saving");
    try {
      const res = await fetch("/api/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: "ccpros/nextjustice",
          branch: "main",
          path: selectedFilePath,
          content: code,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Save failed:", err);
      setSaveStatus("error");
    }
  };

  const runCommand = async () => {
    if (!command.trim()) return;

    setTerminalOutput((prev) => [...prev, `> ${command}`]);

    try {
      const res = await fetch("http://68.183.168.243:4000/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: command }),
      });

      const data = await res.json();
      setTerminalOutput((prev) => [...prev, data.output || ""]);
    } catch (err) {
      setTerminalOutput((prev) => [...prev, "❌ Error running command"]);
    }

    setCommand("");
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-white border border-gray-800 rounded-md overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-b border-gray-800">
        <h2 className="text-sm font-bold text-white">🧠 Coding Console</h2>
        <Button
          variant="outline"
          className="text-white border-gray-700 hover:bg-gray-800"
          onClick={handleSave}
          disabled={saveStatus === "saving"}
        >
          {saveStatus === "saving"
            ? "Saving..."
            : saveStatus === "saved"
            ? "✅ Saved"
            : saveStatus === "error"
            ? "❌ Error"
            : "💾 Save File"}
        </Button>
      </div>

      {/* Code Editor */}
      <div className="flex-1 min-h-0 bg-black">
        <Editor
          height="100%"
          theme="vs-dark"
          defaultLanguage="typescript"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
        />
      </div>

      {/* Terminal Section */}
      <div className="h-40 border-t border-gray-800 bg-black flex flex-col p-2 text-sm">
        <div className="flex-1 overflow-y-auto font-mono text-green-400 mb-2">
          {terminalOutput.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runCommand();
          }}
          className="flex items-center gap-2"
        >
          <span className="text-green-400 font-mono">$</span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none"
            placeholder="Type command and press Enter"
          />
        </form>
      </div>
    </div>
  );
}
