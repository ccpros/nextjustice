// app/api/save-memory/route.ts

import { NextResponse } from "next/server";
import { sanity } from "@/lib/sanity";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const session = auth();
  const userId = (await session).userId ?? "guest";

  const body = await req.json();
  const { messages = [], tags = [] } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages to save." }, { status: 400 });
  }

  try {
    const timestamp = new Date().toISOString();

    const formattedMessages = messages.map((msg: any) => ({
      _key: uuidv4(),
      role: msg.role,
      content: msg.content,
      timestamp,
    }));

    await sanity.create({
      _type: "chatMemory",
      _id: `chat-${uuidv4()}`,
      userId,
      sessionId: `session-${uuidv4()}`,
      messages: formattedMessages,
      tags,
      createdAt: timestamp,
      lastUpdated: timestamp,
      archived: false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("💾 Memory save error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
