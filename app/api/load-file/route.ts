import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { repo, branch = "main", path } = await req.json();

    const res = await fetch(`https://raw.githubusercontent.com/${repo}/${branch}/${path}`);
    if (!res.ok) {
      throw new Error(`GitHub fetch failed with status ${res.status}`);
    }

    const content = await res.text();
    return NextResponse.json({ success: true, content });
  } catch (err: any) {
    console.error("Load file error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
