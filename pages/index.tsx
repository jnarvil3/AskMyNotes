import { useState } from "react";

export default function Home() {
  const [fileText, setFileText] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      setFileText(text);
      await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    }
  };

  const handleAsk = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.answer);
  };

  return (
    <main className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Chat With Your Notes</h1>

      <input type="file" accept=".txt" onChange={handleFileUpload} />

      <div>
        <input
          className="border p-2 w-full mt-4"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your notes something..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-2"
          onClick={handleAsk}
        >
          Ask
        </button>
      </div>

      {answer && (
        <div className="p-4 bg-gray-100 rounded">
          <strong>Answer:</strong> {answer}
        </div>
      )}
    </main>
  );
}
