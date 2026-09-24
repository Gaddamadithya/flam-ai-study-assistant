import { StudyDeck, ValidationResult, Flashcard, QuizQuestion, KeyConcept } from '../types/result';

/**
 * Extracts and cleans JSON from raw AI model response.
 * Handles common LLM quirks: markdown blocks (```json ... ```),
 * extra whitespace, or leading/trailing commentary.
 */
export function extractJSONString(raw: string): string {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Empty response received from AI model.');
  }

  const trimmed = raw.trim();

  // Match ```json ... ``` or ``` ... ```
  const markdownMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (markdownMatch && markdownMatch[1]) {
    return markdownMatch[1].trim();
  }

  // If starts with { and ends with }, return as is
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

/**
 * Defensively parses and validates raw model output against the StudyDeck schema.
 * Rejects malformed JSON, missing fields, or wrong structures with actionable error messages.
 */
export function validateStudyDeck(rawInput: unknown): ValidationResult {
  if (rawInput === null || rawInput === undefined || rawInput === '') {
    return {
      success: false,
      error: 'Empty response received from AI model.',
      details: ['The AI did not produce any content. Please try again.']
    };
  }

  let parsed: unknown = rawInput;

  // If raw string, attempt JSON extraction and parsing
  if (typeof rawInput === 'string') {
    try {
      const jsonStr = extractJSONString(rawInput);
      parsed = JSON.parse(jsonStr);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: 'Malformed JSON received from AI.',
        details: [
          `JSON parsing failed: ${message}`,
          'Raw response was not valid JSON or was cut off midway.'
        ],
        raw: rawInput
      };
    }
  }

  // Structural validation
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      success: false,
      error: 'Invalid response structure: expected a JSON object.',
      details: [`Received type: ${Array.isArray(parsed) ? 'array' : typeof parsed}`],
      raw: parsed
    };
  }

  const record = parsed as Record<string, unknown>;
  const errors: string[] = [];

  // Title & Summary fallback / validation
  const title = typeof record.title === 'string' && record.title.trim().length > 0 
    ? record.title.trim() 
    : 'Study Session';

  const topic = typeof record.topic === 'string' && record.topic.trim().length > 0
    ? record.topic.trim()
    : 'General Knowledge';

  const summary = typeof record.summary === 'string' && record.summary.trim().length > 0
    ? record.summary.trim()
    : 'AI-generated study materials.';

  // Validate cards
  if (!Array.isArray(record.cards) || record.cards.length === 0) {
    errors.push('Response must contain a non-empty "cards" array with at least one flashcard.');
  }

  const validatedCards: Flashcard[] = [];
  if (Array.isArray(record.cards)) {
    record.cards.forEach((item, index) => {
      if (typeof item !== 'object' || item === null) {
        errors.push(`Flashcard #${index + 1} is not a valid object.`);
        return;
      }
      const c = item as Record<string, unknown>;
      const question = typeof c.question === 'string' ? c.question.trim() : '';
      const answer = typeof c.answer === 'string' ? c.answer.trim() : '';

      if (!question || !answer) {
        errors.push(`Flashcard #${index + 1} is missing a non-empty question or answer.`);
        return;
      }

      validatedCards.push({
        id: typeof c.id === 'string' && c.id ? c.id : `card-${index + 1}-${Date.now().toString(36)}`,
        question,
        answer,
        hint: typeof c.hint === 'string' ? c.hint.trim() : undefined,
        difficulty: c.difficulty === 'easy' || c.difficulty === 'medium' || c.difficulty === 'hard' 
          ? c.difficulty 
          : 'medium'
      });
    });
  }

  // Validate quiz
  const validatedQuiz: QuizQuestion[] = [];
  if (Array.isArray(record.quiz)) {
    record.quiz.forEach((item, index) => {
      if (typeof item !== 'object' || item === null) {
        return;
      }
      const q = item as Record<string, unknown>;
      const question = typeof q.question === 'string' ? q.question.trim() : '';
      const explanation = typeof q.explanation === 'string' ? q.explanation.trim() : 'Correct answer explanation.';
      let correctOptionId = typeof q.correctOptionId === 'string' ? q.correctOptionId.trim() : '';

      if (!question || !Array.isArray(q.options) || q.options.length < 2) {
        return; // skip or flag invalid quiz question
      }

      const options = q.options.map((opt, optIdx) => {
        if (typeof opt === 'object' && opt !== null) {
          const o = opt as Record<string, unknown>;
          return {
            id: typeof o.id === 'string' && o.id ? o.id : String.fromCharCode(97 + optIdx),
            text: typeof o.text === 'string' ? o.text.trim() : String(o)
          };
        }
        return {
          id: String.fromCharCode(97 + optIdx),
          text: String(opt || '').trim()
        };
      }).filter(opt => opt.text.length > 0);

      if (options.length >= 2) {
        // Ensure correctOptionId points to an existing option
        const validOptionIds = options.map(o => o.id);
        if (!validOptionIds.includes(correctOptionId)) {
          correctOptionId = validOptionIds[0];
        }

        validatedQuiz.push({
          id: typeof q.id === 'string' && q.id ? q.id : `quiz-${index + 1}-${Date.now().toString(36)}`,
          question,
          options,
          correctOptionId,
          explanation
        });
      }
    });
  }

  // Validate key concepts
  const validatedConcepts: KeyConcept[] = [];
  if (Array.isArray(record.keyConcepts)) {
    record.keyConcepts.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        const k = item as Record<string, unknown>;
        const conceptTitle = typeof k.title === 'string' ? k.title.trim() : '';
        const conceptSummary = typeof k.summary === 'string' ? k.summary.trim() : '';
        if (conceptTitle) {
          validatedConcepts.push({
            id: typeof k.id === 'string' && k.id ? k.id : `concept-${index + 1}`,
            title: conceptTitle,
            summary: conceptSummary,
            importance: k.importance === 'core' || k.importance === 'supporting' || k.importance === 'advanced'
              ? k.importance
              : 'core'
          });
        }
      }
    });
  }

  if (errors.length > 0 && validatedCards.length === 0) {
    return {
      success: false,
      error: 'Received response did not conform to the expected Study Assistant format.',
      details: errors,
      raw: parsed
    };
  }

  const finalDeck: StudyDeck = {
    id: typeof record.id === 'string' && record.id ? record.id : `deck-${Date.now().toString(36)}`,
    title,
    topic,
    summary,
    cards: validatedCards,
    quiz: validatedQuiz,
    keyConcepts: validatedConcepts,
    createdAt: Date.now()
  };

  return {
    success: true,
    data: finalDeck
  };
}
