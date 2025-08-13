// src/lib/ai.ts
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Defina OPENAI_API_KEY no seu .env.local");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * gpt5Chat – compatível com sua integração atual (sem streaming).
 * Use quando NÃO precisar de streaming nem tools.
 */
export async function gpt5Chat(opts: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  verbosity?: "low" | "medium" | "high";
  reasoning_effort?: "minimal" | "medium" | "high";
  temperature?: number;
}) {
  const {
    messages,
    verbosity = "low",
    reasoning_effort = "minimal",
    temperature = 0.2,
  } = opts;

  const resp = await openai.chat.completions.create({
    model: "gpt-5-chat-latest",
    messages,
    temperature,
    // @ts-ignore – parâmetros aceitos pelo GPT-5
    verbosity,
    // @ts-ignore
    reasoning_effort,
  });

  return resp.choices[0].message;
}
