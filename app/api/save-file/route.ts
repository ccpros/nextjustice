import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { repo, branch, path, content } = await req.json();

    const githubToken = process.env.GITHUB_PAT; // GitHub personal access token
    if (!githubToken) {
      return NextResponse.json({ error: "Missing GitHub token" }, { status: 500 });
    }

    // Step 1: Get current file SHA (required by GitHub API)
    const shaRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const shaData = await shaRes.json();
    const sha = shaData?.sha;

    if (!sha) {
      return NextResponse.json({ error: "Failed to fetch file SHA" }, { status: 400 });
    }

    // Step 2: Commit the updated file
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        message: `Update ${path} from Code Console`,
        content: Buffer.from(content).toString("base64"),
        branch,
        sha,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.message || "GitHub commit failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save file error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
