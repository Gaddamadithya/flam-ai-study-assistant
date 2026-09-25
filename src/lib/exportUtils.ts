import { StudyDeck } from '../types/result';

/**
 * Downloads a string payload as a file in the browser.
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports cards into Anki-compatible TSV format (Tab-Separated Values).
 * Anki import format: Question \t Answer \t Tags
 */
export function exportToAnkiTSV(deck: StudyDeck): void {
  const sanitize = (text: string) => text.replace(/\t/g, ' ').replace(/\r?\n/g, '<br>');

  const tsvLines = [
    '#separator:tab',
    '#html:true',
    '#tags column:3',
    ...deck.cards.map((c) => {
      const q = sanitize(c.question);
      const a = sanitize(c.answer);
      const tag = sanitize(deck.topic.replace(/\s+/g, '-'));
      return `${q}\t${a}\t${tag}`;
    })
  ];

  const content = tsvLines.join('\n');
  const filename = `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-anki.tsv`;
  downloadFile(content, filename, 'text/tab-separated-values;charset=utf-8');
}

/**
 * Exports the entire study deck into a clean, formatted Markdown study guide.
 */
export function exportToMarkdown(deck: StudyDeck): void {
  const mdParts: string[] = [
    `# ${deck.title}`,
    `**Topic:** ${deck.topic}  `,
    `**Generated:** ${new Date(deck.createdAt).toLocaleDateString()}  `,
    '',
    `## Summary`,
    deck.summary,
    '',
    `## 🧠 Key Conceptual Checklist`,
    ...deck.keyConcepts.map((k) => `- **${k.title}** (${k.importance || 'core'}): ${k.summary}`),
    '',
    `## 🗂️ Flashcards (${deck.cards.length} Cards)`,
    ...deck.cards.map((c, i) => `### Card ${i + 1}: ${c.question}\n- **Answer:** ${c.answer}\n${c.hint ? `- *Hint:* ${c.hint}\n` : ''}- *Difficulty:* ${c.difficulty || 'medium'}\n`),
    '',
    `## 📝 Practice Quiz Review`,
    ...deck.quiz.map((q, i) => {
      const opts = q.options.map((o) => `  - [${o.id === q.correctOptionId ? 'x' : ' '}] (${o.id.toUpperCase()}) ${o.text}`).join('\n');
      return `### Q${i + 1}: ${q.question}\n${opts}\n\n> **Explanation:** ${q.explanation}\n`;
    })
  ];

  const content = mdParts.join('\n');
  const filename = `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-cheat-sheet.md`;
  downloadFile(content, filename, 'text/markdown;charset=utf-8');
}

/**
 * Exports raw validated JSON.
 */
export function exportToJSON(deck: StudyDeck): void {
  const content = JSON.stringify(deck, null, 2);
  const filename = `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
  downloadFile(content, filename, 'application/json;charset=utf-8');
}
