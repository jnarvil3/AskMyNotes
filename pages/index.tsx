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
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white/10 border border-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-white text-center">AskMyNotes</h1>
        <p className="text-center text-slate-300">Upload your notes and ask them anything.</p>

        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="w-full text-sm text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
        />

        <input
          className="w-full rounded-lg bg-slate-800 p-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your notes something..."
        />

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white font-semibold py-2 rounded-lg"
          onClick={handleAsk}
        >
          Ask
        </button>

        {answer && (
          <div className="prose prose-invert max-w-none bg-slate-900 p-6 rounded-lg border border-slate-700">
            <h2>Answer:</h2>
            <p>{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
