import { getAppState, setAppState } from '@/db/repositories/appStateRepo';
import { useUserStore } from '@/stores/useUserStore';
import { createId } from '@/utils/id';

const LOGS_KEY = 'ai_logs';
const LOGS_MAX = 40;
const TIMEOUT_MS = 30000;
const RETRIES = 3;

export interface AiLog {
  id: string;
  timestamp: string;
  model: string;
  kind: string;
  ok: boolean;
  note: string;
  prompt?: string;
  response?: string;
}

export async function getAiLogs(): Promise<AiLog[]> {
  try {
    const raw = await getAppState(LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AiLog[];
  } catch {
    return [];
  }
}

async function appendAiLog(log: Omit<AiLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    const logs = await getAiLogs();
    const entry: AiLog = { ...log, id: createId('ai'), timestamp: new Date().toISOString() };
    const next = [entry, ...logs].slice(0, LOGS_MAX);
    await setAppState(LOGS_KEY, JSON.stringify(next));
  } catch {
    // non-fatal
  }
}

export async function clearAiLogs(): Promise<void> {
  await setAppState(LOGS_KEY, JSON.stringify([]));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found');
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function chat(payload: {
  system: string;
  user: string;
  temperature?: number;
  kind?: string;
}): Promise<{ content: string | null; ok: boolean; note: string }> {
  const profile = useUserStore.getState().profile;
  const apiKey = profile?.aiSettings.apiKey?.trim();
  const model = profile?.aiSettings.model?.trim() || 'gpt-4o-mini';

  if (!apiKey) {
    await appendAiLog({ model, kind: payload.kind ?? 'chat', ok: false, note: 'No API key set' });
    return { content: null, ok: false, note: 'No API key set' };
  }

  let lastError = 'Unknown error';
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: payload.system },
            { role: 'user', content: payload.user },
          ],
          temperature: payload.temperature ?? 0.5,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        throw new Error(lastError);
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content ?? null;
      await appendAiLog({ model, kind: payload.kind ?? 'chat', ok: true, note: 'ok', prompt: payload.user, response: content ?? undefined });
      return { content, ok: true, note: 'ok' };
    } catch (error) {
      clearTimeout(timeout);
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt < RETRIES - 1) await delay(2 ** attempt * 1000);
    }
  }
  await appendAiLog({ model, kind: payload.kind ?? 'chat', ok: false, note: lastError, prompt: payload.user });
  return { content: null, ok: false, note: lastError };
}
