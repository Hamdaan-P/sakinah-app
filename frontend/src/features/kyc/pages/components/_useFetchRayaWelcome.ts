/**
 * Streamed Raya welcome message fetcher extracted from DeepKycPage.
 * Keeps the page under the LOC budget without touching its behavior.
 */

import { BACKEND_URL } from '@/lib/api';
import type { DeepKycData } from '../../types/kyc.types';

interface FetchArgs {
  data: DeepKycData;
  userId: string;
  userName?: string;
  onToken: (text: string) => void;
}

export async function fetchRayaWelcomeStream({ data, userId, userName, onToken }: FetchArgs): Promise<string> {
  try {
    const res = await fetch(`${BACKEND_URL}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        user_id: userId,
        session_id: `deep-kyc-${Date.now()}`,
        message: 'Generate a personalized welcome message for this user.',
        user_name: userName,
        context: {
          deep_kyc_completion: true,
          user_kyc_profile: {
            intents: data.intent_secondary,
            occupation: data.occupation,
            iman_level: data.iman_level,
            money_motivation: data.money_motivation,
            crisis_instinct: data.crisis_instinct,
            biggest_stress: data.biggest_stress,
            conversation_pref: data.conversation_pref,
            advice_style: data.advice_style,
            life_stage: data.life_stage,
            raya_help_goal: data.raya_help_goal,
            deep_trying_to_change: data.deep_trying_to_change,
          },
        },
      }),
    });

    if (!res.ok) throw new Error('Stream failed');

    const reader = res.body?.getReader();
    if (!reader) throw new Error('No reader');

    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === 'token' && parsed.content) {
              fullText += parsed.content;
              onToken(fullText);
            }
            if (parsed.type === 'done') {
              return fullText || parsed.full_response || '';
            }
          } catch {
            // skip non-JSON lines
          }
        }
      }
    }
    return fullText;
  } catch {
    throw new Error('Welcome fetch failed');
  }
}
