# Agentic Travel Agent — 100 Quiz Questions

Each question has four options. Only one is correct (marked with **bold**).

---

### Application Architecture

**1. What is the maximum number of tool calls allowed per agent turn?**

- A) 5
- B) 10
- **C) 15**
- D) 20

? In an agentic AI loop, the model can call external tools (APIs, functions, databases) multiple times per conversation turn. A "tool call limit" is a safety mechanism that caps how many tool invocations the agent can make in a single turn before being forced to stop and return a response. This prevents runaway loops from consuming resources indefinitely.

> The agent loop in `agent.service.ts` enforces a hard cap of 15 tool calls per turn. This prevents runaway loops from burning through API quota or causing requests to hang indefinitely. The limit is checked before each iteration of the while loop — once reached, the loop breaks and returns whatever response Claude has produced so far.

**2. What streaming protocol does the application use to send tool progress events to the frontend?**

- A) WebSockets
- **B) Server-Sent Events (SSE)**
- C) HTTP Long Polling
- D) gRPC streaming

? Streaming protocols allow a server to push data to a client in real time over a persistent connection. Different protocols have different trade-offs: some are bidirectional (client and server both send), others are unidirectional (server pushes only). The choice depends on whether the client needs to send data during the stream and how much infrastructure complexity is acceptable.

> SSE is a unidirectional (server → client) streaming protocol built on standard HTTP. The chat endpoint at `POST /trips/:id/chat` sets `Content-Type: text/event-stream` and pushes `tool_start`, `tool_result`, and `assistant` events as the agent loop runs. SSE is simpler than WebSockets for this use case because the client only needs to receive updates, not send them during streaming. See the [MDN SSE docs](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) for more.

**3. What is the application's caching TTL for external API responses?**

- A) 15 minutes
- B) 30 minutes
- **C) 1 hour**
- D) 24 hours

? A cache TTL (Time To Live) determines how long a cached response is considered valid before it expires and must be re-fetched from the original source. Shorter TTLs keep data fresher but increase API usage; longer TTLs reduce API calls but risk serving stale data. The right TTL depends on how frequently the underlying data changes and how costly each API call is.

> Both the Redis hot cache and the PostgreSQL `api_cache` table use a 1-hour TTL. This balances freshness (flight prices change, but not minute-to-minute) with quota preservation — on SerpApi's free tier of 250 searches/month, aggressive caching is essential. The TTL is set in `cache.service.ts` when storing responses.

**4. How many database tables does the application schema define?**

- A) 6
- B) 8
- **C) 10**
- D) 12

? A database schema defines the structure of a relational database — its tables, columns, data types, constraints, and relationships. Each table represents a distinct entity or concept in the application (users, sessions, trips, etc.). Migration files create these tables in a specific order to respect foreign key dependencies.

> The 10 tables are defined across 10 migration files in `server/migrations/`: (1) `users`, (2) `sessions`, (3) `trips`, (4) `trip_flights`, (5) `trip_hotels`, (6) `trip_experiences`, (7) `conversations` + `messages` (created in one migration), (8) `api_cache`, (9) `tool_call_log`, and (10) `user_preferences`. Each migration uses [node-pg-migrate](https://salsita.github.io/node-pg-migrate/).

**5. What deployment platform hosts the Express API server?**

- A) Vercel
- B) Render
- **C) Railway**
- D) Fly.io

? Deployment platforms provide infrastructure for running backend services in the cloud. They handle containerization, scaling, networking, environment variable management, and logging. Different platforms specialize in different workloads — some focus on serverless functions, others on persistent processes like API servers, and some offer built-in add-ons like databases and caches.

> [Railway](https://railway.app/) hosts the Express API server and the Redis instance. Vercel hosts the Next.js frontend. Railway was chosen for its simple container deployments, built-in Redis add-on, and straightforward environment variable management — all accessible via the Railway MCP server during development.

**6. What is the relationship between trips and conversations?**

- A) One trip to many conversations
- **B) One trip to one conversation (1:1)**
- C) Many trips to one conversation
- D) Conversations are not linked to trips

? Database cardinality describes how many rows in one table can relate to rows in another. Common patterns are one-to-one (1:1), one-to-many (1:N), and many-to-many (M:N). The cardinality is enforced through constraints like UNIQUE, NOT NULL, and foreign keys, which prevent invalid relationships from being created at the database level.

> The `conversations` table has a `UNIQUE` constraint on `trip_id`, enforcing a strict 1:1 relationship. Each trip gets exactly one conversation thread. All messages (user, assistant, and tool results) for that trip live under a single conversation. This simplifies context loading — the agent always sees the full history for the trip.

**7. What stop reason from Claude indicates the agent loop should terminate?**

- A) `stop`
- B) `complete`
- **C) `end_turn`**
- D) `finished`

? When calling an LLM API, the model's response includes a stop reason that tells the caller why the model stopped generating. Different stop reasons indicate different states — the model may have finished its response naturally, hit a token limit, or be requesting to use an external tool. The calling application uses this field to decide what to do next.

> In the [Anthropic API](https://docs.anthropic.com/en/api/messages), Claude's response includes a `stop_reason` field. When it equals `"end_turn"`, the model has finished generating and is not requesting any tool calls. When it equals `"tool_use"`, the model wants to call one or more tools, and the loop continues. The agent loop checks `response.stop_reason === "end_turn"` to decide when to break.

**8. How does the application store trip preferences?**

- **A) JSONB column on the trips table**
- B) Separate preferences table with foreign keys
- C) Redis hash per trip
- D) Serialized JSON in a text column

? Trip preferences are user-specified settings like travel style, pace, and interests that personalize the planning experience. Applications can store this kind of semi-structured, variable-shape data in several ways — as separate relational rows, as serialized text, or as structured document columns that the database can index and query into.

> Trip preferences (travel style, pace, interests) are stored as a `JSONB` column directly on the `trips` table. JSONB is a PostgreSQL type that stores JSON in a binary format, enabling indexing and querying into the JSON structure. This avoids the need for a separate join table while keeping the schema flexible for varying preference shapes.

**9. What package manager does the monorepo use?**

- A) npm
- B) yarn
- **C) pnpm**
- D) bun

? A package manager handles installing, updating, and resolving dependencies for a project. In a monorepo (a single repository containing multiple packages), the package manager also needs workspace support — the ability to link packages together and share dependencies across them efficiently.

> The project uses [pnpm](https://pnpm.io/) with workspace support (configured in `pnpm-workspace.yaml`). pnpm's content-addressable storage deduplicates dependencies across the `server/` and `web-client/` packages, saving disk space and installation time. The root `package.json` defines workspace-level scripts that delegate to each package.

**10. What tool does the application use for database migrations?**

- A) Prisma Migrate
- B) Knex
- **C) node-pg-migrate**
- D) TypeORM

? Database migrations are versioned scripts that incrementally evolve a database schema over time — creating tables, adding columns, building indexes, etc. Migration tools track which scripts have already run and apply them in order, ensuring every environment (dev, staging, production) has the same schema. Each tool offers different trade-offs between raw SQL control and ORM-level abstraction.

> [node-pg-migrate](https://salsita.github.io/node-pg-migrate/) is a lightweight, SQL-first migration runner for PostgreSQL. Unlike ORMs like Prisma or TypeORM, it lets you write raw SQL in migration files, giving full control over DDL statements. The 10 migration files in `server/migrations/` use its JavaScript API to define `up` and `down` functions.

---

### Claude API & Tool Use

**11. What Claude model does the application use for the agent loop?**

- A) claude-opus-4-20250514
- **B) claude-sonnet-4-20250514**
- C) claude-haiku-4-5-20251001
- D) claude-3-5-sonnet-20241022

? Anthropic offers multiple Claude models at different capability tiers. Higher-tier models (Opus) have stronger reasoning but are slower and more expensive per token. Lower-tier models (Haiku) are faster and cheaper but less capable at complex tasks. The model choice for an agent loop is a trade-off between response quality, latency per round-trip, and cost per conversation.

> The agent uses `claude-sonnet-4-20250514`, which balances strong reasoning and tool-use capabilities with reasonable cost and latency. Opus would be more capable but slower and more expensive for an interactive agent loop that makes multiple round-trips. Haiku would be faster but less reliable at complex multi-step planning. The model is configured in `agent.service.ts`.

**12. How many tool definitions does the application register with Claude?**

- A) 3
- **B) 5**
- C) 7
- D) 10

? In the Anthropic Messages API, tools are defined as JSON schemas that describe available functions the model can call. Each tool definition includes a name, description, and input schema specifying the expected parameters. The number of registered tools affects how much of the context window is consumed by tool definitions and how many options the model has to choose from.

> The five tools are defined in `tools/definitions.ts`: (1) `search_flights` — searches SerpApi Google Flights, (2) `search_hotels` — searches SerpApi Google Hotels, (3) `search_experiences` — searches Google Places Text Search, (4) `calculate_remaining_budget` — performs server-side budget arithmetic, and (5) `get_destination_info` — resolves city names to IATA codes, timezones, and currencies.

**13. What SDK does the server use to call the Anthropic API?**

- A) `anthropic` (Python)
- **B) `@anthropic-ai/sdk`**
- C) `claude-sdk`
- D) `@claude/api`

? An SDK (Software Development Kit) is a library that wraps a REST API with typed functions, request builders, and error handling in a specific programming language. SDKs simplify API integration by handling authentication, serialization, retries, and providing IDE autocompletion — instead of manually constructing HTTP requests.

> [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk) is the official TypeScript/JavaScript SDK for the Anthropic API. It provides typed interfaces for messages, tool use, streaming, and error handling. The `anthropic` package (option A) is the Python equivalent. Options C and D don't exist.

**14. What does Claude return in its response when it wants to call a tool?**

- A) A `function_call` field
- **B) `tool_use` content blocks**
- C) A `tool_request` header
- D) An `actions` array

? When an LLM supports tool use (also called function calling), it needs a structured way to communicate which tool it wants to invoke and with what parameters. Different LLM providers use different response formats for this — some embed it in special fields, others use typed content blocks within the response body.

> In the [Anthropic Messages API](https://docs.anthropic.com/en/docs/build-with-claude/tool-use), when Claude decides to call a tool, its response contains content blocks of type `"tool_use"`, each with an `id`, `name`, and `input` object. This is different from OpenAI's `function_call` field (option A). The agent loop filters for these blocks and dispatches each one to the tool executor.

**15. After executing a tool, how are results returned to Claude?**

- **A) As a user message containing `tool_result` content blocks**
- B) As a system message with the result
- C) As a separate API call to a results endpoint
- D) Appended to the assistant's last message

? In a tool-use conversation, after the application executes the tool the model requested, it must send the result back to the model so the model can incorporate it into its reasoning. The way this result is structured and what message role it uses varies by LLM provider and affects how the model interprets the data.

> Per the [Anthropic tool use protocol](https://docs.anthropic.com/en/docs/build-with-claude/tool-use), tool results are sent back as a `user` role message containing content blocks of type `"tool_result"`, each with a `tool_use_id` matching the original `tool_use` block. This maintains the alternating user/assistant message structure that Claude expects.

**16. Why does the application use a dedicated tool for budget calculation instead of asking Claude to do the math?**

- A) Claude refuses to perform arithmetic
- B) Tool calls are cheaper than text generation
- **C) LLMs are unreliable at arithmetic**
- D) Budget data is not available in the prompt

? Large language models generate text by predicting the next token, which is fundamentally different from performing mathematical computation. When a task requires precise numerical calculations — especially multi-step arithmetic with decimals — there is a question of whether the model should attempt it directly or delegate to deterministic code.

> Large language models frequently make arithmetic errors, especially with multi-step calculations involving decimals and currency. The `calculate_remaining_budget` tool performs deterministic server-side math: total budget minus sum of selected flights, hotels, and estimated experience costs. This guarantees correct budget tracking, which is critical for making sound planning decisions.

**17. What field in Claude's API response tracks token consumption?**

- A) `meta.tokens`
- B) `statistics.token_count`
- **C) `usage.input_tokens` and `usage.output_tokens`**
- D) `billing.tokens_used`

? LLM APIs charge based on token usage — the number of tokens in the input (prompt, conversation history, tool definitions) and output (model's response). Tracking token consumption per request is essential for monitoring costs, detecting anomalies (unexpectedly large prompts), and understanding usage patterns across an application.

> Every response from the [Anthropic Messages API](https://docs.anthropic.com/en/api/messages) includes a `usage` object with `input_tokens` and `output_tokens` counts. The application tracks these per turn and stores them in the `messages` table's `token_count` field for monitoring cost and usage patterns.

**18. What happens when the agent reaches the 15-call safety limit?**

- **A) The loop terminates and returns whatever response is available**
- B) Claude is asked to summarize and continue in a new turn
- C) The request is queued for retry
- D) An error is thrown and the conversation is reset

? Safety limits in agentic loops are mechanisms that prevent the system from running indefinitely. When a limit is hit, the application must decide how to handle the situation — it could fail hard with an error, attempt a graceful recovery, or return partial results. The choice affects both user experience and system reliability.

> The safety limit is a hard break in the while loop. When the tool call counter reaches 15, the loop exits and the most recent assistant text response (if any) is returned to the user. This is a graceful degradation — the user gets partial results rather than an error. They can always send a follow-up message to continue planning.

---

### External APIs

**19. What service does the application use to search for flights?**

- A) Amadeus Flight Offers API
- B) Skyscanner API
- **C) SerpApi Google Flights engine**
- D) Kiwi.com Tequila API

? Flight search can be implemented through direct airline/aggregator APIs (which provide raw inventory data) or through search engine scraping services (which return structured data from consumer-facing search results). Each approach has different trade-offs in terms of data freshness, pricing accuracy, integration complexity, and free tier availability.

> [SerpApi](https://serpapi.com/) provides a `google_flights` engine that scrapes Google Flights search results and returns structured JSON. This was chosen over direct airline APIs (like Amadeus) because SerpApi provides a simpler integration with normalized response formats, and its free tier (250 searches/month) is sufficient for a portfolio project.

**20. What is the SerpApi free tier search limit?**

- A) 100 searches/month
- **B) 250 searches/month**
- C) 500 searches/month
- D) 1,000 searches/month

? API providers typically offer tiered pricing plans, with a free tier that imposes strict usage limits. Understanding these limits is critical for applications that rely on external APIs — exceeding the quota results in either blocked requests or unexpected charges. Applications must design their caching and rate-limiting strategies around these constraints.

> SerpApi's free plan includes 250 searches per month across all engines (flights, hotels, web search, etc.). This is why the application uses aggressive two-tier caching (Redis + PostgreSQL) — without caching, a single agent turn using 3-4 tool calls could consume over 1% of the monthly quota. See [SerpApi pricing](https://serpapi.com/pricing) for details.

**21. What Google API does the application use to find experiences and activities?**

- A) Google Maps Directions API
- **B) Google Places API (New) — Text Search**
- C) Google Custom Search API
- D) Google Travel API

? Google offers multiple APIs for location-based data, each serving different use cases: directions and routing, place discovery and details, geocoding, and more. The "Text Search" variant accepts natural language queries and returns matching places with metadata like ratings, addresses, and price levels, making it suitable for discovering activities and attractions.

> The [Google Places API (New)](https://developers.google.com/maps/documentation/places/web-service/text-search) Text Search endpoint (`POST /v1/places:searchText`) accepts natural language queries like "museums in Paris" and returns places with names, ratings, addresses, and price levels. The "New" version uses field masking via the `X-Goog-FieldMask` header to request only needed fields, reducing cost.

**22. What identifier format do the flight search tools require for airports?**

- A) Full airport name (e.g., "San Francisco International")
- B) City name (e.g., "San Francisco")
- **C) IATA codes (e.g., "SFO")**
- D) ICAO codes (e.g., "KSFO")

? Airports can be identified by several naming systems: full names, city names, three-letter codes assigned by the International Air Transport Association (IATA), and four-letter codes from the International Civil Aviation Organization (ICAO). Flight search APIs typically require a specific format to avoid ambiguity — a city might have multiple airports, and names vary across languages.

> The SerpApi Google Flights engine requires [IATA airport codes](https://www.iata.org/en/publications/directories/code-search/) — three-letter identifiers assigned by the International Air Transport Association (e.g., SFO, JFK, CDG, NRT). The `get_destination_info` tool resolves city names to IATA codes using a built-in lookup table of 24+ major destinations, so the agent can convert user input like "San Francisco" to "SFO".

**23. How many results does the application return per search category (flights, hotels, experiences)?**

- A) 3
- **B) 5**
- C) 10
- D) All available results

? When an external API returns a large number of results (sometimes 50+), the application must decide how many to pass into the LLM's context. More results give the model more options to choose from, but each result consumes tokens from the context window and makes reasoning harder. The number of results is a trade-off between choice breadth and context efficiency.

> Each tool normalizes API results to the top 5 options sorted by price. This keeps the context window manageable — sending all results (sometimes 50+ flights) would waste tokens and make it harder for Claude to reason about the options. Five options give the user meaningful choice without overwhelming the agent's context.

**24. What HTTP header does the Google Places API use for field selection?**

- A) `Accept-Fields`
- B) `Google-Fields`
- **C) `X-Goog-FieldMask`**
- D) `Content-Fields`

? Some APIs allow clients to specify exactly which fields they want in the response, rather than returning all available data. This field selection (or field masking) reduces response size, transfer time, and — in the case of APIs that charge per field category — cost. The mechanism for specifying desired fields varies by API provider.

> The [Google Places API (New)](https://developers.google.com/maps/documentation/places/web-service/text-search) uses the `X-Goog-FieldMask` header to specify which fields to include in the response (e.g., `places.displayName,places.rating,places.formattedAddress`). This is important for cost — Google charges based on which field categories are requested (Basic, Advanced, Preferred), so requesting only needed fields reduces per-request cost.

**25. How does the application normalize cache keys to maximize cache hits?**

- A) MD5 hash of the raw request body
- **B) Sorted parameters, lowercased, whitespace stripped**
- C) SHA-256 of the URL string
- D) UUID generated per request type

? Cache key normalization is the process of transforming request parameters into a canonical form before using them as a cache lookup key. Without normalization, semantically identical requests with different parameter ordering or casing would produce different cache keys, resulting in cache misses and redundant API calls.

> The `normalizeCacheKey` function in `cache.service.ts` sorts parameter keys alphabetically, lowercases all string values, and strips whitespace. This ensures that `{origin: "SFO", destination: "BCN"}` and `{destination: "BCN", origin: "SFO"}` produce the same cache key, preventing redundant API calls for semantically identical requests.

---

### Frontend & React

**26. What version of Next.js does the frontend use?**

- A) 13
- B) 14
- **C) 15**
- D) 16

? Next.js is a React framework that provides server-side rendering, file-system-based routing, and build optimizations. Major versions introduce significant changes — new routing paradigms, React version support, caching behavior, and APIs. The version determines which features and patterns are available to the application.

> The frontend uses [Next.js 15](https://nextjs.org/blog/next-15) with the App Router. Next.js 15 introduced stable support for React 19, improved caching semantics, and the `after()` API. The App Router (introduced in v13) provides file-system-based routing with layouts, loading states, and route groups — all used in this application's `(auth)` and `(protected)` route groups.

**27. What library manages server state (data fetching, caching, mutations) on the frontend?**

- A) SWR
- B) Redux Toolkit Query
- **C) TanStack React Query (v5)**
- D) Apollo Client

? Server state management libraries handle the lifecycle of data fetched from APIs: loading, caching, background refetching, error handling, and cache invalidation after mutations. Unlike client state (UI toggles, form inputs), server state is asynchronous, shared across components, and can become stale — requiring specialized tools beyond `useState` and `useEffect`.

> [TanStack React Query v5](https://tanstack.com/query/latest) handles all server state: fetching trips and messages with `useQuery`, creating/deleting trips with `useMutation`, and automatic cache invalidation on updates. It provides stale-while-revalidate caching, retry logic, and loading/error states out of the box, eliminating the need for manual fetch + useState patterns.

**28. What styling approach does the frontend use?**

- A) Tailwind CSS utility classes
- B) Styled Components
- **C) SCSS modules**
- D) CSS-in-JS with Emotion

? Frontend applications can style components using several approaches: utility-first CSS frameworks (classes like `flex`, `p-4`), CSS-in-JS (writing CSS inside JavaScript), traditional stylesheets, or CSS preprocessors with module scoping. Each approach has trade-offs in terms of developer experience, performance, bundle size, and style isolation between components.

> The frontend uses [SCSS](https://sass-lang.com/) (Sass) with CSS Modules. SCSS extends CSS with variables, nesting, and mixins, while CSS Modules scope class names to the component to prevent style collisions. Next.js has built-in support for both — `.module.scss` files are automatically processed. The `sass` package is listed in `web-client/package.json`.

**29. What component streams real-time tool progress from the agent?**

- A) AgentStream
- **B) ChatBox**
- C) ToolStream
- D) AgentConsole

? In an agentic AI application, the frontend needs a component that manages the full chat experience: establishing a streaming connection, receiving progress events as the agent works (tool invocations, intermediate results), displaying real-time feedback to the user, and rendering the final response once the agent completes its turn.

> The `ChatBox` component in `components/ChatBox/ChatBox.tsx` manages the full chat experience: it opens an SSE connection to the `/trips/:id/chat` endpoint, processes incoming `tool_start`, `tool_result`, and `assistant` events, renders animated progress indicators for each tool call, and displays the final streamed text response.

**30. What Next.js routing pattern does the application use for protected pages?**

- A) Middleware-based redirects
- B) `getServerSideProps` auth checks
- **C) Route groups with an AuthGuard wrapper component**
- D) Client-side redirects in `useEffect`

? Protected pages are routes that should only be accessible to authenticated users. In a Next.js App Router application, there are several patterns for enforcing authentication: server middleware, server-side data fetching guards, layout-level wrapper components, or client-side redirect logic. Each approach runs at a different point in the request lifecycle and has different trade-offs.

> Protected pages live under the `(protected)/` route group directory. The `AuthGuard` component wraps this group's layout — it checks `AuthContext` for a logged-in user and redirects to `/login` if absent. Route groups (parenthesized directory names) are a Next.js App Router feature that organize routes without affecting the URL path.

**31. How does the frontend connect to the SSE endpoint for chat?**

- A) Native WebSocket API
- **B) `fetch` or `EventSource` to the `/trips/:id/chat` endpoint**
- C) Socket.IO client
- D) GraphQL subscriptions

? Browsers provide multiple APIs for establishing streaming connections to servers. The `EventSource` API is designed specifically for Server-Sent Events but only supports GET requests. The `fetch` API with stream reading can handle any HTTP method, including POST, which is necessary when the client needs to send a request body (like a chat message) to initiate the stream.

> The `useChat` hook uses `fetch` with credentials to `POST /trips/:id/chat`, then reads the response body as a stream. The `EventSource` API could also be used for GET-based SSE, but since this endpoint requires a POST body (the user's message), `fetch` with `getReader()` is used instead. Events are parsed from the `text/event-stream` format and dispatched to component state.

**32. What does the MockChatBox component on the landing page do?**

- A) Connects to a free-tier agent with limited tools
- B) Uses cached responses from a real conversation
- **C) Displays a non-interactive demo conversation**
- D) Runs the agent loop with mock API responses

? Landing pages for AI products need to demonstrate the product experience to unauthenticated visitors. This creates a design challenge: the demo should look and feel like the real product, but it cannot make actual API calls (which would consume quota and require authentication). Different approaches include scripted demos, cached replays, and sandboxed environments.

> `MockChatBox` in `components/MockChatBox/MockChatBox.tsx` renders a scripted, non-interactive conversation to show visitors what the agent experience looks like. It uses hardcoded messages with simulated typing animations — no API calls are made. This lets the landing page demonstrate the product without requiring authentication or consuming API quota.

**33. What React version does the application use?**

- A) 17
- B) 18
- **C) 19**
- D) 18.3

? React is a JavaScript library for building user interfaces. Major versions introduce new APIs, rendering behaviors, and patterns. The version determines which hooks, components, and optimization techniques are available — and it must be compatible with the framework (like Next.js) and other libraries in the dependency tree.

> The application uses [React 19](https://react.dev/blog/2024/12/05/react-19), which ships with Next.js 15. React 19 introduced Actions (async functions in transitions), the `use()` hook for reading promises and context, `useOptimistic` for optimistic UI updates, and `useFormStatus` for form state. The `react` and `react-dom` packages are both at version 19 in `web-client/package.json`.

---

### Authentication & Security

**34. How does the application store user sessions?**

- A) JWTs in localStorage
- B) JWTs in HTTP-only cookies
- **C) Session tokens in the database with HTTP-only cookies**
- D) OAuth tokens from Supabase

? Session management determines how a web application tracks authenticated users across requests. Common approaches include stateless tokens (like JWTs, which encode user data in the token itself) and stateful sessions (where a random token maps to a server-side record). Each approach has different trade-offs for security, scalability, and revocation capabilities.

> Sessions are stored as rows in the `sessions` table (with `token_hash`, `user_id`, and `expires_at`). The raw token is set as an HTTP-only `sid` cookie. On each request, the `loadSession` middleware reads the cookie, hashes it, and looks up the matching session row. This approach is more secure than JWTs for revocation — deleting the session row immediately invalidates access, while JWTs remain valid until expiry.

**35. What library hashes user passwords?**

- A) argon2
- **B) bcrypt**
- C) scrypt
- D) pbkdf2

? Password hashing converts a plaintext password into a fixed-length, irreversible string using a computationally expensive algorithm. Unlike general-purpose hash functions (SHA-256), password-specific hashing algorithms are deliberately slow and include built-in salts, making brute-force and rainbow table attacks impractical. Different libraries implement different underlying algorithms.

> The [`bcrypt`](https://www.npmjs.com/package/bcrypt) library is used for password hashing in the auth handler. bcrypt is a battle-tested adaptive hash function designed specifically for passwords — it includes a built-in salt and a configurable cost factor (work rounds) that makes brute-force attacks computationally expensive. It's listed in `server/package.json`.

**36. How many rounds of bcrypt hashing does the application use?**

- A) 8
- **B) 10**
- C) 12
- D) 14

? Bcrypt's "rounds" (or cost factor) parameter controls how many iterations of the underlying cipher are performed — specifically 2^N iterations for a cost factor of N. Higher values make each hash computation take exponentially longer, which slows down both legitimate logins and brute-force attacks. The choice is a balance between security and acceptable login latency.

> The application uses a cost factor of 10 (which means 2^10 = 1,024 iterations of the underlying Blowfish cipher). This is bcrypt's default and provides a good balance between security and login latency (~100ms per hash). Higher values (12-14) are more secure but add noticeable delay to login/register requests. The salt rounds are set in the auth handler when calling `bcrypt.hash(password, 10)`.

**37. What is the rate limit on authentication endpoints?**

- A) 5 requests per 15 minutes
- **B) 10 requests per 15 minutes**
- C) 20 requests per 15 minutes
- D) 50 requests per 15 minutes

? Rate limiting restricts how many requests a client can make to an endpoint within a time window. Authentication endpoints are especially sensitive targets because attackers can attempt credential stuffing (testing stolen username/password pairs) or brute-force attacks (guessing passwords). Stricter rate limits on auth endpoints provide protection without affecting normal user behavior.

> The `rateLimiter` middleware in `middleware/rateLimiter.ts` applies two tiers: a global limit of 100 requests per 15 minutes per IP, and a stricter limit of 10 requests per 15 minutes on auth endpoints (`/auth/login`, `/auth/register`). The stricter auth limit protects against credential stuffing and brute-force attacks.

**38. What is the session cookie's TTL?**

- A) 1 day
- B) 3 days
- **C) 7 days**
- D) 30 days

? A session cookie's TTL (Time To Live) determines how long a user stays logged in before the session expires and they must re-authenticate. The TTL is set both on the cookie itself (`maxAge`) and on the server-side session record (`expires_at`). The duration balances user convenience (longer = fewer logins) with security (shorter = less exposure if a session is compromised).

> Session cookies are set with a `maxAge` of 7 days (604,800 seconds). The corresponding `sessions` table row also has an `expires_at` timestamp set 7 days in the future. Both the cookie and the database row must be valid for the session to work — even if someone extends the cookie client-side, the server-side lookup will reject expired sessions.

**39. What middleware protects against Cross-Site Request Forgery?**

- A) `csurf` package
- **B) Custom `csrfGuard` middleware**
- C) Double-submit cookie from Express
- D) CSRF tokens via Supabase Auth

? Cross-Site Request Forgery (CSRF) is an attack where a malicious website tricks a user's browser into making authenticated requests to a different site. Since browsers automatically include cookies with requests, a victim who is logged into Site A could unknowingly trigger actions on Site A when visiting malicious Site B. CSRF protection ensures that state-changing requests originate from the legitimate application.

> The application uses a custom `csrfGuard` middleware in `middleware/csrfGuard.ts` rather than the deprecated [`csurf`](https://www.npmjs.com/package/csurf) package (which was deprecated in 2022 due to design issues). The custom middleware validates the `Origin` and `Referer` headers on state-changing requests (POST, PUT, DELETE) to ensure they match the expected domain.

---

### Backend & Infrastructure

**40. What Express version does the API server use?**

- A) 4.18
- B) 4.21
- **C) 5**
- D) 6

? Express is the most widely used Node.js web framework. Major version upgrades introduce breaking changes alongside new features. Key improvements in newer versions often address longstanding pain points — such as how async errors are handled in route handlers, which historically required workarounds or additional packages.

> The server uses [Express 5](https://expressjs.com/en/guide/migrating-5.html), which introduced native promise support in route handlers (rejected promises are automatically caught), improved path matching, and removed several deprecated APIs. Express 5 was a long-awaited major release that eliminated the need for `express-async-errors` or manual try-catch in async handlers.

**41. What logging library does the server use?**

- A) Winston
- B) Morgan
- **C) Pino**
- D) Bunyan

? A logging library is a tool that records events, errors, and diagnostic information as an application runs. Loggers output structured messages (often as JSON) that help developers debug issues, monitor performance, and trace request flows in production. Unlike `console.log`, dedicated logging libraries support log levels (info, warn, error), structured output, and configurable destinations.

> [Pino](https://getpino.io/) is a high-performance JSON logger for Node.js. It's significantly faster than Winston because it uses synchronous string concatenation and avoids object serialization in the hot path. The application uses Pino for structured request logging (via a request logger middleware) and application-level logging throughout the codebase. Logs are output as JSON lines, making them easy to parse in Railway's log viewer.

**42. What Redis client library does the application use?**

- A) `redis`
- B) `node-redis`
- **C) `ioredis`**
- D) `redis-client`

? Redis is an in-memory data store used for caching, session storage, and message brokering. Node.js applications connect to Redis through client libraries that handle connection management, command serialization, and reconnection logic. Different client libraries offer varying levels of feature support (clustering, pipelining, Lua scripting) and TypeScript integration.

> [`ioredis`](https://github.com/redis/ioredis) is a robust Redis client for Node.js with built-in support for Cluster, Sentinel, pipelining, and Lua scripting. It's used in `cache.service.ts` for the hot cache layer (get/set with TTL). `ioredis` was chosen over the official `redis` package (option A/B, same package) for its richer API and better TypeScript support.

**43. What PostgreSQL client library does the server use?**

- A) Prisma
- B) Knex
- **C) `pg` (node-postgres)**
- D) TypeORM

? Node.js applications can interact with PostgreSQL through several layers of abstraction: raw client libraries that send SQL directly, query builders that construct SQL programmatically, or full ORMs that map database tables to JavaScript classes. Each layer adds convenience but also adds abstraction, reducing direct control over the generated SQL.

> [`pg`](https://node-postgres.com/) (node-postgres) is a non-blocking PostgreSQL client for Node.js. The application uses `pg.Pool` for connection pooling (configured in `db/pool/pool.ts`) and parameterized queries in repository functions. Unlike ORMs (Prisma, TypeORM) or query builders (Knex), raw `pg` gives full SQL control with minimal abstraction.

**44. What validation library does the server use for request schemas?**

- A) Joi
- B) Yup
- **C) Zod**
- D) AJV

? Request validation libraries verify that incoming data matches an expected shape — correct types, required fields, value constraints — before it reaches business logic. In TypeScript applications, the best validation libraries also infer static types from the schema definition, keeping runtime validation and compile-time types in sync without duplication.

> [Zod](https://zod.dev/) is a TypeScript-first schema validation library. Schemas in `schemas/auth.ts` and `schemas/trips.ts` define the shape of request bodies (email, password, destination, dates, budget) and validate incoming data with `.parse()`. Zod's killer feature is automatic TypeScript type inference — `z.infer<typeof schema>` produces the type from the schema, keeping validation and types in sync.

**45. What database provider hosts the PostgreSQL instance?**

- A) Supabase
- B) PlanetScale
- **C) Neon**
- D) CockroachDB

? Cloud database providers offer managed PostgreSQL instances with features beyond what self-hosting provides: automatic backups, connection pooling, branching (creating isolated copies for development), and serverless scaling. Different providers specialize in different features and pricing models, from generous free tiers to enterprise-grade offerings.

> [Neon](https://neon.tech/) is a serverless PostgreSQL provider that offers autoscaling, branching (create database copies for dev/preview), and a generous free tier. The application connects to Neon via a standard `DATABASE_URL` connection string. Neon also supports `pgvector` for vector similarity search, which is used in earlier apps in this portfolio (apps 4-8).

---

### Testing & Dev Tools

**46. What test framework does the server use?**

- A) Jest
- B) Mocha
- **C) Vitest**
- D) Tap

? Test frameworks provide the infrastructure for writing and running automated tests: test organization (`describe`/`it` blocks), assertions (`expect`), mocking (`vi.fn()`), and reporting. Modern JavaScript test frameworks also need to handle TypeScript, ESM modules, and fast iteration during development.

> [Vitest](https://vitest.dev/) is a Vite-native test runner that's Jest-compatible but significantly faster due to Vite's on-demand transformation and native ESM support. It's configured in `server/vitest.config.ts` and provides `describe`, `it`, `expect`, `vi.fn()`, and `vi.mock()` APIs. Tests live alongside source files or in `__tests__` directories.

**47. What tool does the project use for git hooks (pre-commit, pre-push)?**

- A) Husky
- **B) Lefthook**
- C) lint-staged
- D) simple-git-hooks

? Git hooks are scripts that run automatically at specific points in the git workflow — before committing, before pushing, etc. Hook managers make it easy to define, share, and version-control these scripts across a team. They ensure code quality checks (linting, formatting, tests) run consistently before changes enter version control.

> [Lefthook](https://github.com/evilmartians/lefthook) is a fast, polyglot git hooks manager written in Go. It runs pre-commit hooks (lint, format) and pre-push hooks (tests) as defined in `lefthook.yml`. Lefthook was chosen over Husky for its parallel task execution, simpler configuration, and no dependency on Node.js (it's a standalone binary).

**48. What e2e testing framework is configured for the frontend?**

- A) Cypress
- **B) Playwright**
- C) Puppeteer
- D) TestCafe

? End-to-end (e2e) testing frameworks automate real browser interactions to verify that an application works correctly from the user's perspective. They simulate clicks, form submissions, navigation, and network requests across the full stack — frontend, API, and database — catching integration bugs that unit tests miss.

> [Playwright](https://playwright.dev/) is a browser automation framework from Microsoft that supports Chromium, Firefox, and WebKit. It's configured for end-to-end testing of the Next.js frontend — tests simulate user flows like registration, trip creation, and chat interaction across real browsers. Playwright's auto-waiting, network interception, and multi-browser support make it the modern standard for e2e testing.

---

### Design Patterns & Concepts

**49. Why does the application use synchronous tool execution in the agent loop instead of BullMQ async processing?**

- A) BullMQ does not support tool-use patterns
- B) Synchronous execution is faster than queue-based processing
- **C) The agent needs immediate results from each tool to reason about the next step**
- D) Redis is already used for caching, so BullMQ would cause conflicts

? In backend architectures, work can be processed synchronously (inline, blocking until complete) or asynchronously (enqueued to a background worker). Queue-based async processing with systems like BullMQ is ideal for fire-and-forget tasks, but some workflows require the result of one step before deciding what to do next — creating a sequential dependency chain.

> The agentic loop is fundamentally sequential: Claude calls `search_flights`, examines the results, decides to call `calculate_remaining_budget` based on flight prices, then uses the remaining budget to constrain `search_hotels`. Each tool result informs the next decision. BullMQ async processing (used in App 3 for fire-and-forget pipelines) would break this chain because the agent can't reason about results it hasn't received yet.

**50. What type of content block does the `tool_call_log` table help provide?**

- A) Billing and cost allocation
- B) User behavior analytics
- **C) Production observability (latency, cache hits, errors per tool)**
- D) Automated regression testing

? Observability is the ability to understand what a system is doing in production by examining its outputs — logs, metrics, and traces. For applications that call external APIs, tracking each invocation's latency, success/failure status, and cache behavior provides the data needed to diagnose performance issues, optimize costs, and detect degraded API responses.

> The `tool_call_log` table records every tool invocation with: `tool_name`, `tool_input_json`, `tool_result_json`, `latency_ms`, `cache_hit` (boolean), and `error` (nullable). This provides production-grade observability — you can query patterns like "average flight search latency", "cache hit rate by provider", or "most common tool errors". It's the kind of instrumentation that demonstrates production thinking in a portfolio project.

---

### Agentic Patterns & AI Concepts

**51. What distinguishes an "agentic" AI loop from a simple chatbot?**

- A) The model is fine-tuned on domain-specific data
- **B) The model autonomously decides which tools to call and in what order**
- C) The model uses a larger context window
- D) The model generates responses faster

? AI systems range from simple question-answer chatbots (user asks, model responds with text) to complex agentic systems that can take actions in the world. The distinction lies in autonomy — whether the model merely generates text or can independently plan, execute multi-step workflows, and adapt its strategy based on intermediate results.

> A simple chatbot receives input and produces text output. An agentic loop gives the model access to tools and lets it autonomously decide which tools to call, examine the results, and chain further actions — all without human intervention between steps. The user says "plan my trip" and the agent independently searches flights, checks budget, searches hotels, and assembles an itinerary across 3-8 tool calls.

**52. In the agentic loop, what role does the system prompt play?**

- A) It defines the tool schemas
- B) It stores conversation history
- **C) It sets the agent's persona, guidelines, and behavioral constraints**
- D) It configures the API rate limits

? The system prompt is a special message sent to an LLM at the beginning of each conversation turn. Unlike user messages, it provides persistent instructions that shape the model's behavior throughout the entire interaction. In agentic applications, the system prompt is particularly important because it guides how the model uses its available tools and makes autonomous decisions.

> The system prompt in `prompts/system-prompt.ts` establishes the agent's identity (travel planning assistant), behavioral guidelines (always search flights first, use IATA codes, check budget after selections), and constraints (never fabricate prices, always present options from real search results). It shapes how Claude uses the tools, not which tools are available — that's done via the `tools` parameter.

**53. What is "tool poisoning" and how does the safety limit help prevent it?**

- A) When a tool returns malicious data that corrupts the database
- **B) When the model enters an infinite loop of tool calls without converging on a response**
- C) When external APIs inject ads into search results
- D) When cached tool results become stale and mislead the model

? In agentic AI systems, the model has autonomy to call tools repeatedly. This creates a failure mode where the model might get stuck — calling tools over and over without making meaningful progress toward answering the user. These runaway loops waste API quota, increase latency, and can cause requests to time out.

> Tool poisoning (or tool-call looping) occurs when the model keeps calling tools without making progress toward a final answer — for example, repeatedly searching for flights with slightly different parameters. The 15-call safety limit in `agent.service.ts` prevents this by forcibly terminating the loop after 15 tool invocations, ensuring the request completes within a reasonable time.

**54. Why does the agent receive the current trip state (selected items) in its system prompt?**

- A) To reduce the number of tokens in the conversation history
- B) To bypass the need for database queries during the loop
- **C) So it can make informed decisions about what to search next and track budget context**
- D) To allow the agent to modify database records directly

? In an agentic application where users build something incrementally (like a travel itinerary), the agent needs awareness of what has already been chosen. This state context — what flights, hotels, or activities the user has selected — informs the agent's planning decisions and prevents it from making redundant searches or exceeding budgets.

> The `trip-context.ts` module formats the current trip state — selected flights, hotels, experiences, and remaining budget — into the system prompt. This gives the agent full context on what's already been chosen, so it can make intelligent follow-up decisions like "the user already has $1,200 flights; search for hotels under $800" without re-searching everything.

**55. What is the difference between `tool_use` and `tool_result` content blocks?**

- **A) `tool_use` is Claude requesting a tool call; `tool_result` is the application returning the result**
- B) `tool_use` is for read-only tools; `tool_result` is for write tools
- C) `tool_use` contains the tool schema; `tool_result` contains the execution log
- D) They are interchangeable names for the same block type

? The Anthropic Messages API uses a structured content block system for tool interactions. Each tool interaction involves two distinct block types that form a request-response pair — one representing the model's intent to call a tool, and the other representing the application's execution result sent back to the model. Understanding this pairing is essential for implementing an agent loop.

> In the [Anthropic Messages API](https://docs.anthropic.com/en/docs/build-with-claude/tool-use), `tool_use` blocks appear in assistant messages — they contain the tool `name`, `id`, and `input` parameters that Claude wants to invoke. `tool_result` blocks appear in user messages sent back to Claude — they contain the `tool_use_id` and the execution `content` (the result data). This request-response pattern drives the agentic loop.

**56. How many tool calls does a typical agent turn make for a complete trip plan?**

- A) 1-2
- **B) 3-8**
- C) 10-15
- D) 20+

? In an agentic system, each conversation turn can involve multiple tool calls as the model works through a multi-step plan. The number of tool calls per turn depends on the complexity of the user's request and how many pieces of information the model needs to gather and cross-reference before assembling a final response.

> A typical trip planning turn involves 3-8 tool calls: `get_destination_info` (resolve IATA code) → `search_flights` → `calculate_remaining_budget` → `search_hotels` → `calculate_remaining_budget` → `search_experiences`. The exact count depends on the complexity of the request — a simple "flights to Paris" might use 2-3, while "plan a full week in Barcelona with food tours" might use 6-8.

---

### Node.js & TypeScript

**57. What TypeScript path alias does the server use?**

- A) `~/` → `src/`
- \*\*B) `app/` → `src/`
- C) `@/` → `src/`
- D) `#/` → `src/`

? TypeScript path aliases are shorthand mappings defined in `tsconfig.json` that let developers write clean imports (like `app/services/agent`) instead of deeply nested relative paths (like `../../../services/agent`). Different projects and frameworks adopt different alias conventions. The alias must also be resolved at runtime, which TypeScript's compiler does not handle automatically.

> The server's `tsconfig.json` maps the `app/*` path alias to `src/*`. This means imports like `import { pool } from 'app/db/pool/pool'` resolve to `src/db/pool/pool.ts`. The alias is resolved at build time by `tsc-alias`, which rewrites the paths in compiled JavaScript since Node.js doesn't natively understand TypeScript path mappings.

**58. What TypeScript path alias does the web client use?**

- A) `app/` → `src/`
- B) `~/` → `src/`
- \*\*C) `@/` → `src/`
- D) `#/` → `src/`

? Different parts of a monorepo (server vs. web client) may use different path alias conventions. The web client's alias choice often follows the conventions of its framework, which may provide built-in support for resolving the alias without additional tooling. Consistency within each package matters more than matching across packages.

> The web client's `tsconfig.json` maps `@/*` to `src/*`, following the Next.js convention. Imports like `import { api } from '@/lib/api'` resolve to `src/lib/api.ts`. Next.js handles this alias natively through its webpack/turbopack configuration, so no additional build tool is needed (unlike the server which needs `tsc-alias`).

**59. What does the `helmet` middleware do?**

- A) Compresses response bodies with gzip
- **B) Sets security-related HTTP headers (CSP, HSTS, X-Frame-Options, etc.)**
- C) Validates request authentication tokens
- D) Rate-limits requests by IP address

? HTTP response headers can instruct browsers to enable security features that protect against common web vulnerabilities — preventing scripts from loading from unauthorized sources, forcing HTTPS connections, blocking clickjacking via iframes, and more. Setting these headers manually is error-prone, so middleware libraries automate the process.

> [`helmet`](https://helmetjs.github.io/) is an Express middleware that sets various HTTP security headers to protect against common web vulnerabilities. It enables Content-Security-Policy (mitigates XSS), Strict-Transport-Security (forces HTTPS), X-Frame-Options (prevents clickjacking), X-Content-Type-Options (prevents MIME sniffing), and several others. It's a one-line `app.use(helmet())` that provides defense-in-depth.

**60. What does `tsc-alias` do in the server build process?**

- A) Generates type declaration files
- B) Minifies TypeScript output
- **C) Rewrites TypeScript path aliases to relative paths in compiled JavaScript**
- D) Validates import statements against the module graph

? TypeScript's compiler (`tsc`) understands path aliases for type checking — it knows that `app/services/agent` refers to `src/services/agent` — but when it emits JavaScript, it leaves the alias imports unchanged. Since Node.js doesn't understand these aliases, a post-compilation step is needed to convert them into paths that the runtime can resolve.

> [`tsc-alias`](https://www.npmjs.com/package/tsc-alias) is a post-compilation tool that replaces path alias imports (like `app/services/agent`) with relative paths (like `./services/agent`) in the emitted JavaScript files. TypeScript's compiler (`tsc`) understands path aliases for type checking but doesn't rewrite them in output — Node.js would fail at runtime without `tsc-alias` converting them.

**61. What is the purpose of the `pg.Pool` connection pool?**

- A) It encrypts database connections with TLS
- B) It migrates the database schema on startup
- **C) It maintains a pool of reusable database connections to avoid the overhead of creating new ones per query**
- D) It shards queries across multiple database replicas

? Database connections are expensive to establish — each new connection involves a TCP handshake, TLS negotiation, and authentication with the database server. A connection pool maintains a set of open connections that can be reused across queries, amortizing the connection overhead across many operations and dramatically reducing per-query latency.

> [`pg.Pool`](https://node-postgres.com/apis/pool) maintains a set of persistent connections to PostgreSQL. Instead of opening and closing a TCP connection for every query (which involves a TCP handshake, TLS negotiation, and PostgreSQL authentication), the pool reuses existing connections. This dramatically reduces query latency — a pooled query might take 1-2ms vs. 50-100ms for a fresh connection. The pool is configured in `db/pool/pool.ts`.

**62. What does the `credentials: 'include'` option do in frontend fetch calls?**

- A) Adds an API key to the request headers
- B) Encrypts the request body
- **C) Sends cookies (including the session `sid` cookie) with cross-origin requests**
- D) Adds Basic Auth credentials to the Authorization header

? By default, the browser's `fetch` API does not send cookies when making requests to a different origin (different domain, port, or protocol). In applications where the frontend and API are hosted on separate domains, the developer must explicitly configure fetch to include cookies so that session-based authentication works across the origin boundary.

> By default, `fetch` does not send cookies on cross-origin requests (the frontend on Vercel and the API on Railway are different origins). Setting `credentials: 'include'` instructs the browser to include cookies — specifically the HTTP-only `sid` session cookie — with every request. This is configured in `lib/api.ts` and is essential for the session-based auth to work across origins.

---

### Database & SQL

**63. What PostgreSQL data type is used for the `status` column on the `trips` table?**

- A) VARCHAR with a CHECK constraint
- **B) A custom ENUM type (planning, saved, archived)**
- C) INTEGER with a lookup table
- D) TEXT with application-level validation

? Databases offer several ways to restrict a column to a fixed set of valid values. Options include string columns with application-level checks, CHECK constraints that validate at the database level, integer codes mapped to a lookup table, and custom ENUM types that define a named set of allowed values as a reusable data type.

> The migration creates a PostgreSQL ENUM type with three values: `'planning'`, `'saved'`, and `'archived'`. ENUMs enforce valid values at the database level — any INSERT or UPDATE with an invalid status will be rejected by PostgreSQL before application code even sees it. This is stronger than a CHECK constraint on a VARCHAR because the type is reusable and self-documenting.

**64. Why does the `conversations` table have a UNIQUE constraint on `trip_id`?**

- A) To improve query performance with an index
- B) To allow NULL values in the column
- **C) To enforce the 1:1 relationship — each trip can have at most one conversation**
- D) To enable foreign key cascading on delete

? In relational databases, a UNIQUE constraint prevents duplicate values in a column. When applied to a foreign key column, it changes the relationship cardinality — without it, multiple rows can reference the same parent (one-to-many); with it, only one row can reference each parent (one-to-one). This is a schema-level enforcement of a business rule.

> The UNIQUE constraint ensures that no two conversation rows can reference the same trip. Combined with the NOT NULL constraint, this enforces a strict 1:1 cardinality: every trip has exactly one conversation thread. Without the UNIQUE constraint, the schema would allow a 1:many relationship (one trip, many conversations), which would complicate context loading.

**65. What cascade behavior is configured on the `trip_flights` foreign key to `trips`?**

- A) SET NULL — set trip_id to NULL when the trip is deleted
- B) RESTRICT — prevent trip deletion while flights exist
- **C) CASCADE — automatically delete associated flights when a trip is deleted**
- D) NO ACTION — raise an error on delete

? Foreign key constraints in relational databases define what happens to child rows when the parent row is deleted. The ON DELETE clause specifies this behavior: the database can block the deletion, set the foreign key to NULL, or automatically delete the child rows. The choice depends on whether orphaned child rows are acceptable in the application's data model.

> The `trip_flights`, `trip_hotels`, and `trip_experiences` tables all have `ON DELETE CASCADE` on their `trip_id` foreign key. This means deleting a trip automatically deletes all associated flights, hotels, and experiences in a single atomic operation. Without cascading, you'd need to manually delete child rows first or the delete would fail with a foreign key violation.

**66. What composite index exists on the `trip_flights` table?**

- A) `(origin, destination)`
- \*\*B) `(trip_id, selected)`
- C) `(airline, flight_number)`
- D) `(departure_time, arrival_time)`

? A composite index is a database index built on multiple columns together. It speeds up queries that filter or sort by those columns in the order they appear in the index. The choice of which columns to include in a composite index should be driven by the application's most common and performance-critical query patterns.

> The composite index on `(trip_id, selected)` optimizes the most common query pattern: "get all selected flights for a given trip." When loading a trip's itinerary, the query filters by `trip_id = $1 AND selected = true`. The composite index lets PostgreSQL satisfy this with a single index scan rather than filtering rows after an index lookup on `trip_id` alone.

**67. What does the `request_hash` column in the `api_cache` table store?**

- A) A SHA-256 hash of the full HTTP response
- **B) A normalized hash of the request parameters for deduplication**
- C) The API key used for the request
- D) A UUID generated per cache entry

? Cache deduplication relies on generating identical lookup keys for semantically identical requests. A hash of the request parameters provides a fixed-length identifier that can be indexed efficiently. The normalization step before hashing ensures that superficial differences (parameter ordering, casing) don't produce different hashes for equivalent requests.

> The `request_hash` column stores a hash of the normalized request parameters (sorted keys, lowercased values, stripped whitespace). This allows the cache to detect semantically identical requests even if the parameters were originally in a different order. The composite index on `(provider, request_hash)` enables fast lookups scoped to a specific API provider.

**68. What column type stores raw API response data in the flight, hotel, and experience tables?**

- A) TEXT
- B) BYTEA
- **C) JSONB**
- D) XML

? When storing semi-structured data from external APIs, databases offer several column types. TEXT stores raw strings without structure awareness. BYTEA stores binary data. JSONB stores JSON in an optimized binary format that supports indexing, querying into nested fields, and efficient storage. The choice affects what operations are possible at the database level.

> Each of the `trip_flights`, `trip_hotels`, and `trip_experiences` tables has a `data_json` column of type JSONB that stores the complete raw API response for that item. This preserves all original data from SerpApi or Google Places (layover details, amenity lists, photo references) even though only a subset is extracted into typed columns. It enables future features without re-fetching.

---

### Caching & Performance

**69. What are the two tiers of the application's caching strategy?**

- A) Browser cache and CDN cache
- **B) Redis (hot cache) and PostgreSQL `api_cache` table (cold cache)**
- C) In-memory Map and filesystem cache
- D) Cloudflare Workers KV and R2 storage

? Multi-tier caching uses multiple storage layers with different speed and durability characteristics. A hot cache (in-memory) provides the fastest reads but loses data on restart. A cold cache (persistent storage) is slower but survives restarts. Requests check the hot cache first, fall back to the cold cache, and only hit the external API as a last resort.

> The application uses a two-tier caching strategy: Redis serves as the hot cache for fast in-memory lookups (sub-millisecond reads), while the PostgreSQL `api_cache` table provides durable persistence. If a Redis key expires or Redis restarts, the cold cache in PostgreSQL can still serve the data. Both tiers use a 1-hour TTL and share the same normalized cache key format.

**70. Why is caching particularly critical for this application compared to a typical web app?**

- A) The frontend is server-rendered and needs fast data
- B) The database is on a free tier with connection limits
- **C) External API quotas are severely limited (250 SerpApi searches/month) and a single agent turn uses multiple API calls**
- D) The Redis instance has limited memory

? Applications that depend on external APIs with strict usage quotas face a unique constraint: every API call counts against a finite monthly allowance. In agentic applications, this is amplified because a single user interaction can trigger multiple API calls as the agent searches, evaluates, and refines its plan. Caching becomes a quota preservation strategy, not just a performance optimization.

> With SerpApi's free tier of 250 searches/month, every API call is precious. A single agent turn might call `search_flights`, `search_hotels`, and `search_experiences` — that's 3 searches per turn. Without caching, 84 trip planning sessions would exhaust the monthly quota. Caching ensures that repeated searches for the same route/dates/city hit the cache instead of the API.

**71. What happens when a cache lookup finds data in PostgreSQL but not in Redis?**

- A) The data is discarded and a fresh API call is made
- B) An error is logged and the request fails
- **C) The data is returned and can be re-populated into Redis for future fast lookups**
- D) The PostgreSQL entry is deleted as stale

? In a two-tier cache architecture, a "cold cache hit" occurs when the fast (hot) layer misses but the slower (cold) layer has the data. The application must decide what to do: serve the cold data directly, re-populate the hot cache for future requests, or treat the miss as stale and re-fetch. This decision affects both performance and data freshness.

> When Redis misses but PostgreSQL hits, the cold cache data is still valid (assuming it hasn't expired). The data is returned to the caller, and the application can optionally re-populate Redis so subsequent lookups are fast again. This pattern is called "cache-aside" or "read-through" — the cold cache acts as a fallback when the hot cache is empty.

**72. How does the `api_cache` table know which external service a cached response came from?**

- A) The table name includes the provider
- B) A separate lookup table maps cache keys to providers
- **C) A `provider` ENUM column with values like `'amadeus'` and `'google_places'`**
- D) The provider is encoded in the cache key prefix

? When a single cache table stores responses from multiple external APIs, it needs a way to distinguish between them. This is important because different providers might produce identical request parameters (e.g., both a flight and hotel search for "Paris") that would collide without provider scoping. The provider identifier also enables per-provider analytics and cache management.

> The `api_cache` table has a `provider` column using a PostgreSQL ENUM type with values for each external API. The composite index on `(provider, request_hash)` allows scoped lookups — "find the cached Google Places response for this request hash" — without collisions between providers that might produce identical request hashes for different queries.

---

### Security Deep Dives

**73. Why does the application use HTTP-only cookies instead of storing tokens in localStorage?**

- A) Cookies are larger and can store more data
- B) localStorage is not supported in all browsers
- **C) HTTP-only cookies are inaccessible to JavaScript, protecting against XSS token theft**
- D) Cookies are automatically encrypted by the browser

? Web applications have several options for storing authentication tokens in the browser: localStorage, sessionStorage, regular cookies, and HTTP-only cookies. Each storage mechanism has different accessibility properties — some can be read by JavaScript running on the page, others cannot. This distinction is critical when considering what happens if an attacker manages to inject malicious JavaScript (XSS).

> An XSS (Cross-Site Scripting) attack executes malicious JavaScript in the user's browser. If session tokens were in localStorage, the attacker's script could read them with `localStorage.getItem('token')` and exfiltrate them. HTTP-only cookies are invisible to JavaScript entirely — `document.cookie` won't show them. The browser sends them automatically on requests, but no script can read or steal them.

**74. What is the `sameSite` cookie attribute set to in production?**

- A) `strict`
- B) `lax`
- **C) `none`**
- D) It's not set

? The `sameSite` cookie attribute controls when the browser sends cookies in cross-site requests. `strict` only sends cookies for same-site requests, `lax` sends them for top-level navigations, and `none` sends them on all requests (including cross-origin API calls). The correct setting depends on whether the frontend and API share the same domain or are hosted separately.

> In production, `sameSite` is set to `'none'` because the frontend (Vercel) and API (Railway) are on different domains — this is a cross-origin setup. `sameSite: 'none'` allows cookies to be sent on cross-origin requests, which is required for the session cookie to work. This must be paired with `secure: true` (HTTPS only) for browsers to accept it. In development, `sameSite: 'lax'` is used.

**75. What does the `loadSession` middleware do differently from `requireAuth`?**

- **A) `loadSession` populates `req.user` if a valid session exists but doesn't block; `requireAuth` returns 401 if `req.user` is absent**
- B) `loadSession` validates JWTs; `requireAuth` validates session cookies
- C) `loadSession` runs on all routes; `requireAuth` only runs on POST routes
- D) They are the same middleware with different names

? Authentication middleware in Express typically comes in two flavors: permissive middleware that attempts to identify the user but allows the request to continue regardless, and restrictive middleware that blocks unauthenticated requests. Separating these concerns allows some routes (like a landing page) to optionally personalize content for logged-in users while other routes (like trip management) strictly require authentication.

> `loadSession` is a permissive middleware that runs on every request. It reads the `sid` cookie, looks up the session, and sets `req.user` if valid — but if the cookie is missing or the session is expired, it simply moves on without blocking. `requireAuth` is a stricter middleware applied only to protected routes — it checks if `req.user` was populated and returns a 401 Unauthorized if not.

**76. How does the application protect against SQL injection?**

- A) Input strings are escaped with a custom sanitizer
- B) An ORM generates all queries automatically
- **C) All queries use parameterized placeholders (`$1`, `$2`, etc.) via the `pg` library**
- D) A WAF (Web Application Firewall) filters malicious queries

? SQL injection occurs when user input is concatenated directly into a SQL query string, allowing an attacker to modify the query's logic — accessing unauthorized data, deleting tables, or bypassing authentication. Protection requires ensuring that user input is never interpreted as SQL code, regardless of what characters it contains.

> Every database query in the repository layer uses parameterized queries: `pool.query('SELECT * FROM users WHERE email = $1', [email])`. The `pg` library sends the query template and parameters separately to PostgreSQL, which treats parameters as data, never as SQL code. This makes SQL injection impossible regardless of what the user inputs — even `'; DROP TABLE users;--` would be treated as a literal string value.

---

### API Design & HTTP

**77. What HTTP method does the chat endpoint use?**

- A) GET
- B) PUT
- **C) POST**
- D) PATCH

? HTTP methods (GET, POST, PUT, PATCH, DELETE) carry semantic meaning about the type of operation being performed. GET retrieves data, POST creates new resources or triggers actions, PUT replaces a resource, and PATCH partially updates one. The choice of method affects caching behavior, browser handling, and whether a request body is expected.

> The chat endpoint uses `POST /trips/:id/chat` because it creates a new interaction — sending a user message and receiving an agent response. Although the response is streamed via SSE (which is typically associated with GET requests and `EventSource`), POST is correct here because the client needs to send a request body containing the user's message. The `useChat` hook uses `fetch` with a POST body rather than `EventSource`.

**78. What Content-Type header does the chat endpoint set for its SSE response?**

- A) `application/json`
- B) `text/plain`
- **C) `text/event-stream`**
- D) `application/octet-stream`

? The `Content-Type` HTTP header tells the client how to interpret the response body. For streaming responses, the content type signals whether the client should parse JSON, render plain text, or process a stream of discrete events. The browser and client libraries use this header to determine the appropriate parsing strategy.

> The `text/event-stream` MIME type tells the browser that the response is a [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) stream. The response body contains newline-delimited events in the format `data: {...}\n\n`. The browser's `EventSource` API or a `fetch` with `getReader()` can parse these events as they arrive, enabling real-time progress updates.

**79. What HTTP status code does `requireAuth` return for unauthenticated requests?**

- **A) 401 Unauthorized**
- B) 403 Forbidden
- C) 404 Not Found
- D) 302 Redirect to login

? HTTP status codes communicate the result of a request to the client. In authentication and authorization, two status codes are commonly confused: one indicates that the client has not provided valid credentials (and should authenticate), while the other indicates that the client is authenticated but lacks permission for the requested resource. The distinction affects how the client handles the response.

> `requireAuth` returns 401 Unauthorized when `req.user` is not set. 401 means "you haven't provided valid credentials" — the client should authenticate and retry. 403 Forbidden (option B) would mean "you're authenticated but not allowed" — a different semantic. The frontend's `AuthGuard` component handles the redirect to `/login` client-side when it detects the user is not logged in.

**80. What does the global rate limit allow per IP address?**

- A) 50 requests per 15 minutes
- **B) 100 requests per 15 minutes**
- C) 200 requests per 15 minutes
- D) 1,000 requests per hour

? A global rate limit applies a blanket restriction on how many requests any single client (typically identified by IP address) can make across all endpoints within a time window. This provides baseline protection against abuse, accidental flooding, and denial-of-service attempts. It is separate from endpoint-specific rate limits that may impose stricter rules on sensitive routes.

> The `rateLimiter` middleware applies a global limit of 100 requests per 15-minute window per IP address. This protects against abuse and accidental flooding (e.g., a frontend bug sending requests in a tight loop). Auth endpoints have a stricter 10 req/15 min limit. The rate limiter uses an in-memory store — in a multi-instance deployment, you'd swap this for a Redis-backed store.

---

### React Patterns & Hooks

**81. What React hook manages the SSE connection lifecycle in the chat interface?**

- A) `useState`
- B) `useRef`
- **C) `useChat` (custom hook)**
- D) `useContext`

? React custom hooks are functions that encapsulate reusable stateful logic by composing built-in hooks (useState, useEffect, useRef, etc.). They follow the naming convention `use*` and allow components to share complex behavior — like managing a streaming connection — without duplicating code or tightly coupling the logic to a specific component.

> The custom `useChat` hook in `hooks/useChat.ts` encapsulates the entire SSE lifecycle: opening the `fetch` connection, reading the response stream, parsing events, managing message state, and cleaning up on unmount. Custom hooks are the React pattern for extracting reusable stateful logic — `useChat` combines `useState`, `useRef`, `useCallback`, and `useEffect` internally.

**82. What does TanStack React Query's `useMutation` hook return that helps with optimistic UI?**

- A) A cached response from a previous query
- **B) Status flags (`isPending`, `isError`, `isSuccess`) and callbacks (`onSuccess`, `onError`, `onSettled`)**
- C) A WebSocket connection to the server
- D) A ref to the DOM element being updated

? Mutations in server state management represent operations that change data on the server (create, update, delete). Unlike queries (which read data), mutations need to handle loading states, success/error outcomes, and cache invalidation — ensuring the UI stays in sync with the server after the operation completes.

> [`useMutation`](https://tanstack.com/query/latest/docs/framework/react/guides/mutations) returns an object with the mutation function and status flags (`isPending`, `isError`, `isSuccess`, `data`, `error`). The `onSuccess` callback is used to invalidate related queries (e.g., invalidate the trips list after creating a new trip), and `isPending` can disable buttons or show loading states during the mutation.

**83. What React context does the application use for authentication state?**

- A) `SessionContext`
- **B) `AuthContext`**
- C) `UserContext`
- D) `AppContext`

? React Context is a mechanism for passing data through the component tree without prop drilling. Authentication state (the current user, login/logout functions) is a common use case because it's needed by many components at different levels — navigation bars, route guards, profile displays, and API call configurations all need to know who is logged in.

> `AuthContext` in `context/AuthContext.tsx` provides the current user object and `login`/`logout` functions to all components via React's Context API. The `AuthGuard` component consumes this context to check if the user is authenticated, and the `Header` component uses it to show the user's email and a logout button.

**84. Why does the application use `useCallback` for the modal close handler?**

- A) To prevent the modal from closing accidentally
- B) To add a debounce delay to the close action
- **C) To maintain a stable function reference and avoid unnecessary re-renders of the `ExplanationModal` component**
- D) To cache the close handler across page navigations

? In React, every render creates new function instances. When a function is passed as a prop to a child component, the new reference causes the child to re-render even if the function's behavior hasn't changed. `useCallback` is a React hook that memoizes a function, returning the same reference across renders unless its dependencies change.

> `useCallback` memoizes the `closeModal` function so it maintains the same reference across re-renders. Without it, a new function would be created on every render, causing `ExplanationModal` to re-render unnecessarily (since its `onClose` prop would be a "new" function each time). This is a standard React performance optimization for callbacks passed to child components.

---

### DevOps & Deployment

**85. What platform hosts the Next.js frontend?**

- **A) Vercel**
- B) Railway
- C) Netlify
- D) Cloudflare Pages

? Frontend hosting platforms deploy and serve web applications with features like CDN distribution, automatic HTTPS, preview deployments for pull requests, and serverless function support. Different platforms offer varying levels of integration with specific frameworks — some are built by the same team as the framework and provide first-class support for its features.

> [Vercel](https://vercel.com/) hosts the Next.js frontend. Vercel is the company behind Next.js and provides first-class support for its features: automatic ISR, edge functions, image optimization, and preview deployments on pull requests. The Vercel MCP server is available during development for managing deployments and environment variables.

**86. How are environment variables managed across the server and web client?**

- A) A shared `.env` file at the monorepo root
- B) Hardcoded in configuration files
- **C) Separate environment variables per service, configured in each deployment platform (Railway, Vercel)**
- D) A centralized secrets manager like HashiCorp Vault

? Environment variables store configuration that varies between environments (development, staging, production) — database URLs, API keys, feature flags, and service endpoints. In a multi-service architecture where the backend and frontend are deployed to different platforms, each service needs its own set of environment variables managed independently.

> Each service has its own environment variables: the Express server's variables (DATABASE_URL, REDIS_URL, ANTHROPIC_API_KEY, SERPAPI_KEY, etc.) are set in Railway, while the Next.js frontend's variables (NEXT_PUBLIC_API_URL) are set in Vercel. This separation follows the twelve-factor app methodology — configuration is stored in the environment, not in code.

**87. What file defines the pnpm workspace structure?**

- A) `package.json` workspaces field
- B) `lerna.json`
- **C) `pnpm-workspace.yaml`**
- D) `turbo.json`

? In a monorepo, the workspace configuration file tells the package manager which directories contain individual packages. This enables features like cross-package dependency linking, shared dev dependencies at the root level, and coordinated scripts that run across all packages. Different package managers use different file formats for this configuration.

> [`pnpm-workspace.yaml`](https://pnpm.io/workspaces) defines which directories are workspace packages. For this project, it lists `server/` and `web-client/` as workspace members. This enables cross-package dependency resolution and shared scripts from the root `package.json`. Unlike npm/yarn workspaces which use the `package.json` workspaces field, pnpm uses a dedicated YAML file.

**88. What does the `lefthook.yml` pre-commit hook run?**

- A) Unit tests and integration tests
- B) Database migration checks
- **C) Linting (ESLint) and formatting (Prettier)**
- D) Docker image builds

? Pre-commit hooks run automatically before each git commit, providing a fast feedback loop for code quality. The tasks in a pre-commit hook should be fast enough to not slow down the commit workflow — typically static analysis and formatting checks that operate on the staged files, rather than slower operations like running the full test suite.

> The pre-commit hook runs ESLint for static analysis (catching bugs, enforcing code style) and Prettier for consistent formatting (indentation, quotes, semicolons). These are fast checks that catch issues before they enter version control. The slower test suite runs on pre-push instead, so commits stay fast while pushes are validated more thoroughly.

---

### Data Flow & Architecture

**89. What is the complete data flow when a user sends a chat message?**

- A) Frontend → WebSocket → Agent → Database
- B) Frontend → REST API → Queue → Worker → Database
- **C) Frontend → POST /trips/:id/chat → Agent loop (Claude + tools) → SSE events → Frontend, with messages persisted to database**
- D) Frontend → GraphQL → Resolver → Agent → Frontend

? In an agentic chat application, a single user message triggers a multi-step processing pipeline: the message must be received, conversation context loaded, the AI model invoked (potentially multiple times with tool calls), real-time progress streamed back to the client, and the full interaction persisted for future context. Understanding this end-to-end flow is key to debugging and extending the system.

> The flow is: (1) ChatBox sends POST to `/trips/:id/chat` with the message, (2) the handler loads conversation history from the database, (3) `runAgentLoop` sends messages to Claude with tool definitions, (4) Claude returns tool_use blocks, (5) tools are executed and SSE events stream to the frontend, (6) results are sent back to Claude for the next iteration, (7) when Claude returns `end_turn`, the final response streams as an SSE event, and (8) all messages and tool calls are persisted to the database.

**90. Where does the tool executor dispatch tool calls?**

- A) To a message queue for async processing
- **B) To individual tool functions (`flights.tool.ts`, `hotels.tool.ts`, etc.) based on the tool name**
- C) To a third-party function-as-a-service platform
- D) Back to Claude for self-execution

? In an agentic system, a tool executor (or dispatcher) receives tool call requests from the AI model and routes them to the appropriate handler function. This dispatch pattern maps tool names to implementation functions, similar to how a web framework routes URL paths to controller functions. Each tool handler encapsulates its own API calls, data transformation, and error handling.

> The `executor.ts` file contains an `executeTool` function that acts as a dispatcher. It receives the tool name and input from Claude's `tool_use` block and routes to the appropriate function: `'search_flights'` → `searchFlights()`, `'search_hotels'` → `searchHotels()`, etc. Each tool function handles its own API calls, response normalization, and error handling.

**91. How does the application handle tool execution errors?**

- A) The entire request fails with a 500 error
- B) The error is silently swallowed and the loop continues
- **C) The error message is returned to Claude as a tool result with `isError: true`, and Claude adapts its strategy**
- D) The agent retries the tool call up to 3 times

? When tools in an agentic loop fail (API timeouts, invalid responses, rate limits), the system must decide how to handle the failure. Options include crashing the entire request, silently ignoring the error, retrying automatically, or informing the AI model about the failure so it can adapt its strategy. The choice significantly affects both user experience and system robustness.

> When a tool call throws an error (API timeout, invalid response, etc.), the error is caught and returned to Claude as a `tool_result` content block with `is_error: true` and the error message as content. Claude sees this and can adapt — for example, if a flight search fails for a specific airport, it might try a nearby airport. The error is also logged in `tool_call_log` with the `error` column populated.

**92. What data does each SSE `tool_start` event contain?**

- A) Only the tool name
- B) The tool name and expected response time
- **C) The tool name, tool ID, and input parameters**
- D) The tool name and cached result preview

? SSE events in an agentic chat interface serve as real-time progress indicators. When the agent begins executing a tool, the event sent to the frontend must contain enough information for the UI to display a meaningful progress indicator — what tool is running, what it's searching for, and an identifier to correlate with the eventual result event.

> Each `tool_start` SSE event includes `{ type: "tool_start", tool_name, tool_id, input }`. The `tool_name` tells the frontend which icon and label to show ("Searching flights..."), the `tool_id` lets it match with the corresponding `tool_result` event, and the `input` parameters provide details to display ("SFO → BCN, March 15-22"). This gives users granular visibility into what the agent is doing.

---

### Monorepo & Project Structure

**93. What are the two workspace packages in the monorepo?**

- A) `packages/api` and `packages/web`
- B) `backend/` and `frontend/`
- **C) `server/` and `web-client/`**
- D) `api/` and `app/`

? A monorepo organizes multiple related packages (applications, libraries, shared code) within a single repository. The workspace packages are the individual directories that contain their own `package.json` files and can have independent dependencies, build scripts, and configurations while sharing a common root-level setup.

> The monorepo contains two workspace packages: `server/` (the Express API) and `web-client/` (the Next.js frontend). Unlike earlier apps in the portfolio that used a `packages/` directory structure, this app uses top-level directory names. Both are listed in `pnpm-workspace.yaml` and share development dependencies through the root `package.json`.

**94. Where are the database migration files located?**

- A) `server/src/db/migrations/`
- **B) `server/migrations/`**
- C) `migrations/` at the monorepo root
- D) `server/src/repositories/migrations/`

? Database migration files define incremental changes to the database schema. Their location within the project structure is a convention that varies by tool and team preference. Some projects place them inside the source code directory, others keep them at the package root or monorepo root. The migration tool's configuration specifies where to find them.

> Migration files live in `server/migrations/` — outside the `src/` directory because they're configuration/SQL files, not application source code. Each migration file is a JavaScript module with `exports.up` and `exports.down` functions that receive a `pgm` helper for creating tables, adding columns, and defining indexes. The files are timestamped for ordering (e.g., `1771879388542_create-users-table.js`).

**95. How many repository modules does the server have?**

- A) 3
- B) 4
- **C) 5**
- D) 7

? The repository pattern organizes data access code into modules, each responsible for all database queries related to a specific domain entity. This separation keeps SQL queries out of route handlers and services, centralizes data access logic, and makes it easier to test by providing clear boundaries between business logic and database operations.

> The server has 5 repository modules in `src/repositories/`: (1) `auth/` — user and session CRUD, (2) `trips/` — trip CRUD with detail loading, (3) `conversations/` — message persistence and history loading, (4) `tool-call-log/` — tool invocation logging for observability, and (5) `userPreferences/` — key-value user settings. Each repository encapsulates all SQL queries for its domain.

---

### Error Handling & Edge Cases

**96. What happens if the user sends a message while the agent is already processing?**

- A) The new message is queued and processed after the current turn
- B) The current turn is cancelled and the new message takes priority
- **C) The frontend disables the input while a request is in flight, preventing concurrent messages**
- D) Both messages are processed in parallel

? In chat interfaces backed by AI agents, concurrent message handling is a design challenge. If a user sends a second message while the first is still being processed, it could create race conditions in conversation history, duplicate tool calls, or inconsistent state. Applications must decide whether to queue, cancel, parallelize, or prevent concurrent messages.

> The `ChatBox` component disables the message input and send button while an SSE connection is active (tracked by a loading state flag). This prevents the user from sending concurrent messages that would create race conditions in the conversation history. Once the SSE stream completes and the response is received, the input is re-enabled.

**97. What happens if the SerpApi API key is missing or invalid?**

- A) The application falls back to mock data
- B) The agent uses cached results from previous sessions
- **C) The tool returns an error message, which Claude receives and reports to the user**
- D) The server crashes on startup

? External API integrations can fail for many reasons: invalid credentials, rate limits, network timeouts, or service outages. How an application handles these failures determines whether users see a cryptic error, a graceful degradation, or an informative message explaining what went wrong. In agentic systems, the AI model itself can be part of the error handling strategy.

> If the SerpApi request fails due to an invalid API key (HTTP 401), the tool's error handling catches the exception and returns a descriptive error message as the tool result. Claude sees this error in the `tool_result` block and can inform the user that flight/hotel search is currently unavailable. The error is also logged in the `tool_call_log` table for debugging.

**98. How does the application handle expired sessions?**

- A) The frontend refreshes the token automatically
- B) The user is immediately redirected to the login page by the server
- **C) The server returns 401, the frontend's AuthGuard detects the unauthenticated state and redirects to login**
- D) The session is automatically extended for another 7 days

? Session expiration creates a coordination challenge between the server (which knows the session is invalid) and the frontend (which needs to redirect to login). The server cannot directly redirect the frontend in a single-page application because API requests return JSON responses, not page redirects. Instead, the frontend must interpret the server's error response and handle the redirect itself.

> When a session expires, the `loadSession` middleware finds no valid session in the database and doesn't set `req.user`. The `requireAuth` middleware then returns 401. On the frontend, the API wrapper detects the 401 response, clears the local auth state in `AuthContext`, and `AuthGuard` redirects to the login page. There's no automatic session renewal — the user must log in again.

**99. What prevents a user from accessing another user's trips?**

- A) Trips are encrypted with the user's password
- B) A separate authorization middleware checks ownership
- **C) All trip queries include a `WHERE user_id = $1` clause scoped to the authenticated user's ID**
- D) Trips are stored in separate database schemas per user

? Authorization ensures that authenticated users can only access resources they own. In multi-user applications, a common vulnerability is Insecure Direct Object Reference (IDOR) — where a user manipulates an ID parameter to access another user's data. Protection requires that every data access operation is scoped to the authenticated user, regardless of what IDs are provided in the request.

> Every trip query in the `trips/` repository includes `WHERE user_id = $1` with the authenticated user's ID from `req.user.id`. This means a user can only ever see, modify, or delete their own trips — even if they guess another trip's UUID, the query won't return it. This is authorization-by-query, which is simpler and more reliable than a separate authorization middleware layer.

**100. What is the maximum `max_tokens` value set for Claude API calls in the agent loop?**

- A) 1024
- B) 2048
- **C) 4096**
- D) 8192

? The `max_tokens` parameter in LLM API calls limits how many tokens the model can generate in a single response. This is distinct from the context window (total input + output capacity). Setting it controls the maximum length of each individual model response — affecting both the cost per API call and how much detail the model can include in its output.

> The agent loop calls Claude with `max_tokens: 4096`, which limits the length of each individual response (not the total conversation). This is sufficient for tool call requests (which are typically short JSON blocks) and final text responses (which summarize the itinerary). Setting it higher would allow longer responses but increase cost and latency for each round-trip in the loop.
