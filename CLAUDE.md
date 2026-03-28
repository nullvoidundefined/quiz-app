# Quiz App

A standalone quiz runner for the Fullstack AI Portfolio. Tests knowledge of each app's architecture, tools, APIs, patterns, and concepts.

## Stack

- Vite + React (plain JSX, no TypeScript)
- No external dependencies beyond React
- Static markdown files loaded at runtime from `public/quizzes/`

## Architecture

### Screens

Four screen states managed via `screen` state variable:

1. **Start** — App selector dropdown, question pool stats, "Start Quiz" and "Browse Questions" buttons
2. **Browse** — Scrollable list of all questions with "Test Me", "?" (clarification), and "Answer" (explanation) buttons per question
3. **Quiz** — Question with 4 options, progress bar, running grade. Supports full 20-question sessions or single-question mode from browse
4. **Finished** — Letter grade (A-F), score, option to retake or return to start

### Two-tier content per question

Each question has two separate supplementary content blocks:

- **Clarification** (`? ` prefix in markdown) — Explains the question's concepts and terminology. Opened via the `?` button. Must NOT hint at the correct answer. This is educational context about _what the question is asking_.
- **Explanation** (`> ` prefix in markdown) — Explains _why_ the correct answer is correct. Shown automatically on wrong answers; available via "Learn More" on correct answers.

These are intentionally separate concerns — clarification helps you understand the question before answering; explanation teaches you after answering.

### Quiz markdown format

```markdown
**1. Question text here?**

- A) Option
- **B) Correct option (bolded)**
- C) Option
- D) Option

? Clarification line (can span multiple ? lines)
? Explains concepts/terms in the question

> Explanation line (can span multiple > lines)
> Why the correct answer is correct, with links/code
```

The parser (`parseQuiz.js`) uses regex to extract questions, then iterates lines to separate options (`-`), clarification (`?`), and explanation (`>`). Inline markdown (`[links](url)` and `` `code` ``) is converted to HTML.

### Session limiting

- `QUESTIONS_PER_SESSION = 20` — each quiz draws 20 random questions from the pool
- Fisher-Yates shuffle ensures fair randomization
- If the pool has fewer than 20 questions, all are used

### Single-question mode

From the browse screen, clicking "Test Me" on any question enters the quiz with `questions = [thatQuestion]`. After answering, the user returns to browse instead of the finished screen.

## Files

| File                           | Purpose                                |
| ------------------------------ | -------------------------------------- |
| `src/App.jsx`                  | All screens, modals, state management  |
| `src/App.css`                  | All styles (dark theme, responsive)    |
| `src/parseQuiz.js`             | Markdown parser + Fisher-Yates shuffle |
| `src/main.jsx`                 | Vite entry point                       |
| `public/quizzes/app-{1..8}.md` | Quiz content per app                   |

## Decisions

- **No router** — Screen state is simple enough that React state handles it. No URL requirements.
- **No state library** — useState is sufficient for the quiz flow.
- **dangerouslySetInnerHTML for explanations** — Controlled content (our own markdown), not user input. Allows links and code formatting in explanations.
- **Apps 2-7 disabled** — These apps don't have real quiz content yet. The dropdown shows them as "(coming soon)" with `disabled` on the option element.
- **Only app-1 and app-8 are `ready: true`** — The APPS array has a `ready` flag that controls the disabled state.
- **Dark theme** — Matches the portfolio aesthetic. Colors from Tailwind's slate palette.
- **Placeholder quiz files for apps 2-7** — Each has 5 basic questions so the app doesn't break if someone manually selects them, but they're disabled in the UI.

## Conventions

- Keep all quiz content in markdown files, not in code
- When adding a new app's quiz, set `ready: true` in the APPS array and create `public/quizzes/app-{n}.md`
- Clarification content must be answer-agnostic — never hint at the correct option
- Update this file when making significant structural changes
