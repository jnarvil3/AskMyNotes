// pages/api/chat.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { cosineSimilarity } from "../../utils/similarity";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "No messages provided." });
    }

    // Extract the most recent user question from the conversation
    const question = messages[messages.length - 1].content;

    // Retrieve note embeddings from the in-memory store
    const memory = (global as any).memoryStore || [];
    let context = "";

    if (memory.length > 0) {
      // Embed the question using the same model as when embedding the notes
      const qEmbedResponse = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: question,
      });
      const queryVec = qEmbedResponse.data[0].embedding;
      
      // Calculate cosine similarities and get the top 3 matching chunks
      const ranked = memory
        .map((item: any) => ({
          ...item,
          score: cosineSimilarity(queryVec, item.embedding),
        }))
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, 3);
      
      // Combine the top chunks to form the context
      context = ranked.map((r: any) => r.text).join("\n\n");
    }

    // Build messages for GPT. If note context exists, include it via a system prompt.
    const messagesForGPT = context
      ? [
          {
            role: "system",
            content: "You are a helpful assistant using the following context to answer the user question.",
          },
          { role: "system", content: `Context:\n${context}` },
          ...messages.slice(-1) // only the latest user message
        ]
      : messages;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messagesForGPT,
    });

    const answer = completion.choices[0].message?.content;
    res.status(200).json({ answer });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message });
  }
}
