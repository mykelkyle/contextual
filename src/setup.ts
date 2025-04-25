import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

async function setup() {
  const client = new Client({
    host: "localhost",
    port: 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: "react_rag",
  });

  try {
    await client.connect();

    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");

    await client.query(`
      CREATE TABLE IF NOT EXISTS docs (
        id SERIAL PRIMARY KEY,
        file_name TEXT NOT NULL,
        chunk_index INT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536)
      );
    `);

    console.log("Database setup complete!");
  } catch (err) {
    console.error("Error setting up db", err);
  } finally {
    await client.end();
  }
}

setup();
