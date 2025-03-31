"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import SydneySidebar from "./SydneySidebar";
import Editor from "@monaco-editor/react";
import FileTree from "./FileTree";

interface CodingConsoleProps {
  code: string;
  setCode: (code: string) => void;
  activeView: "default" | "code" | "ai" | "files" | "plugins";
}


export default function CodingConsole({ code, setCode, activeView }: CodingConsoleProps) {
  const [aiResponse, setAiResponse] = useState("Sydney will assist you here...");
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);


  return (
    <div className="flex flex-col h-full w-full bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 px-6 py-3 border-b border-gray-800 text-lg font-semibold flex items-center justify-between">
        <span>🧠 Coding Console</span>
        
        <Button size="sm" variant="outline" className="text-white border-gray-700">
          Run Code
        </Button>
        <Button
  size="sm"
  variant="outline"
  className="text-white border-gray-700"
  onClick={async () => {
    const res = await fetch("/api/save-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        repo: "ccpros/nextjustice",
        branch: "main",
        path: selectedFilePath, // You'll need to track this in state
        content: code,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ File saved to GitHub.");
    } else {
      alert("❌ Save failed: " + data.error);
    }
  }}
>
  Save File
</Button>

      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conditional File Tree */}
        {activeView === "code" && (
          <div className="w-64 bg-gray-900 border-r border-gray-800 p-3 overflow-y-auto">
          
          </div>
        )}

        {/* Monaco Code Editor */}
        <div className="flex-1 p-4 bg-black">
          <Editor
            height="100%"
            defaultLanguage="typescript"
            defaultValue={code}
            value={code}
            theme="vs-dark"
            onChange={(value) => setCode(value || "")}
          />
        </div>

        {/* Sydney Sidebar */}
        <SydneySidebar
          onCodeUpdate={(newCode: string) => setCode(newCode)}
          aiResponse={aiResponse}
          setAiResponse={setAiResponse}
        />
      </div>
    </div>
  );
}
