# App 4: Document QA RAG — Quiz Questions

Each question has four options. Only one is correct (marked with **bold**).

---

**1. What PostgreSQL extension does the Document QA app use for vector similarity search?**

- A) PostGIS
- B) pg_trgm
- **C) pgvector**
- D) pg_search

? PostgreSQL extensions add specialized capabilities beyond the core database engine. For AI applications that need to search by semantic meaning (finding text that is conceptually similar rather than matching exact keywords), the database needs to store high-dimensional vectors (embeddings) and perform efficient nearest-neighbor searches over them. Different extensions serve different search use cases — geographic, trigram text matching, full-text search, or vector similarity.

> [pgvector](https://github.com/pgvector/pgvector) is a PostgreSQL extension that adds vector data types and similarity search operators. It stores embeddings as `vector(N)` columns and supports nearest-neighbor queries using operators like `<=>` (cosine distance), `<->` (L2 distance), and `<#>` (inner product). This eliminates the need for a separate vector database like Pinecone or Weaviate — everything stays in PostgreSQL.

**2. What does RAG stand for, and what problem does it solve?**

- A) Rapid API Gateway — it speeds up API responses
- B) Runtime Aggregation Graph — it combines data from multiple sources
- **C) Retrieval-Augmented Generation — it grounds LLM responses in specific documents to reduce hallucination**
- D) Recursive Answer Generation — it refines answers through multiple LLM passes

? LLMs are trained on large corpora and can generate fluent text, but they have no access to private documents, recent information, or domain-specific knowledge outside their training data. They can also "hallucinate" — confidently generate plausible but incorrect information. The question asks about an architectural pattern that addresses these limitations by combining information retrieval with text generation.

> [Retrieval-Augmented Generation (RAG)](https://docs.anthropic.com/en/docs/build-with-claude/retrieval-augmented-generation) retrieves relevant document chunks before generating an answer. The user's question is embedded, similar chunks are found via vector search, and those chunks are injected into Claude's context as source material. This grounds the response in actual documents rather than relying solely on the model's training data.

**3. What is the purpose of "chunking" documents before embedding them?**

- A) To compress the documents for faster storage
- B) To encrypt the documents for security
- **C) To split documents into smaller pieces that fit within embedding model token limits and improve retrieval precision**
- D) To convert documents from one format to another

? Before documents can be searched semantically, they must be converted into numerical vectors (embeddings) by an embedding model. These models have input size limits, and the granularity of what gets embedded affects how precisely the system can retrieve relevant information. Chunking is the preprocessing step that determines how documents are divided before this conversion happens, and the strategy used (size, overlap, boundaries) significantly impacts retrieval quality.

> Embedding models have token limits (typically 512-8192 tokens), and large documents exceed these limits. Chunking splits documents into overlapping segments so each piece can be individually embedded and retrieved. Smaller chunks also improve retrieval precision — a query about a specific topic will match a focused chunk better than an entire document. Overlap between chunks ensures context is not lost at boundaries.

**4. How does the citation system in this application link answers back to source documents?**

- A) By appending the full document text to every response
- B) By returning a list of all documents in the database
- **C) By tracking which retrieved chunks were used in the response and returning their document references and locations**
- D) By using footnote numbers that link to a bibliography page

? In document QA systems, users need to verify that AI-generated answers are accurate and actually supported by the source material. A citation system provides traceability — linking claims in the AI's response back to the specific parts of the original documents that informed them. This is a trust and accountability mechanism that distinguishes production-quality RAG systems from simple chatbots.

> The citation system records which chunks were retrieved and included in Claude's context. When the response is returned, each claim or section is linked back to the specific document chunk(s) that informed it — including the document name, page number, or section. This lets users verify the AI's claims against the original source material, which is critical for trust in document QA applications.

**5. What distance metric is most commonly used with pgvector for text embedding similarity?**

- A) Euclidean distance (`<->`)
- **B) Cosine distance (`<=>`)**
- C) Manhattan distance
- D) Jaccard similarity

? Distance metrics measure how far apart two vectors are in a high-dimensional space, and different metrics capture different notions of "similarity." The choice of metric matters because embedding models encode semantic meaning into vector directions and magnitudes, and some metrics are sensitive to magnitude differences while others are not. The right metric depends on how the embedding model was trained and what properties of the vectors carry meaningful information.

> Cosine distance (`<=>` operator in pgvector) is the standard metric for text embedding similarity because it measures the angle between vectors regardless of magnitude. This is important because embedding models can produce vectors of slightly varying magnitudes for semantically similar texts. Cosine distance normalizes for this, focusing purely on directional similarity. See the [pgvector docs](https://github.com/pgvector/pgvector#distances) for all supported distance functions.
