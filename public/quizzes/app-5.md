# App 5: Multi-Tenant AI Assistant — Quiz Questions

Each question has four options. Only one is correct (marked with **bold**).

---

**1. What does "multi-tenant context scoping" mean in this application?**
- A) Running separate server instances for each tenant
- B) Using different LLM models for different tenants
- **C) Ensuring each tenant's data and conversation context is isolated so one tenant never sees another's information**
- D) Allowing multiple users to share the same conversation thread

? Multi-tenancy is an architecture where a single application instance serves multiple distinct customers (tenants), each with their own data. "Context scoping" refers to ensuring that when the application loads data — whether for database queries, API responses, or AI model context — it only includes data belonging to the current tenant. This is a fundamental security and privacy concern in SaaS applications.

> Multi-tenant context scoping ensures strict data isolation between tenants (organizations or workspaces). Every database query includes a `tenant_id` filter, every conversation loads only that tenant's history, and Claude's context window never mixes data from different tenants. This is enforced at the query level and often also via PostgreSQL Row-Level Security (RLS) policies, providing defense-in-depth.

**2. What is conversation summarization used for in this application?**
- A) Generating titles for conversation threads
- B) Creating user-facing bullet-point recaps
- **C) Compressing older conversation history to fit within Claude's context window while preserving key information**
- D) Translating conversations into different languages

? LLMs have a finite context window — a maximum number of tokens they can process in a single request. As conversations grow longer, the full history of messages may exceed this limit. Conversation summarization is a technique for managing this constraint by reducing the token count of historical messages while retaining the essential information needed for coherent continued interaction.

> As conversations grow long, they can exceed Claude's context window limit. Conversation summarization compresses older messages into a concise summary that preserves key facts, decisions, and context. The application sends the summary plus recent messages to Claude, rather than the entire history. This keeps the effective context window manageable while maintaining conversational coherence. See [Anthropic's long context tips](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching).

**3. What authentication system does this application use?**
- A) Auth0
- B) NextAuth.js
- **C) Supabase Auth via @supabase/ssr**
- D) Firebase Authentication

? Authentication systems verify user identity — confirming that a user is who they claim to be — and manage sessions so users stay logged in across requests. Modern auth solutions provide features like social login (Google, GitHub), JWT-based tokens, multi-factor authentication, and integration with database-level security policies. The choice of auth provider affects how sessions are managed in server-rendered frameworks like Next.js.

> All apps in the portfolio use [Supabase Auth](https://supabase.com/docs/guides/auth) with the `@supabase/ssr` package for server-side authentication in Next.js. Supabase Auth provides JWT-based sessions, social login providers, and Row-Level Security integration with PostgreSQL. The `@supabase/ssr` package handles cookie-based session management for both server components and API routes.

**4. How does the application determine which tenant a user belongs to?**
- A) By checking the subdomain of the request URL
- B) By reading a tenant cookie set during login
- **C) Through the authenticated user's profile, which maps to a tenant via a database relationship**
- D) By requiring the tenant ID in every API request body

? In multi-tenant systems, every incoming request must be associated with a specific tenant so the application can scope data access correctly. There are several strategies for resolving tenant identity — from URL-based approaches (subdomains, path prefixes) to token-based approaches (embedding tenant info in JWTs) to database lookups. The method chosen affects security, flexibility, and how tenants are onboarded.

> After authentication, the user's JWT contains their user ID. The application looks up the user's tenant association in the database (typically a `users` table with a `tenant_id` column or a junction table for multi-tenant membership). This tenant ID is then used to scope all subsequent database queries and AI context loading for that request.

**5. What strategy prevents a long-running conversation from exceeding Claude's context window?**
- A) Deleting old messages after a fixed count
- B) Splitting the conversation across multiple Claude API calls
- **C) Summarizing older messages into a compressed context and prepending it to recent messages**
- D) Increasing the max_tokens parameter on each request

? Context window management is a core challenge in conversational AI applications. The context window is the total amount of text (measured in tokens) that the model can consider in a single request, including both the conversation history and the new response. When conversations run long, applications must decide what to keep, what to discard, and how to preserve important information from earlier in the conversation without exceeding token limits.

> The application implements a sliding window strategy: when conversation history exceeds a threshold, older messages are summarized by Claude into a compact representation. Subsequent requests send this summary as a system-level context block followed by only the most recent N messages. This preserves important context (user preferences, prior decisions, established facts) without sending thousands of tokens of raw history.
