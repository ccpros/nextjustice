// app/api/code/execute/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { code } = await req.json();

  try {
    const result = await fetch("http://68.183.168.243:4000/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = await result.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Execution error:", err);
    return NextResponse.json({ error: "Execution failed" }, { status: 500 });
  }
}
