// pages/api/embed.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { chunkText } from "../../utils/chunkText";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory store for note embeddings (for MVP only)
(global as any).memoryStore = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    // Split the uploaded text into chunks
    const chunks = chunkText(text, 500);
    const embeddings = await Promise.all(
      chunks.map(async (chunk: string) => {
        const result = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: chunk,
        });
        return {
          text: chunk,
          embedding: result.data[0].embedding,
        };
      })
    );

    (global as any).memoryStore = embeddings;
    res.status(200).json({ status: "embedded", count: embeddings.length });
  } catch (error: any) {
    console.error("Embedding error:", error);
    res.status(500).json({ error: error.message });
  }
}
