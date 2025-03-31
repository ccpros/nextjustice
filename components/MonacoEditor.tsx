import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";

interface MonacoEditorProps {
  code: string;
  language?: string;
  onChange: (value: string | undefined) => void;
}

export default function MonacoEditor({ code, language = "typescript", onChange }: MonacoEditorProps) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      // Optional: Customize or manipulate the editor here later
    }
  }, []);

  return (
    <div className="w-full h-full border border-gray-700">
      <Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={code}
        theme="vs-dark"
        onChange={onChange}
        onMount={(editor) => (editorRef.current = editor)}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
