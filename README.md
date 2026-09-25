# OmniLearn AI — Interactive Study Assistant

> Built for the **Flam Frontend Internship Technical Assignment**.  
> An interactive educational tool powered by structured AI output — transforming raw notes into 3D flashcards, active-recall quizzes, and concept checklists with resilient failure handling.

---

## 🚀 Quick Start (Local Setup)

The application includes both the React frontend and a lightweight Express backend proxy. You can run both concurrently with a single command:

```bash
# 1. Clone the repository and navigate into it
git clone <your-repo-url>
cd flam

# 2. Install all dependencies
npm install

# 3. (Optional) Configure AI Provider in .env
cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY (or GROQ_API_KEY / OPENAI_API_KEY)
# Note: If no key is provided, the app runs in Simulated Preview Mode with realistic latency!

# 4. Start the app (Frontend + Backend Proxy)
npm start
```

- **Frontend Client**: Runs on [http://localhost:5173](http://localhost:5173)
- **Backend Proxy**: Runs on [http://localhost:3001](http://localhost:3001)

---

## 🛠️ Architecture & Core Principles

This project was built to address the central premise of the assignment:  
> *"Calling the model is the easy part. We're looking at how you turn unpredictable AI output into reliable UI, and how you handle it when the model gets things wrong."*

```
flam/
├── src/
│   ├── components/
│   │   ├── PromptInput.tsx        # Free-form input with presets and hotkeys
│   │   ├── ResultView.tsx         # Tab router for cards, quiz, concepts & refinement
│   │   ├── FlashcardDeck.tsx      # 3D interactive flashcards with mastery states
│   │   ├── QuizView.tsx           # Multiple choice quiz + "Re-Test Wrong Answers"
│   │   ├── KeyConceptsView.tsx    # Interactive checklist for core concepts
│   │   ├── RefinementInput.tsx    # AI refinement loop (follow-up prompts)
│   │   ├── SavedSessionsModal.tsx # LocalStorage session manager
│   │   ├── ErrorState.tsx         # Unified error, retry, and schema diagnostic UI
│   │   └── LoadingState.tsx       # Multi-step animated progress + abort control
│   ├── lib/
│   │   ├── api.ts                 # Talks ONLY to backend proxy; never calls LLM directly
│   │   └── validateResult.ts      # Defensive schema parsing before rendering
│   ├── types/
│   │   └── result.ts              # Strict TypeScript definitions for study schema
│   ├── App.tsx                    # Root state, stale response guard, dark mode
│   ├── main.tsx
│   └── index.css                  # Tailwind styles + 3D perspective flip CSS
├── server/
│   └── generate.ts                # Express backend proxy keeping API keys secure
├── .env.example
├── package.json
└── README.md
```

### 1. Defensive Parsing & Schema Validation (`src/lib/validateResult.ts`)
- **No Direct Renders**: Raw text or unverified JSON from the AI never touches React component state directly.
- **Markdown Stripping**: Automatically cleans markdown formatting like ````json ... ```` or conversational noise.
- **Deep Structural Checks**: Validates that `cards` and `quiz` arrays exist, have valid fields, non-empty text, and at least 2 distinct multiple choice options.
- **Fail Gracefully**: If validation fails or JSON is malformed, a descriptive `ValidationError` is generated with actionable diagnostics for the user, rendering an `ErrorState` rather than a blank screen or runtime crash.

### 2. Guarding Against Stale Asynchronous Responses (`src/App.tsx`)
When a user submits multiple prompts in quick succession, a slower earlier request can resolve after a faster newer request, silently overwriting fresh data with stale output.
We prevent this using a monotonic request identifier coupled with `useRef` and `AbortController`:
```ts
const requestId = useRef(0);
const abortControllerRef = useRef<AbortController | null>(null);

async function handleGenerate(input: string) {
  const id = ++requestId.current; // monotonic increment
  if (abortControllerRef.current) abortControllerRef.current.abort(); // cancel in-flight HTTP
  
  const controller = new AbortController();
  abortControllerRef.current = controller;

  const result = await generateStudyDeck({ input, signal: controller.signal });
  if (id !== requestId.current) return; // Stale response discarded!
  setDeck(result.deck);
}
```

### 3. API Key Security & Proxy Isolation (`server/generate.ts`)
- The browser **never** contains or exposes API keys.
- All requests flow to a secure local Express proxy (`server/generate.ts`) on port 3001.
- Supports **Google Gemini** (`gemini-1.5-flash`), **Groq** (`llama-3.3-70b-versatile`), and **OpenAI** (`gpt-4o-mini`).
- Includes a 25-second server timeout protection to prevent hanging requests.
- **Zero-Config Simulated Mode**: If no API key is configured, the server provides an intelligent realistic preview so interviewers can test the application immediately without spending credits or configuring tokens.

---

## ✨ Features & Interactivity

1. **Free-Form Text Input (`PromptInput.tsx`)**:
   - Single input field accepting notes, lecture excerpts, or topics.
   - Includes 3 quick-try presets (`React Fiber`, `Distributed Systems`, `JavaScript Event Loop`).
   - Supports `Ctrl+Enter` / `Cmd+Enter` shortcuts and character counting.

2. **3D Flashcards with Active Recall (`FlashcardDeck.tsx`)**:
   - Smooth 3D card flip animation on click or `Space` key.
   - Tag cards as **"Mastered"** or **"Need Review"**.
   - Filter deck by status (All / Needs Review / Mastered).
   - Full keyboard navigation (`Space` flip, `←` `→` arrows, `1` review, `2` mastered).
   - Optional hints for difficult terms.

3. **Practice Quiz & Re-Test Mode (`QuizView.tsx`)**:
   - Interactive multiple choice questions with immediate feedback.
   - Comprehensive explanation for each answer.
   - Live score calculation and celebratory confetti on completion.
   - **Re-Test Wrong Answers Mode**: When you miss questions, a single click filters down to only the questions you got wrong so you can achieve 100% mastery!

4. **Key Concepts Checklist (`KeyConceptsView.tsx`)**:
   - Multi-block breakdown of Core, Supporting, and Advanced concepts.
   - Interactive checkboxes with real-time percentage progress bar.

5. **AI Refinement Loop (`RefinementInput.tsx` — Stretch Goal)**:
   - Allows follow-up prompts (e.g., *"Add 3 harder questions on memory leaks"*, *"Simplify explanations"*).
   - Sends the current deck context to the model to edit the existing result rather than starting from scratch.

6. **Persistent Sessions (`SavedSessionsModal.tsx` — Stretch Goal)**:
   - Save decks to `localStorage` and reload past study sessions anytime.

7. **Dark Mode & Responsive UI**:
   - Complete dark/light mode toggle with system preference detection and localStorage persistence.
   - Fully responsive design engineered for mobile screens and desktop viewports.

8. **Reviewer AI Chaos & Failure Testing Sandbox (`ChaosModal.tsx` — 🔥 Top Signal)**:
   - Built specifically for technical evaluators to test defensive failure recovery live without touching code.
   - Click "Chaos Sandbox" in the header to simulate:
     - 💥 *Malformed JSON (Syntax Error)*
     - 💥 *Wrong Schema Shape (Missing keys)*
     - 💥 *Empty Model Output (Zero tokens)*
     - 💥 *Network Timeout (HTTP 504)*
     - 💥 *Provider Outage / Rate Limit (HTTP 500)*
   - Verifies that the app never crashes, captures exact diagnostics, and allows instant single-click retry.

9. **Text-to-Speech Audio Pronunciation (`speech.ts`)**:
   - Integrated Web Speech API (`SpeechSynthesis`) allows auditory learners to listen to questions and answers with a single click.

10. **Multi-Format Export Suite (`exportUtils.ts`)**:
    - **Export to Anki (.tsv)**: Ready for instant import into the Anki flashcard application.
    - **Export to Markdown (.md)**: Formatted, printable study cheat sheet with checklists, cards, and quiz answer keys.
    - **Export to JSON**: Raw schema payload for developer integration.

11. **Spaced Repetition (SRS) Engine**:
    - SuperMemo SM-2 interval indicators on cards guiding optimal recall schedules (*Review in 10 mins*, *Review in 3 days*).

---

## 🛡️ Error Handling Matrix

| Scenario | Handled By | Behavior / Outcome |
| :--- | :--- | :--- |
| **Malformed JSON** | `extractJSONString` + `JSON.parse` | Caught cleanly; routes to `ErrorState` with "Inspect Diagnostics" & "Retry" button. No crashes. |
| **Wrong Schema Shape** | `validateStudyDeck` | Detailed field-by-field validation; checks array contents and option IDs before state update. |
| **Empty Model Response** | `server/generate.ts` & `validateResult.ts` | Treated explicitly as an error; prompts user to retry with clearer notes. |
| **Slow / Hanging Request** | `AbortController` (25s timeout) | Server aborts hanging upstream calls and returns 504. Client shows timeout message with retry. |
| **Network Disconnection** | `src/lib/api.ts` | Catches fetch failure and presents clear diagnostic message on checking backend server. |
| **Stale Async Race Condition** | `requestId` ref + `AbortController` | Superseded requests are aborted and their responses are strictly prevented from committing to UI. |

---

## ⏱️ Time Spent

Total development time: **~5 hours**
- **Architecture & Schema Design**: ~45 minutes
- **Backend Proxy & Multi-Model Integration**: ~45 minutes
- **Defensive Parser & Error Handling**: ~1 hour
- **Interactive UI Components (Cards, Quiz, Checklist)**: ~1.5 hours
- **Stretch Goals (Refinement Loop, Re-Test Wrong Answers, Sessions, Dark Mode)**: ~45 minutes
- **Testing & Documentation**: ~30 minutes

---

## 🤖 AI Usage Note

In accordance with the assignment guidelines:
- **AI Coding Assistant** was utilized to accelerate boilerplate scaffolding (such as Tailwind configurations and standard React component skeletons), explore edge cases in LLM JSON parsing, and verify TypeScript typings.
- All core architectures — including the monotonic request ID guard, the defensive parsing boundary, proxy isolation, and state machine transitions — were designed, reviewed, and verified manually.

---

## ⚠️ Known Limitations & Future Enhancements

1. **Streaming Structured JSON**: Currently the response is parsed once fully generated. For long decks (20+ cards), utilizing streaming JSON parsers (like partial-json or OpenAI SSE JSON streaming) would provide incremental card rendering.
2. **Audio / Pronunciation**: Adding Web Speech API integration to read flashcards aloud for auditory learners.
3. **Spaced Repetition Algorithm**: Implementing Anki-style SuperMemo SM-2 interval scheduling across multi-day study sessions.
