import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { cosineSimilarity } from "../../utils/similarity";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { question } = req.body;
  console.log('@JN question is ', question);
  const memory = (global as any).memoryStore || []; // ✅ match embed.ts

  const qEmbed = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: question,
  });
  console.log('@JN qEmbed is ', qEmbed);

  const queryVec = qEmbed.data[0].embedding; // ✅ fix SDK v4 access
  console.log('@JN queryVec is ', queryVec);
  const ranked = memory
    .map((item: any) => ({
      ...item,
      score: cosineSimilarity(queryVec, item.embedding),
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3);

  const context = ranked.map((r: any) => r.text).join("\n\n");
  console.log('@JN context is ', context);

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are helping answer questions from a note file." },
      { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` },
    ],
  });
  console.log('@JN completion is ', completion);

  res.status(200).json({ answer: completion.choices[0].message.content });
}
