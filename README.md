# Contextual

**Contextual** is a simple, general-purpose Retrieval-Augmented Generation (RAG) system for Markdown-based documentation. It parses, chunks, and embeds `.md` or `.mdx` files, stores them in a PostgreSQL vector database (`pgvector`), and serves scoped, context-aware answers via OpenAI's API (Embedding is done using `text-embedding-3-small` and prompts are sent to `gpt-4o` by default).

React documentation is used as the default dataset, but any Markdown content can be used with minimal configuration. To change the context source, just replace files in the `data/` directory. 

---

## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:mykelkyle/contextual.git
cd contextual
```

### 2. Install dependencies

`npm install`

### 3. Build the project

`npm run build`

### 4. Create the PostgreSQL database

```
psql postgres
CREATE DATABASE contextual;
```

### 5. Run DB setup

`node dist/setup.js`

### 6. Generate and store embeddings

`node dist/loadEmbeddings.js`

### 7. Start chat interface

`node dist/index.js`

## Environment Variables

Create a `.env` file in the root of the project with the following:

```
OPENAI_API_KEY=<your_openai_key>
DATABASE_URL=<your_db_url>
```

## Future Work

- Web UI for chat and data upload
- Abstract away DB setup 
- Support for additional file formats (.pdf, .html, etc.)

