"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { v4 as uuid } from "uuid";
import { useUser } from "@clerk/nextjs";
import { Loader } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function SydneyChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const sessionId = useRef(uuid());
  const { user } = useUser();

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/sydney", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.reply,
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      await fetch("/api/save-memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || "guest",
          sessionId: sessionId.current,
          messages: updatedMessages,
        }),
      });
    } catch (err) {
      console.error("Sydney error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-white">
      {/* HEADER */}
      <header className="px-6 py-4 border-b text-center font-semibold text-xl">
        Welcome to Sydney
      </header>

      {/* CHAT CENTER */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col w-full max-w-2xl border rounded-md shadow bg-white h-[500px]">
          <div
            ref={chatRef}
            className="flex-1 min-h-[300px] overflow-y-auto p-4 space-y-3 bg-gray-100 rounded-t-md"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-md max-w-xl whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-white text-black"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="text-gray-500 italic flex items-center space-x-2">
                <Loader className="animate-spin" size={20} />
                <span>Sydney is thinking...</span>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-3 border-t"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Talk to Sydney..."
              className="flex-1 px-4 py-2 border rounded-md"
            />
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="px-6 py-4 border-t text-center text-sm text-gray-500">
        © {new Date().getFullYear()} CCPROS — Sydney AI
      </footer>
    </main>
  );
}
