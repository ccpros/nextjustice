// /app/api/github/file-tree/route.ts

import { NextResponse } from "next/server";

const REPO_OWNER = "ccpros";
const REPO_NAME = "nextjustice";
const GITHUB_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`;

export async function GET() {
  try {
    const response = await fetch(GITHUB_API, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    const files = data.tree.filter((item: any) => item.type === "blob");

    return NextResponse.json({ files });
  } catch (err) {
    console.error("GitHub Tree Fetch Error:", err);
    return NextResponse.json({ error: "Failed to fetch repo tree" }, { status: 500 });
  }
}
