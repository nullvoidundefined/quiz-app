/**
 * Parses quiz markdown into an array of question objects.
 *
 * Expected format per question:
 *   **1. Question text?**
 *   - A) Option text
 *   - **B) Correct option text**
 *   - C) Option text
 *   - D) Option text
 *
 *   ? Clarification of the question itself (what the terms/concepts mean).
 *   ? Each line starts with "? ".
 *
 *   > Explanation of why the correct answer is correct.
 *   > Each line starts with "> ".
 */

function convertMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function parseQuiz(markdown) {
  const questions = [];
  const questionRegex =
    /\*\*(\d+)\.\s+(.+?)\*\*\s*\n([\s\S]*?)(?=\n\*\*\d+\.|---|\n### |$)/g;

  let match;
  while ((match = questionRegex.exec(markdown)) !== null) {
    const number = parseInt(match[1], 10);
    const text = match[2].trim();
    const body = match[3].trim();

    const options = [];
    let correctIndex = -1;

    const lines = body.split('\n');
    const explanationLines = [];
    const clarificationLines = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('?')) {
        clarificationLines.push(trimmed.replace(/^\?\s?/, ''));
      } else if (trimmed.startsWith('>')) {
        explanationLines.push(trimmed.replace(/^>\s?/, ''));
      } else if (trimmed.startsWith('-')) {
        const isBold = trimmed.includes('**');
        const cleaned = trimmed
          .replace(/^-\s*/, '')
          .replace(/\*\*/g, '')
          .trim();

        options.push(cleaned);
        if (isBold) correctIndex = options.length - 1;
      }
    }

    const explanation = convertMarkdown(explanationLines.join(' ').trim());
    const clarification = convertMarkdown(clarificationLines.join(' ').trim());

    if (options.length === 4 && correctIndex !== -1) {
      questions.push({ number, text, options, correctIndex, explanation, clarification });
    }
  }

  return questions;
}

/** Fisher-Yates shuffle (returns a new array) */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
