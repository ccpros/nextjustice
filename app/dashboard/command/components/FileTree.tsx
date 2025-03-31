"use client";

import { useEffect, useState } from "react";
import { Folder, FolderOpen, File } from "lucide-react";
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

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: TreeNode[];
}

function buildTree(files: GitHubFile[]): TreeNode[] {
  const root: { [key: string]: TreeNode } = {};

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isLast = i === parts.length - 1;
      const path = parts.slice(0, i + 1).join("/");

      if (!current[name]) {
        current[name] = {
          name,
          path,
          type: isLast ? file.type : "dir",
          children: [],
        };
      }

      if (!isLast) {
        current = current[name].children as any;
      }
    }
  }

  const convert = (obj: { [key: string]: TreeNode }): TreeNode[] =>
    Object.values(obj).map((node) => ({
      ...node,
      children: node.children ? convert(node.children as any) : undefined,
    }));

  return convert(root);
}

export default function FileTree({ repo, branch = "main", onFileSelect }: FileTreeProps) {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/github/tree?repo=${repo}&branch=${branch}`);
        const data = await res.json();
        setTree(buildTree(data));
      } catch (err) {
        console.error("Error loading file tree:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [repo, branch]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(path) ? next.delete(path) : next.add(path);
      return next;
    });
  };

  const renderNode = (node: TreeNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path);

    return (
      <li key={node.path}>
        <div
          style={{ paddingLeft: `${depth * 16}px` }}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer text-white"
          onClick={() => {
            if (node.type === "dir") {
              toggleFolder(node.path);
            } else {
              // Fetch and load the file
              fetch("/api/load-file", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  repo,
                  branch,
                  path: node.path,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.success) {
                    onFileSelect(data.content, node.path);
                  } else {
                    console.error("Load failed:", data.error);
                  }
                });
            }
          }}
        >
          {node.type === "dir" ? (
            isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
          ) : (
            <File size={16} />
          )}
          {node.name}
        </div>
        {isExpanded && node.children && (
          <ul>{node.children.map((child) => renderNode(child, depth + 1))}</ul>
        )}
      </li>
    );
  };

  return (
    <div className="p-3 overflow-y-auto h-full">
      <h3 className="font-bold text-sm text-white mb-3">📂 Repo Files</h3>
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <ul className="space-y-1 text-sm">{tree.map((node) => renderNode(node))}</ul>
      )}
    </div>
  );
}
