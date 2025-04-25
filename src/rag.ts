import { searchRelevantDocs } from "./search";
import { Message } from "./utils";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function askQuestion(history: Message[]) {
  try {
    const question = history[history.length - 1].content;
    const searchResults = await searchRelevantDocs(question, 5);

    const context = searchResults
      .map(
        (result, index) =>
          `
          ${index + 1}
          FILE: ${result.file_name}
          FILE_CHUNK: ${result.chunk_index}
          CONTENT: ${result.content}
          (Similarity: ${result.similarity.toFixed(2)})`
      )
      .join("\n");

    console.log(`${"---------------------"}\n${context}`);
    const contextMessage: Message = {
      role: "system",
      content: `Relevant Entries:\n${context}`,
    };

    history.push(contextMessage);

    const messages = history.map((msg) => ({
      role: msg.role === "developer" ? "user" : msg.role,
      content: msg.content,
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion;
  } catch (error) {
    console.error("Error in RAG:", error);
    throw error;
  }
}
