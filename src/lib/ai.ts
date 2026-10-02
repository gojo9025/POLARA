// ═══════════════════════════════════════════════════════════════
// POLARA — Client-Side AI Service
// ═══════════════════════════════════════════════════════════════

export interface AISource {
  title: string;
  type: string;
  page?: number;
  relevance?: number;
  id?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: AISource[];
  mode?: string;
  modelUsed?: string;
  timestamp: string;
}

export interface AIResponse {
  answer: string;
  sources: AISource[];
  modelUsed: string;
  mode: string;
  status: string;
  suggestions?: string[];
}

const GEMINI_KEY_STORAGE = 'polara_gemini_api_key';

export function getStoredGeminiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
}

export function setStoredGeminiKey(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key.trim()) {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
  } else {
    localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
  }
}

export async function askPolarAI(options: {
  prompt: string;
  messages?: { role: 'user' | 'assistant'; content: string }[];
  mode?: 'research' | 'student' | 'educator' | 'public' | 'explain' | 'outreach';
  context?: {
    resourceTitle?: string;
    resourceType?: string;
    region?: string;
    abstract?: string;
    findings?: string[];
    variables?: string[];
    format?: string;
    expedition?: string;
  };
  apiKey?: string;
}): Promise<AIResponse> {
  const activeKey = options.apiKey || getStoredGeminiKey();

  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(activeKey ? { 'x-gemini-api-key': activeKey } : {}),
    },
    body: JSON.stringify({
      prompt: options.prompt,
      messages: options.messages,
      mode: options.mode || 'research',
      context: options.context,
      apiKey: activeKey,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `AI Request Failed with status ${response.status}`);
  }

  return await response.json();
}

export async function verifyGeminiKey(apiKey: string): Promise<{ valid: boolean; model?: string; message?: string; error?: string }> {
  try {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_key', apiKey }),
    });
    return await res.json();
  } catch (err: unknown) {
    return { valid: false, error: (err as Error).message };
  }
}

export async function getServerAIStatus(): Promise<{ hasServerKey: boolean; engine: string; recommendedModel: string }> {
  try {
    const res = await fetch('/api/ai');
    return await res.json();
  } catch {
    return { hasServerKey: false, engine: 'POLARA Neural RAG', recommendedModel: 'gemini-1.5-flash' };
  }
}
