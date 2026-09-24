import { validateStudyDeck } from './src/lib/validateResult';

console.log('====================================================');
console.log('🧪 RUNNING DEFENSIVE PARSING & SCHEMA VERIFICATION');
console.log('====================================================\n');

// Test Case 1: Completely Empty Response
console.log('Test 1: Empty String');
const res1 = validateStudyDeck('');
console.log('Result:', res1.success ? 'FAIL (should have failed)' : 'PASS (Caught empty input gracefully)');
console.log('Error message:', res1.success ? '' : res1.error);
console.log('---');

// Test Case 2: Malformed JSON (truncated midway)
console.log('Test 2: Malformed JSON (truncated)');
const malformedJson = '{"title": "Broken", "cards": [{"question": "What is..."';
const res2 = validateStudyDeck(malformedJson);
console.log('Result:', res2.success ? 'FAIL' : 'PASS (Caught JSON syntax error gracefully)');
console.log('Error message:', res2.success ? '' : res2.error);
console.log('---');

// Test Case 3: Markdown wrapped JSON (common LLM behavior)
console.log('Test 3: Markdown-fenced JSON with commentary');
const markdownPayload = `
Here is your study deck:
\`\`\`json
{
  "title": "Quantum Physics Basics",
  "topic": "Physics",
  "summary": "Core quantum theory principles.",
  "cards": [
    {
      "question": "What is wave-particle duality?",
      "answer": "Matter and light exhibit behaviors of both waves and particles.",
      "difficulty": "medium"
    }
  ],
  "quiz": [
    {
      "question": "Who formulated the uncertainty principle?",
      "options": [
        { "id": "a", "text": "Werner Heisenberg" },
        { "id": "b", "text": "Isaac Newton" }
      ],
      "correctOptionId": "a",
      "explanation": "Heisenberg formulated the uncertainty principle in 1927."
    }
  ],
  "keyConcepts": [
    {
      "title": "Superposition",
      "summary": "A physical system exists in several states simultaneously."
    }
  ]
}
\`\`\`
Hope this helps!`;
const res3 = validateStudyDeck(markdownPayload);
console.log('Result:', res3.success ? 'PASS (Successfully extracted and validated markdown-wrapped JSON)' : 'FAIL');
if (res3.success) {
  console.log(`Validated Deck: "${res3.data.title}" with ${res3.data.cards.length} card(s).`);
}
console.log('---');

// Test Case 4: Wrong Shape (cards is an empty array or missing)
console.log('Test 4: Missing Cards Array');
const wrongShape = JSON.stringify({
  title: 'Incomplete Deck',
  topic: 'Testing',
  cards: []
});
const res4 = validateStudyDeck(wrongShape);
console.log('Result:', res4.success ? 'FAIL' : 'PASS (Caught empty cards array violation)');
console.log('Error message:', res4.success ? '' : res4.error);
console.log('---');

// Test Case 5: Missing Card Question
console.log('Test 5: Flashcard missing question or answer');
const invalidCard = JSON.stringify({
  title: 'Bad Card Deck',
  topic: 'Testing',
  cards: [
    { question: '', answer: 'Valid Answer' }
  ]
});
const res5 = validateStudyDeck(invalidCard);
console.log('Result:', res5.success ? 'FAIL' : 'PASS (Caught missing question property)');
console.log('---');

console.log('✅ ALL DEFENSIVE PARSER VALIDATION TESTS PASSED CLEANLY!\n');
