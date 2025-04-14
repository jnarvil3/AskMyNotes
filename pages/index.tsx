// pages/index.tsx
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";


type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export default function Home() {
  const systemMessage =
    "You are a helpful assistant answering questions based on user-uploaded notes.";
  const [fileText, setFileText] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: systemMessage },
  ]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Handle file upload and send text for embedding
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setFileText(text);

    await fetch("/api/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    // Reset chat when a new file is uploaded
    setMessages([{ role: "system", content: systemMessage }]);
  };

  // Send the latest user message and the conversation history to the chat API
  const handleSend = async () => {
    if (input.trim() === "") return;
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Sending the full conversation history
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.answer || "No answer returned." }]);
    } catch (error) {
      console.error("Error fetching chat answer:", error);
    }
    setLoading(false);
  };

  // Clear chat and reset to the initial system message
  const handleClearChat = () => {
    setMessages([{ role: "system", content: systemMessage }]);
  };

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="container">
      <h1>AskMyNotes Chat</h1>

      <div className="upload-section mb-4">
  <label
    htmlFor="uploadFile"
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
  >
    Choose File
  </label>
  <input
    id="uploadFile"
    type="file"
    accept=".txt"
    onChange={handleFileUpload}
    className="hidden"
  />
</div>

      <div className="chat-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Chat History</h2>
        <button
  onClick={handleClearChat}
  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
>
  Clear Chat
</button>

      </div>

      <div className="chat-container" ref={chatContainerRef}>
      {messages
  .filter((m) => m.role !== "system")
  .map((m, i) => {
    if (m.role === "assistant") {
      return (
        <div key={i} className="message assistant prose prose-invert">
          <strong>Assistant:</strong>
          <ReactMarkdown>{m.content}</ReactMarkdown>
        </div>
      );
    } else {
      return (
        <div key={i} className="message user">
          <strong>You:</strong> {m.content}
        </div>
      );
    }
  })}

      </div>

      <div className="input-section">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
