import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function SydneyChat() {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/sydney", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMessage],
        userId: user?.id ?? "guest",
      }),
    });

    const data = await res.json();
    const botMessage = { role: "assistant", content: data.reply };
    setMessages((prev) => [...prev, botMessage]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto mt-10 p-4 border rounded-xl shadow-md">
      <div className="text-xl font-bold mb-4">Sydney</div>
      <div className="flex flex-col gap-2 mb-4 max-h-[300px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {loading && (
          <div className="text-left">
            <span className="inline-block px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
              Sydney is typing...
            </span>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded-lg"
          placeholder="Talk to Sydney..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
