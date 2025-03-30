// app/api/memory/summarize-all/route.ts

import { NextResponse } from "next/server";
import { sanity } from "@/lib/sanity";
import { groq as groqClient } from "@/lib/groq";
import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("🔥 Cron job authorized");

  try {
    // Step 1: Get distinct users
    const users = await sanity.fetch(
      `*[_type == "chatMemory" && !archived] {
        "userId": userId
      }`
    );

    const uniqueUserIds = [...new Set(users.map((u: any) => u.userId))];
    console.log(`👥 Found ${uniqueUserIds.length} unique users with memory.`);

    // Step 2: Summarize each user's memory
    for (const userId of uniqueUserIds) {
      console.log(`🔄 Processing user: ${userId}`);

      const memories = await sanity.fetch(
        `*[_type == "chatMemory" && userId == $userId && !archived] | order(lastUpdated asc)[0..2]`,
        { userId }
      );

      const combinedMessages = memories
        .flatMap((m: any) =>
          m.messages.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")
        )
        .join("\n\n");

      if (!combinedMessages) {
        console.log(`⚠️ No messages to summarize for user: ${userId}`);
        continue;
      }

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
      console.log(`🧠 Summary for user ${userId}:\n${summary.slice(0, 100)}...`);

      // Save summary to long-term memory
      await sanity.create({
        _type: "longTermMemory",
        _id: `ltm-${uuid()}`,
        userId,
        summary,
        source: ["cron", "auto"],
        createdAt: new Date().toISOString(),
      });

      console.log(`✅ Saved long-term memory for ${userId}`);

      // Archive original memory entries
      for (const memory of memories) {
        await sanity.patch(memory._id).set({ archived: true }).commit();
      }

      console.log(`📦 Archived ${memories.length} memory items for ${userId}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Auto-summary error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
