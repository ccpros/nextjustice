import { groq } from "@/lib/groq";
import { sanity } from "@/lib/sanity";
import { NextResponse } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const { command, userId } = await req.json();

  if (!command || !userId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    switch (command) {
      case "summarize": {
        const oldMemories = await sanity.fetch(
          `*[_type == "chatMemory" && userId == $userId] | order(lastUpdated asc)[0..2]`,
          { userId }
        );

        const allMessages = oldMemories.flatMap((m: any) =>
          m.messages.map((msg: any) => ({
            _key: uuidv4(),
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp || new Date().toISOString(),
          }))
        );

        const summaryPrompt: ChatCompletionMessageParam[] = [
          {
            role: "system",
            content:
              "Summarize this chat history clearly and helpfully, for long-term memory retention.",
          },
          {
            role: "user",
            content: allMessages.slice(0, 6000),
          },
        ];

        const response = await groq.chat.completions.create({
          model: "llama3-8b-8192", // LibrarianBot model
          messages: summaryPrompt,
          temperature: 0.5,
          max_tokens: 1024,
        });

        const summary = response.choices[0].message.content;

        // 🧠 Save to long-term memory
        const savedMemory = await sanity.create({
          _type: "longTermMemory",
          userId,
          summary,
          source: ["LibrarianBot", "chatMemory"],
          createdAt: new Date().toISOString(),
        });

        await Promise.all(
          oldMemories.map((doc: any) =>
            sanity.patch(doc._id).set({ archived: true }).commit()
          )
        );

        console.log("[LibrarianBot] Saved summary to longTermMemory:", savedMemory._id);

        return NextResponse.json({
          reply: `🧠 Summary:\n\n${summary}`,
          savedId: savedMemory._id,
        });
      }

      case "recall": {
        const memories = await sanity.fetch(
          `*[_type == "chatMemory" && userId == $userId] | order(lastUpdated desc)[0..2]`,
          { userId }
        );
        return NextResponse.json({ memories });
      }

      default:
        return NextResponse.json({ error: "Unknown command" }, { status: 400 });
    }
  } catch (err) {
    console.error("LibrarianBot Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
