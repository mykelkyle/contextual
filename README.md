1. clone repo
2. `npm install`
3. `npm run build`
4. make database

- `psql postgres`
- `CREATE DATABASE react_rag;`

5. run setup for db `node dist/setup.js`
6. generate embeddings `node dist/loadEmbeddings.js`
7. start the chat `node dist/index.js`
