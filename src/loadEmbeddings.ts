import dotenv from "dotenv";
import fs from "fs";
import OpenAI from "openai";
import path from "path";
import { Client } from "pg";

dotenv.config();
const dataDir = path.join(__dirname, "../data");

const getMarkdownFiles = (dir: string): string[] => {
  let files: string[] = [];
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getMarkdownFiles(fullPath));
    } else if (fullPath.endsWith(".md")) {
      files.push(fullPath);
    }
  });

  return files;
};

const chunkMarkdownByHeadings = (mdFiles: string[]) => {
  const chunks: any[] = [];
  let currentChunk = "";
  let chunkIndex = 1;

  mdFiles.forEach((file) => {
    const fileContent = fs.readFileSync(file, "utf-8");

    const cleanContent = fileContent
      .replace(/---[\s\S]*?---/g, "") // frontmatter metdata
      .replace(/<[^>]+>/g, ""); // html tags

    const sections = cleanContent
      .split("\n\n")
      .filter((section) => section.trim().length > 0);

    sections.forEach((section) => {
      if (currentChunk.length + section.length < 400) {
        currentChunk += section + "\n\n";
      } else {
        if (currentChunk.trim().length >= 400) {
          chunks.push({
            file_name: path.basename(file),
            chunk_index: chunkIndex++,
            content: currentChunk.trim(),
          });
        }
        currentChunk = section + "\n\n";
      }
    });

    if (currentChunk.trim().length >= 400) {
      chunks.push({
        file_name: path.basename(file),
        chunk_index: chunkIndex++,
        content: currentChunk.trim(),
      });
    }
  });

  return chunks;
};

async function generateEmbeddings() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const client = new Client({
    host: "localhost",
    port: 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "contextual",
  });

  try {
    await client.connect();
    const mdFiles = getMarkdownFiles(dataDir);
    const chunks = chunkMarkdownByHeadings(mdFiles);

    for (const chunk of chunks) {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk.content,
      });

      const embedding = await JSON.stringify(
        embeddingResponse.data[0].embedding
      );

      const query = `
        INSERT INTO docs (file_name, chunk_index, content, embedding)
        VALUES ($1, $2, $3, $4)
      `;
      const values = [
        chunk.file_name,
        chunk.chunk_index,
        chunk.content,
        embedding,
      ];

      await client.query(query, values);
    }
    console.log("Embeddings generated and stored successfully");
  } catch (err) {
    console.log(
      "Error trying to generate embeddings or inserting into DB",
      err
    );
  } finally {
    await client.end();
  }
}

generateEmbeddings();
