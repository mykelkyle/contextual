import { Pool } from "pg";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: "react_rag",
});

export interface SearchResult {
  file_name: string;
  chunk_index: number;
  content: string;
  similarity: number;
}

export async function searchRelevantDocs(
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  try {
    const embedding = await generateEmbedding(query);

    const result = await pool.query<SearchResult>(
      `SELECT
                file_name, chunk_index, content,
                1 - (embedding <=> $1::vector) as similarity
             FROM docs
             WHERE 1 - (embedding <=> $1::vector) > 0.4
             ORDER BY similarity DESC
             LIMIT $2`,
      [`[${embedding}]`, limit]
    );

    return result.rows;
  } catch (error) {
    console.error("Error searching activities:", error);
    throw error;
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}
