"use client";

import { useState } from "react";

export default function SydneyChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const res = await fetch("/api/sydney", {
      method: "POST",
      body: JSON.stringify({ messages: newMessages }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    setIsLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-4">
      <div className="bg-white p-4 rounded-lg shadow h-80 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <strong>{msg.role === "user" ? "You" : "Sydney"}:</strong> {msg.content}
          </div>
        ))}
        {isLoading && <div>Sydney is thinking...</div>}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          placeholder="Ask Sydney anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
