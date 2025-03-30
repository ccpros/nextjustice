import { auth, currentUser } from "@clerk/nextjs/server";
import { groq } from "@/lib/groq";
import { selectModelByTask } from "@/lib/modelRouter";
import { detectTaskFromInput } from "@/lib/detectTask";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const session = auth();
  const userId = (await session).userId ?? "guest"; // fallback if unauthenticated

  // 🔍 Try to fetch the user's name
let displayName = "there";
try {
  const user = await currentUser(); // Clerk's helper to get full user info
  if (user?.firstName) displayName = user.firstName;
} catch (e) {
  console.warn("Could not fetch user info:", e);
}


  const body = await req.json();
  const messages = body.messages || [];
  const userMessage = messages?.[messages.length - 1]?.content || "";
  const task = body.task || detectTaskFromInput(userMessage);
  const model = selectModelByTask(task);

  const origin = req.headers.get("origin") || "http://localhost:3000";
  console.log("[SYDNEY] Task:", task, "→ Model:", model);
  console.log("[SYDNEY] Clerk userId:", userId || "GUEST");

  // 🧠 Handle memory commands with Librarian
  if (["summarize", "recall"].includes(task)) {
    try {
      const librarianRes = await fetch(`${origin}/api/librarian`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: task,
          userId: userId || "guest", // ✅ safely fallback
        }),
      });

      const data = await librarianRes.json();
      return NextResponse.json({
        reply: data.reply || "LibrarianBot handled it.",
      });
    } catch (error) {
      return NextResponse.json(
        { reply: "LibrarianBot is unavailable." },
        { status: 500 }
      );
    }
  }

  const systemPrompt = {
    role: "system",
    content: `You are Sydney, a warm and professional assistant for CCPROS.
  
  The user's name is "${displayName}".
  
  Your job is to speak like a real human, not an AI.
  Never show your internal thoughts, plans, or reasoning.
  Do not include any phrases like "Let me think", "I should", or "Maybe I need to".
  Do not use brackets or tags like <think>.
  Do not repeat the user's question.
  Just give the final response — clear, warm, and human.
  Be brief when appropriate. Speak directly.
  Avoid markdown unless asked.
  
  If the user asks for their name, just say: "${displayName}".
  
  End with: "Need anything else, ${displayName}?" unless otherwise directed.`,
  };
  
  

  try {
    const response = await groq.chat.completions.create({
      model,
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    });
  
    const rawReply = response.choices?.[0]?.message?.content ?? "No response.";
    const cleanedReply = rawReply
      .replace(/<think>[\s\S]*?<\/think>/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  
    return NextResponse.json({ reply: cleanedReply });
  } catch (error) {
    console.error("Sydney route exception:", error);
    return NextResponse.json({ reply: "Something went wrong." }, { status: 500 });
  }
}
