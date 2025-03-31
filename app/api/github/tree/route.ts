
// app/api/github/tree/route.ts
import { NextResponse } from "next/server";

const REPO_OWNER = "ccpros";
const REPO_NAME = "nextjustice";
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const repo = searchParams.get("repo");
  const branch = searchParams.get("branch") || "main";

  if (!repo) {
    return NextResponse.json({ error: "Missing repo" }, { status: 400 });
  }

  const [owner, repoName] = repo.split("/");
  const treeUrl = `https://api.github.com/repos/${owner}/${repoName}/git/trees/${branch}?recursive=1`;

  try {
    const res = await fetch(treeUrl, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN ?? ""}`,
        Accept: "application/vnd.github+json",
      },
    });

    const data = await res.json();

    const filtered = data.tree
      ?.filter((item: any) => item.type === "blob" || item.type === "tree")
      .map((item: any) => ({
        name: item.path.split("/").pop(),
        path: item.path,
        type: item.type === "tree" ? "dir" : "file",
      }));

    return NextResponse.json(filtered || []);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch tree" }, { status: 500 });
  }
}
