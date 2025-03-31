// app/api/save-file/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { repo, branch = "main", path, content } = await req.json();

    if (!repo || !path || !content) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: "Missing GitHub token" }, { status: 500 });
    }

    // Get the current file's SHA
    const shaRes = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });

    const shaData = await shaRes.json();
    const sha = shaData.sha;

    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `Update ${path} from Command Console`,
        content: Buffer.from(content).toString("base64"),
        branch,
        sha,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: err.message }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
