import OpenAI from "openai";

// Universal Groq client (single key)
export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: process.env.GROQ_API_URL || "https://api.groq.com/openai/v1",
});
