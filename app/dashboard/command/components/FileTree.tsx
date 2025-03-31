"use client";

import { useEffect, useState } from "react";
import { Folder, File } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface GitHubFile {
  name: string;
  path: string;
  type: "file" | "dir";
}

interface FileTreeProps {
  repo: string;
  branch?: string;
  onFileSelect: (fileContent: string, filePath: string) => void;

}

export default function FileTree({ repo, branch = "main", onFileSelect }: FileTreeProps) {
  const [tree, setTree] = useState<GitHubFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/github/tree?repo=${repo}&branch=${branch}`);
        const data = await res.json();
        setTree(data);
      } catch (err) {
        console.error("Error loading file tree:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [repo, branch]);

  return (
    <div className="p-3 overflow-y-auto h-full">
      <h3 className="font-bold text-sm text-white mb-3">📂 Repo Files</h3>
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <ul className="space-y-1 text-sm">
          {tree.map((item) => (
            <li
              key={item.path}
              onClick={() => {
                fetch("/api/load-file", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    repo,
                    branch,
                    path: item.path, // ✅ fix from `file.path` to `item.path`
                  }),
                })
                  .then(async (res) => {
                    const contentType = res.headers.get("Content-Type") || "";
                    const text = await res.text();
              
                    if (!res.ok) {
                      console.error("Load failed. Status:", res.status);
                      if (contentType.includes("text/html")) {
                        console.error("Received HTML:", text);
                      } else {
                        console.error("JSON Error:", text);
                      }
                      return;
                    }
              
                    if (contentType.includes("application/json")) {
                      const data = JSON.parse(text);
                      onFileSelect(data.content, item.path);

                    } else {
                      console.error("Unexpected response type:", contentType);
                    }
                  })
                  .catch((err) => {
                    console.error("Network error loading file:", err);
                  });
              }}
              
              
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer text-white"
            >
              {item.type === "dir" ? <Folder size={16} /> : <File size={16} />}
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
