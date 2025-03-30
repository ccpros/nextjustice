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
    console.log("🚀 Starting Cron Job");

    const users = await sanity.fetch(
      `*[_type == "chatMemory" && !archived] {
        "userId": userId
      }`
    );
    const uniqueUserIds = [...new Set(users.map((u: any) => u.userId))];
    console.log("🧠 Unique users with memory:", uniqueUserIds);

    if (uniqueUserIds.length === 0) {
      console.warn("⚠️ No users with unarchived memory found. Exiting early.");
      return NextResponse.json({ success: true, message: "No memory to summarize." });
    }

    for (const userId of uniqueUserIds) {
      const memories = await sanity.fetch(
        `*[_type == "chatMemory" && userId == $userId && !archived] | order(lastUpdated asc)[0..2]`,
        { userId }
      );

      console.log(`👤 [${userId}] Memory documents:`, memories.length);

      if (!memories.length) {
        console.log(`⏭️ [${userId}] No memory entries to summarize.`);
        continue;
      }

      const combinedMessages = memories
        .flatMap((m: any) => m.messages)
        .map((msg: any) => `${msg.role}: ${msg.content}`)
        .join("\n");

      if (!combinedMessages) {
        console.log(`⏭️ [${userId}] No message content to summarize.`);
        continue;
      }

      const summaryRes = await groqClient.chat.completions.create({
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

      const summary = summaryRes.choices?.[0]?.message?.content;
      console.log(`📝 [${userId}] Generated Summary:\n`, summary);

      if (!summary) {
        console.warn(`❌ [${userId}] Empty summary returned.`);
        continue;
      }

      await sanity.create({
        _type: "longTermMemory",
        _id: `ltm-${uuid()}`,
        userId,
        summary,
        source: ["cron", "auto"],
        createdAt: new Date().toISOString(),
      });

      console.log(`✅ [${userId}] Summary saved to long-term memory.`);

      for (const memory of memories) {
        await sanity.patch(memory._id).set({ archived: true }).commit();
        console.log(`📦 [${userId}] Archived memory ${memory._id}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Auto-summary error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
