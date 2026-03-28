# App 1: Job Tracker AI — Quiz Questions

Each question has four options. Only one is correct (marked with **bold**).

---

**1. What library does the Job Tracker AI use for runtime validation of structured data extracted by Claude?**

- A) Joi
- B) Yup
- **C) Zod**
- D) class-validator

? Runtime validation libraries check data at execution time (not just compile time) to ensure it conforms to a defined schema — correct types, required fields present, values within expected ranges. In AI applications, the LLM's output is unpredictable text, so runtime validation is the safety net that catches malformed, incomplete, or hallucinated data before it enters your database or business logic.

> [Zod](https://zod.dev/) is a TypeScript-first schema declaration and validation library. When Claude extracts structured job data (title, company, salary, etc.) from unstructured text, the raw output is validated against a Zod schema before being persisted. This catches hallucinated fields, wrong types, and missing required values at runtime — not just at compile time.

**2. What does "structured extraction" mean in the context of this application?**

- A) Parsing HTML with a DOM parser
- B) Converting CSV files to JSON
- **C) Using an LLM to pull typed fields from unstructured text**
- D) Running SQL queries against structured databases

? Structured extraction refers to the process of taking unstructured, freeform content (like an email, a job posting, or a paragraph of text) and producing a well-defined data object with specific typed fields. The challenge is that unstructured text has no guaranteed format — the same information can be expressed in countless ways, making traditional parsers (regex, rule-based) fragile.

> Structured extraction uses Claude to read unstructured input (like a pasted job posting or email) and return a JSON object with specific typed fields — job title, company name, salary range, location, etc. The key insight is that the LLM acts as a flexible parser that understands natural language, unlike regex or rule-based parsers that break on format variations.

**3. How does the application ensure Claude returns valid JSON rather than freeform text?**

- A) Fine-tuning the model on JSON examples
- **B) Using a system prompt that instructs JSON output, then validating with Zod**
- C) Using the `response_format` parameter set to `json_object`
- D) Post-processing with a separate JSON extraction regex

? LLMs generate free-form natural language by default, so getting them to produce machine-parseable JSON requires deliberate strategies. The question is about which technique the application uses to constrain the model's output format — whether through model configuration, prompt engineering, post-processing, or a combination of approaches.

> The application sends a system prompt instructing Claude to respond in a specific JSON structure, then parses and validates the response with Zod. If validation fails, the application can retry or return an error. This prompt-plus-validation pattern is more reliable than hoping the model always produces valid output. See the [Anthropic structured output docs](https://docs.anthropic.com/en/docs/build-with-claude/structured-output) for guidance.

**4. What happens when a Zod schema validation fails on Claude's extracted output?**

- A) The raw output is saved anyway with a warning flag
- B) The application crashes with an unhandled error
- **C) Zod throws a ZodError with detailed information about which fields failed validation**
- D) The output is silently discarded

? Schema validation can fail for many reasons — a missing required field, a value of the wrong type, a string that doesn't match an expected pattern, or a number outside an allowed range. How a validation library reports and surfaces these failures determines how the application can respond — whether it retries, logs details for debugging, or returns a useful error message to the user.

> Zod's `.parse()` method throws a `ZodError` when validation fails. This error contains an `issues` array describing exactly which fields failed and why (wrong type, missing required field, value out of range, etc.). The application catches this error and can use the details to retry the extraction, return a meaningful error to the user, or log the failure for debugging. See the [Zod error handling docs](https://zod.dev/error-handling).

**5. What database hosts the PostgreSQL instance for this application?**

- A) Supabase Database
- B) Railway Postgres
- **C) Neon**
- D) PlanetScale

? PostgreSQL hosting services provide managed database infrastructure so developers don't need to run and maintain their own database servers. These services typically handle provisioning, backups, scaling, and high availability. The choice of hosting provider affects connection patterns, pricing, available extensions, and integration with other parts of the deployment stack.

> All apps in the portfolio use [Neon](https://neon.tech/) for PostgreSQL hosting. Neon provides serverless Postgres with branching, autoscaling, and a generous free tier. The connection string is stored as an environment variable and used by the Express API server to persist validated job data.
