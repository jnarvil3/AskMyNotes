import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import { cosineSimilarity } from "../../utils/similarity";

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { question } = req.body;
  const memory = (global as any).memory || [];

  const qEmbed = await openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: question,
  });

  const queryVec = qEmbed.data.data[0].embedding;

  const ranked = memory
    .map((item: any) => ({
      ...item,
      score: cosineSimilarity(queryVec, item.embedding),
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3); // Top 3 chunks

  const context = ranked.map((r: any) => r.text).join("\n\n");

  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are helping answer questions from a note file." },
      { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` },
    ],
  });

  res.status(200).json({ answer: completion.data.choices[0].message?.content });
}
