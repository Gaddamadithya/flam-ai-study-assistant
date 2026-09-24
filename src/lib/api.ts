import { StudyDeck } from '../types/result';
import { validateStudyDeck } from './validateResult';

export class AppError extends Error {
  public details?: string[];
  public isRetryable: boolean;
  public raw?: unknown;

  constructor(message: string, details?: string[], isRetryable: boolean = true, raw?: unknown) {
    super(message);
    this.name = 'AppError';
    this.details = details;
    this.isRetryable = isRetryable;
    this.raw = raw;
  }
}

interface GenerateParams {
  input: string;
  refinement?: string;
  existingDeck?: StudyDeck | null;
  signal?: AbortSignal;
}

interface ApiResponse {
  data?: unknown;
  raw?: string;
  isMock?: boolean;
  provider?: string;
  message?: string;
}

/**
 * Calls the backend proxy to generate or refine study materials.
 * The frontend NEVER speaks directly to LLM providers or holds API secrets.
 */
export async function generateStudyDeck({
  input,
  refinement,
  existingDeck,
  signal
}: GenerateParams): Promise<{ deck: StudyDeck; isMock?: boolean; provider?: string }> {
  // Use relative endpoint so Vite proxy works seamlessly; fallback to 3001
  const endpoints = ['/api/generate', 'http://localhost:3001/api/generate'];
  let lastError: Error | null = null;
  let response: Response | null = null;

  for (const url of endpoints) {
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: input.trim(),
          refinement: refinement?.trim(),
          existingDeck: existingDeck || undefined
        }),
        signal
      });
      break; // Request reached a server
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new AppError('Request was cancelled.', undefined, false);
      }
      lastError = err;
    }
  }

  if (!response) {
    throw new AppError(
      'Unable to connect to backend proxy.',
      [
        'Make sure the backend server is running on port 3001 (npm start).',
        lastError ? lastError.message : 'Network connection failed.'
      ],
      true
    );
  }

  // Handle HTTP status errors
  if (!response.ok) {
    let errData: any = {};
    try {
      errData = await response.json();
    } catch {
      // ignore json parse error on http error
    }

    const message = errData.error || `Server responded with HTTP ${response.status}`;
    const isRetryable = response.status !== 400; // 400 is bad client input
    throw new AppError(message, errData.details, isRetryable);
  }

  let jsonResult: ApiResponse;
  try {
    jsonResult = await response.json();
  } catch (err: any) {
    throw new AppError(
      'Malformed response from proxy server.',
      ['Server returned unparseable response headers or truncated payload.'],
      true
    );
  }

  // If backend provided mock data directly or raw string from LLM
  const rawPayload = jsonResult.data ? jsonResult.data : jsonResult.raw;

  // Defensive validation step: NEVER render raw unverified data
  const validation = validateStudyDeck(rawPayload);

  if (!validation.success) {
    throw new AppError(
      validation.error,
      validation.details,
      true,
      validation.raw
    );
  }

  return {
    deck: validation.data,
    isMock: jsonResult.isMock,
    provider: jsonResult.provider
  };
}
