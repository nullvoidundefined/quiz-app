# App 7: AI Research Assistant — Quiz Questions

Each question has four options. Only one is correct (marked with **bold**).

---

**1. What makes the AI Research Assistant a "compound AI system"?**
- A) It uses multiple different LLM providers simultaneously
- B) It has both a frontend and a backend
- **C) It combines multiple AI patterns (structured extraction, RAG, tool calling, streaming, async processing, real-time collaboration) into a single integrated system**
- D) It uses compound data types in its database schema

? A "compound AI system" is an architectural concept that distinguishes between applications that use a single AI model call in isolation versus those that orchestrate multiple AI techniques, retrieval mechanisms, and processing patterns together. The question asks about what qualifies a system as "compound" — whether it's about provider diversity, full-stack architecture, pattern integration, or data modeling.

> A compound AI system integrates multiple AI patterns and components rather than relying on a single model call. The Research Assistant combines structured extraction (App 1), SSE streaming (App 2), BullMQ async processing (App 3), RAG with pgvector (App 4), multi-tenant context scoping (App 5), and real-time human-in-the-loop collaboration (App 6) into one cohesive application. Each pattern handles a different aspect of the research workflow.

**2. How does the Research Assistant reuse the RAG pattern from App 4?**
- A) It imports App 4 as an npm package
- **B) It implements the same chunking, embedding, and vector search pipeline using pgvector to ground research answers in uploaded documents**
- C) It makes API calls to a running instance of App 4
- D) It copies the App 4 database tables directly

? RAG (Retrieval-Augmented Generation) is a multi-step pipeline involving document ingestion, chunking, embedding, vector storage, similarity search, and context injection into an LLM prompt. When one application reuses a pattern from another, there are different approaches — importing it as a dependency, calling it as a service, replicating the database, or re-implementing the same architectural pattern. The question is about which reuse strategy this application employs.

> The Research Assistant reuses the RAG architecture from App 4 — documents are chunked, embedded, and stored as vectors in PostgreSQL using pgvector. When a user asks a research question, relevant chunks are retrieved via cosine similarity search and injected into Claude's context. The code patterns (chunking strategies, embedding pipeline, similarity queries) are adapted from App 4's implementation.

**3. What role does BullMQ play in the Research Assistant's architecture?**
- A) It manages real-time WebSocket connections
- B) It handles database migrations
- **C) It processes long-running research tasks asynchronously in a worker, so the API can respond immediately**
- D) It schedules periodic data cleanup jobs

? In applications that perform complex, multi-step AI operations — such as crawling sources, processing large document sets, or running chained LLM calls — some tasks can take minutes to complete. The question is about the role of a job queue system within this architecture: what specific problem it solves and how it fits into the request-response flow between the client, API server, and background processes.

> Research tasks like crawling sources, generating embeddings for large document sets, and running multi-step AI analyses can take minutes. BullMQ (the async processing pattern from App 3) offloads these tasks to a separate worker process. The API enqueues the job and returns immediately with a job ID, while the worker processes it in the background and updates status via Redis.

**4. How does the application handle real-time updates when multiple researchers collaborate?**
- A) Each user polls the server every 5 seconds
- B) Users must manually refresh to see updates
- **C) Socket.IO broadcasts changes to all users in the same research project room in real time**
- D) The server sends email notifications for each update

? Collaborative applications where multiple users work on the same project simultaneously need a mechanism to keep everyone's view synchronized. When one user's action produces a result (like an AI task completing or a new finding being added), all other active collaborators should see the update without manual intervention. Different synchronization strategies trade off between simplicity, latency, and server load.

> Reusing the real-time collaboration pattern from App 6, the Research Assistant uses Socket.IO to broadcast updates (new findings, status changes, approval requests) to all connected users in a project room. When one researcher's AI task completes or when human review is needed, all team members see the update instantly without polling or refreshing.

**5. What is the benefit of combining conversation summarization with RAG in a research context?**
- A) It makes the application faster by reducing database queries
- B) It eliminates the need for user authentication
- **C) It maintains long research conversation context via summarization while grounding new answers in source documents via RAG**
- D) It allows the application to work offline

? Research workflows often span extended periods with many exchanges, and they require both continuity (remembering what was discussed earlier) and accuracy (backing claims with evidence from actual sources). Conversation summarization and RAG address different aspects of this challenge — one manages conversation length, the other manages factual grounding. The question is about the specific benefit of using both techniques together in a research application.

> Research conversations can span days and hundreds of messages. Conversation summarization (from App 5) compresses older discussion into a concise context, keeping the conversation coherent without exceeding token limits. RAG (from App 4) ensures each new answer is grounded in actual source documents rather than prior conversation alone. Together, they let the assistant maintain a long-running research thread while always citing real evidence.
