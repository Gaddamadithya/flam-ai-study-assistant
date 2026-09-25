import { validateStudyDeck } from './validateResult';
import { AppError } from './api';

export type ChaosScenario = 
  | 'malformed_json'
  | 'missing_cards'
  | 'empty_response'
  | 'timeout'
  | 'server_500';

export interface ChaosScenarioInfo {
  id: ChaosScenario;
  title: string;
  badge: string;
  description: string;
  expectedBehavior: string;
}

export const CHAOS_SCENARIOS: ChaosScenarioInfo[] = [
  {
    id: 'malformed_json',
    title: 'Malformed JSON (Truncated Syntax)',
    badge: 'JSON.parse Fail',
    description: 'Simulates the LLM cutting off midway or outputting broken syntax: `{"cards": [{"q": ...`',
    expectedBehavior: 'Defensive parser catches syntax error, presents diagnostic drawer, zero crash.'
  },
  {
    id: 'missing_cards',
    title: 'Wrong Schema Shape (Missing Keys)',
    badge: 'Schema Violation',
    description: 'Simulates valid JSON where the AI forgot to include the mandatory `cards` array.',
    expectedBehavior: 'Schema validator identifies missing property and routes to ErrorState.'
  },
  {
    id: 'empty_response',
    title: 'Empty Response String',
    badge: 'Zero Tokens',
    description: 'Simulates LLM provider returning blank text or empty candidate parts.',
    expectedBehavior: 'Treated explicitly as failure rather than empty-but-valid state.'
  },
  {
    id: 'timeout',
    title: 'Network Timeout (HTTP 504)',
    badge: 'AbortController',
    description: 'Simulates upstream provider stalling and triggering a 25-second timeout.',
    expectedBehavior: 'Shows timeout notification with single-click retry button.'
  },
  {
    id: 'server_500',
    title: 'Provider Outage / Rate Limit (HTTP 500)',
    badge: 'API Failure',
    description: 'Simulates quota limit exhaustion or internal proxy upstream error.',
    expectedBehavior: 'Catches HTTP 500 cleanly with actionable retry.'
  }
];

/**
 * Triggers a chaos failure and throws the appropriate AppError
 * through the exact same pipeline used by live calls.
 */
export function executeChaosScenario(scenario: ChaosScenario): never {
  switch (scenario) {
    case 'malformed_json': {
      const raw = '{"title": "Broken AI Payload", "cards": [{"question": "What happens when JSON truncates...';
      const validation = validateStudyDeck(raw);
      if (!validation.success) {
        throw new AppError(validation.error, validation.details, true, validation.raw);
      }
      break;
    }
    case 'missing_cards': {
      const raw = JSON.stringify({
        title: 'Incomplete AI Result',
        topic: 'Edge Cases',
        summary: 'Forgot to generate cards array.',
        keyConcepts: []
      });
      const validation = validateStudyDeck(raw);
      if (!validation.success) {
        throw new AppError(validation.error, validation.details, true, validation.raw);
      }
      break;
    }
    case 'empty_response': {
      const validation = validateStudyDeck('');
      if (!validation.success) {
        throw new AppError(validation.error, validation.details, true, validation.raw);
      }
      break;
    }
    case 'timeout': {
      throw new AppError(
        'The AI model took too long to respond (timeout after 25s). Please try again or simplify your input.',
        ['Upstream provider timed out before completing generation.'],
        true
      );
    }
    case 'server_500': {
      throw new AppError(
        'AI Service Error: HTTP 500 Internal Provider Exception',
        ['Rate limit exceeded (TPM/RPM exceeded) or upstream service temporary degradation.'],
        true
      );
    }
  }

  throw new AppError('Chaos scenario completed without throwing.');
}
