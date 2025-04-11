import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { chunkText } from "../../utils/chunkText";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

(global as any).memoryStore = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('@JN req.body is ', req.body);
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text } = req.body;
    console.log('@JN text is ', text);
    if (!text) return res.status(400).json({ error: "No text provided" });

    const chunks = chunkText(text, 500);
    console.log('@JN chunks is ', chunks);

    const embeddings = await Promise.all(
      chunks.map(async (chunk) => {
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
    console.log('@JN memoryStore aka embeddings is ', (global as any).memoryStore);
    return res.status(200).json({ status: "embedded", count: embeddings.length });
  } catch (err: any) {
    console.error("@JN Embedding error:", err);
    console.error("Embedding error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
