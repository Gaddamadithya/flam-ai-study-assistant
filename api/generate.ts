import type { VercelRequest, VercelResponse } from '@vercel/node';

const JSON_SCHEMA_INSTRUCTION = `
You are an expert educational AI. Given the user's study topic or raw notes, generate a structured, high-yield study deck.
You MUST output ONLY a valid JSON object matching the exact specification below, with NO surrounding explanation, NO markdown code fences, and NO prose outside the JSON:

{
  "title": "Catchy, concise deck title",
  "topic": "Primary subject area",
  "summary": "2-3 sentence high-yield conceptual summary of this material",
  "cards": [
    {
      "id": "c1",
      "question": "Clear, direct question or prompt for the front of the flashcard",
      "answer": "Concise, authoritative explanation for the back of the flashcard",
      "hint": "Short mnemonic, keyword, or hint to help recall",
      "difficulty": "easy"
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "Thoughtful multiple-choice question testing comprehension",
      "options": [
        { "id": "a", "text": "Option text" },
        { "id": "b", "text": "Option text" },
        { "id": "c", "text": "Option text" },
        { "id": "d", "text": "Option text" }
      ],
      "correctOptionId": "b",
      "explanation": "Clear explanation of why this answer is correct and why common misconceptions fail"
    }
  ],
  "keyConcepts": [
    {
      "id": "k1",
      "title": "Concept or terminology name",
      "summary": "1-sentence definition or golden rule to remember",
      "importance": "core"
    }
  ]
}

Ensure at least 5-8 flashcards, 4-6 quiz questions with 4 options each, and 3-5 key concepts. Return ONLY raw JSON.`;

function getMockStudyDeck(topicText: string) {
  const cleanTopic = topicText.slice(0, 40) || 'General Study Topic';
  return {
    title: `Mastering ${cleanTopic}`,
    topic: cleanTopic,
    summary: `Comprehensive study breakdown for ${cleanTopic}. Master key principles, test your recall through active retrieval flashcards, and solidify understanding with targeted quizzes.`,
    cards: [
      {
        id: 'c1',
        question: `What is the foundational principle of ${cleanTopic}?`,
        answer: 'The core mechanism relies on establishing primary abstractions and validating state transitions systematically.',
        hint: 'Think about first principles and modular decomposition.',
        difficulty: 'easy'
      },
      {
        id: 'c2',
        question: 'How do you prevent race conditions and stale state updates in asynchronous workflows?',
        answer: 'By attaching monotonic request IDs (or using AbortController) to ignore superseded asynchronous responses when newer actions dispatch.',
        hint: 'Consider useRef(requestId) or cancellation tokens.',
        difficulty: 'medium'
      },
      {
        id: 'c3',
        question: 'Why is defensive parsing crucial when consuming LLM responses in production?',
        answer: 'LLMs are non-deterministic and can output malformed JSON, markdown artifacts, or partial schemas. Pre-validation safeguards against runtime UI crashes.',
        hint: 'Never pass raw unparsed JSON directly to the rendering layer.',
        difficulty: 'medium'
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which strategy best protects against stale asynchronous responses in React?',
        options: [
          { "id": "a", "text": "Disabling all state updates completely" },
          { "id": "b", "text": "Tracking a request counter in useRef and comparing before state commit" },
          { "id": "c", "text": "Adding a setTimeout delay of 5 seconds" },
          { "id": "d", "text": "Using localStorage to cache every intermediate promise" }
        ],
        correctOptionId: 'b',
        explanation: 'Tracking request ID with useRef(0) guarantees that if request #2 resolves before request #1, the older result is safely discarded.'
      }
    ],
    keyConcepts: [
      {
        id: 'k1',
        title: 'Active Retrieval',
        summary: 'Testing oneself on material rather than passively reviewing notes boosts neural encoding.',
        importance: 'core'
      }
    ]
  };
}

async function callGemini(apiKey: string, promptText: string): Promise<string> {
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `${JSON_SCHEMA_INSTRUCTION}\n\nUser Input / Study Material:\n${promptText}` }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json"
        }
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText}`);
    }

    const data = await res.json() as any;
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Gemini API returned empty candidate content.');
    }
    return candidateText;
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenAICompatible(apiUrl: string, apiKey: string, model: string, promptText: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: JSON_SCHEMA_INSTRUCTION },
          { role: 'user', content: promptText }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`LLM provider error (${res.status}): ${errText}`);
    }

    const data = await res.json() as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('LLM provider returned empty response content.');
    }
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { input, refinement, existingDeck } = req.body || {};

  if (!input && !refinement) {
    return res.status(400).json({
      error: 'Missing input prompt. Please provide study notes or a topic.'
    });
  }

  let finalPrompt = input || '';
  if (refinement && existingDeck) {
    finalPrompt = `Current Study Deck: ${JSON.stringify(existingDeck)}\n\nRefinement Request from user: "${refinement}".\nPlease update, improve, or expand this deck according to the refinement request while preserving valid JSON schema.`;
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  try {
    let rawOutput: string;
    let providerName = 'mock';

    if (geminiKey && geminiKey.trim() !== '' && geminiKey !== 'your_gemini_api_key_here') {
      providerName = 'Gemini';
      rawOutput = await callGemini(geminiKey, finalPrompt);
    } else if (groqKey && groqKey.trim() !== '' && groqKey !== 'your_groq_api_key_here') {
      providerName = 'Groq';
      rawOutput = await callOpenAICompatible(
        'https://api.groq.com/openai/v1/chat/completions',
        groqKey,
        process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
        finalPrompt
      );
    } else if (openAiKey && openAiKey.trim() !== '' && openAiKey !== 'your_openai_api_key_here') {
      providerName = 'OpenAI';
      rawOutput = await callOpenAICompatible(
        'https://api.openai.com/v1/chat/completions',
        openAiKey,
        process.env.OPENAI_MODEL || 'gpt-4o-mini',
        finalPrompt
      );
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return res.json({
        data: getMockStudyDeck(input || 'Interactive Learning System'),
        isMock: true,
        message: 'Loaded sample study deck (Simulated AI Mode). Add your GEMINI_API_KEY in Vercel Environment Variables for live AI responses.'
      });
    }

    return res.json({
      raw: rawOutput,
      provider: providerName,
      isMock: false
    });
  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    console.error('LLM API Error:', error.message || error);

    return res.status(isTimeout ? 504 : 502).json({
      error: isTimeout 
        ? 'The AI model took too long to respond (timeout after 25s). Please try again or simplify your input.'
        : `AI Service Error: ${error.message || 'Unknown network error'}`
    });
  }
}
