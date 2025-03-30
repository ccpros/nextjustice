// app/api/memory/summarize-all/route.ts

import { NextResponse } from "next/server";
import { sanity } from "@/lib/sanity";
import { groq as groqClient } from "@/lib/groq";
import { v4 as uuid } from "uuid";




export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.log("🔥 Cron job authorized");

  try {
    // Step 1: Get distinct users with recent memory
    const users = await sanity.fetch(
      `*[_type == "chatMemory" && !archived] {
        "userId": userId
      }`
    );

    const uniqueUserIds = [...new Set(users.map((u: any) => u.userId))];

    // Step 2: For each user, get memory and summarize
    for (const userId of uniqueUserIds) {
      const memories = await sanity.fetch(
        `*[_type == "chatMemory" && userId == $userId && !archived] | order(lastUpdated asc)[0..2]`,
        { userId }
      );

      const combinedMessages = memories.flatMap((m: any) =>
        m.messages.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")
      ).join("\n\n");

      if (!combinedMessages) continue;

      const res = await groqClient.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "Summarize this chat history clearly and helpfully, for long-term memory retention.",
          },
          {
            role: "user",
            content: combinedMessages.slice(0, 6000),
          },
        ],
        temperature: 0.5,
        max_tokens: 1024,
      });

      const summary = res.choices?.[0]?.message?.content || "";
      await sanity.create({
        _type: "longTermMemory",
        _id: `ltm-${uuid()}`,
        userId,
        summary,
        source: ["cron", "auto"],
        createdAt: new Date().toISOString(),
      });
      

      // Step 3: Save to long-term memory
      await sanity.create({
        _type: "longTermMemory",
        _id: `ltm-${uuid()}`,
        userId,
        summary,
        source: ["cron", "auto"],
        createdAt: new Date().toISOString(),
      });

      // Step 4: Mark those memory items as archived
      for (const memory of memories) {
        await sanity.patch(memory._id).set({ archived: true }).commit();
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Auto-summary error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
