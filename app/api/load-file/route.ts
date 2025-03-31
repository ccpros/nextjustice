import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { repo, branch, path } = await req.json();
    const res = await fetch(
      `https://raw.githubusercontent.com/${repo}/${branch}/${path}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to load file" }, { status: res.status });
    }

    const content = await res.text();
    return NextResponse.json({ success: true, content });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
