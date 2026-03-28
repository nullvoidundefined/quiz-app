# App 2: Link Saver AI Summarizer — Quiz Questions

Each question has four options. Only one is correct (marked with **bold**).

---

**1. What streaming protocol does the Link Saver use to deliver AI-generated summaries to the frontend in real time?**

- A) WebSockets
- **B) Server-Sent Events (SSE)**
- C) HTTP Long Polling
- D) gRPC streaming

? Streaming protocols allow a server to send data to a client incrementally rather than waiting for the entire response to be ready. In AI applications, this is important because LLMs generate text token-by-token, and users prefer seeing words appear progressively rather than waiting seconds for a complete response. Different protocols vary in complexity, directionality, and browser support.

> [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) is a unidirectional streaming protocol where the server pushes updates to the client over a standard HTTP connection. The Express endpoint sets `Content-Type: text/event-stream` and writes chunks of the AI summary as they arrive from Claude. SSE is simpler than WebSockets here because the client only needs to receive data, not send it during the stream.

**2. What is the primary purpose of Redis caching in this application?**

- A) Storing user session tokens
- B) Queuing background jobs for processing
- **C) Caching AI-generated summaries to avoid redundant LLM calls for the same URL**
- D) Rate limiting API requests per user

? Redis is an in-memory data store commonly used for caching — storing frequently accessed data in fast memory to avoid repeating expensive operations. In AI applications, LLM API calls are both slow (seconds of latency) and costly (billed per token). Caching strategies determine when to reuse previous results versus making fresh requests.

> When a user saves a link that has already been summarized, the application checks Redis for a cached summary before calling Claude. This avoids redundant API calls that cost money and add latency. The cache key is typically derived from the URL, and cached summaries have a TTL so they eventually refresh. This pattern is essential for any application where LLM calls are expensive.

**3. What HTTP header must be set for an SSE endpoint to work correctly?**

- A) `Content-Type: application/json`
- B) `Content-Type: text/plain`
- **C) `Content-Type: text/event-stream`**
- D) `Content-Type: application/octet-stream`

? HTTP headers are key-value pairs sent with requests and responses that provide metadata about the message. The Content-Type header tells the client how to interpret the response body — whether it's JSON, plain text, an image, or something else. Browsers and client-side APIs use this header to determine how to parse and handle incoming data, so setting it correctly is essential for protocol compliance.

> The SSE specification requires the server to set `Content-Type: text/event-stream`. This tells the browser (and the `EventSource` API) to treat the response as a stream of events rather than a single response body. Each event is formatted as `data: <payload>\n\n`. Without this header, the browser will not parse the response as an event stream. See the [MDN SSE docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events).

**4. What JavaScript API does the frontend use to consume an SSE stream from the server?**

- **A) EventSource**
- B) fetch with ReadableStream
- C) WebSocket
- D) XMLHttpRequest

? Browsers provide several built-in APIs for consuming data from servers — some designed for one-time requests, others for persistent connections or streaming. When a server sends a stream of events, the frontend needs a client-side API that can maintain the connection, parse incoming events, and fire callbacks as new data arrives. Different APIs offer different levels of built-in functionality like automatic reconnection and event parsing.

> The browser's built-in [`EventSource`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) API connects to an SSE endpoint and fires `onmessage` events as the server sends data. It handles automatic reconnection and last-event-ID tracking out of the box. For POST-based SSE (which `EventSource` does not support natively), libraries like `@microsoft/fetch-event-source` can be used instead.

**5. What data structure does Redis use when caching summaries by URL in this application?**

- A) Redis List
- B) Redis Set
- **C) Redis String (with SET and optional EX/TTL)**
- D) Redis Sorted Set

? Redis supports multiple data structures — strings, lists, sets, sorted sets, hashes, streams, and more — each optimized for different access patterns. Choosing the right data structure depends on what you're storing and how you need to access it. For simple key-value caching where you store one value per key and want automatic expiration, the choice of data structure affects both performance and code simplicity.

> The simplest and most common pattern for key-value caching in Redis is the `SET` command with a string value, using the `EX` option to set a time-to-live in seconds. The key is derived from the URL (often hashed or normalized), and the value is the serialized summary JSON. When the TTL expires, Redis automatically evicts the entry. See the [Redis SET docs](https://redis.io/commands/set/).
