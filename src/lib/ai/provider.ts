/**
 * AI Provider Configuration
 *
 * MoneyMatrix talks to any OpenAI-compatible Chat Completions API.
 * Supported out of the box:
 *   - NVIDIA NIM  (default)  -> Llama 3.1 70B Instruct, free credits at build.nvidia.com
 *   - Google Gemini          -> via Gemini's OpenAI-compatible endpoint
 *   - Any other OpenAI-compatible server (OpenAI, Groq, Ollama, ...) via AI_BASE_URL
 *
 * Configure in .env.local:
 *   AI_PROVIDER=nvidia | gemini | custom   (optional; auto-detected from which key is set)
 *   NVIDIA_API_KEY=...                       (for nvidia)
 *   GEMINI_API_KEY=...                       (for gemini)
 *   AI_API_KEY=... + AI_BASE_URL=...         (for custom)
 *   AI_MODEL=...                             (optional model override)
 *
 * Server-side only. NEVER import this in client components.
 */

export type AIProviderName = 'nvidia' | 'gemini' | 'custom';

export interface AIProviderConfig {
  provider: AIProviderName;
  baseURL: string;
  apiKey: string;
  model: string;
  /** Tried in order when the main model is overloaded or unavailable. */
  fallbackModels?: string[];
}

const DEFAULTS: Record<Exclude<AIProviderName, 'custom'>, { baseURL: string; model: string }> = {
  nvidia: {
    baseURL: 'https://integrate.api.nvidia.com/v1',
    model: 'meta/llama-3.1-70b-instruct',
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-3.8-flash',
  },
};

/** Backup models used when the main one is overloaded (HTTP 429/5xx). */
const FALLBACKS: Record<Exclude<AIProviderName, 'custom'>, string[]> = {
  nvidia: ['meta/llama-3.1-8b-instruct'],
  gemini: ['gemini-3.6-flash'],
};

/** How long to wait for the provider to start responding before trying the next model. Streaming itself is not time-limited. */
const CONNECT_TIMEOUT_MS = 25_000;

/** Treat empty strings and copied placeholder values as "not set". */
function clean(value: string | undefined): string {
  const v = (value ?? '').trim().replace(/^["']|["']$/g, '');
  if (!v || /^your[-_]/i.test(v) || v.includes('<')) return '';
  return v;
}

/**
 * Resolve which AI provider to use from environment variables.
 * Returns null when no API key is configured, so callers can show a clear setup message.
 */
export function getAIConfig(): AIProviderConfig | null {
  const requested = clean(process.env.AI_PROVIDER).toLowerCase() as AIProviderName | '';
  const nvidiaKey = clean(process.env.NVIDIA_API_KEY);
  const geminiKey = clean(process.env.GEMINI_API_KEY);
  const customKey = clean(process.env.AI_API_KEY);
  const customBase = clean(process.env.AI_BASE_URL);
  const modelOverride = clean(process.env.AI_MODEL);

  let provider: AIProviderName | null = null;
  if (requested === 'nvidia' || requested === 'gemini' || requested === 'custom') {
    provider = requested;
  } else if (nvidiaKey) {
    provider = 'nvidia';
  } else if (geminiKey) {
    provider = 'gemini';
  } else if (customKey && customBase) {
    provider = 'custom';
  }

  if (provider === 'nvidia' && nvidiaKey) {
    return { provider, apiKey: nvidiaKey, baseURL: DEFAULTS.nvidia.baseURL, model: modelOverride || DEFAULTS.nvidia.model, fallbackModels: modelOverride ? [] : FALLBACKS.nvidia };
  }
  if (provider === 'gemini' && geminiKey) {
    return { provider, apiKey: geminiKey, baseURL: DEFAULTS.gemini.baseURL, model: modelOverride || DEFAULTS.gemini.model, fallbackModels: modelOverride ? [] : FALLBACKS.gemini };
  }
  if (provider === 'custom' && customKey && customBase) {
    return { provider, apiKey: customKey, baseURL: customBase.replace(/\/+$/, ''), model: modelOverride || 'gpt-4o-mini' };
  }
  return null;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIProviderError extends Error {
  status: number;
  /** Raw provider response (truncated). Only exposed to the browser in development. */
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'AIProviderError';
    this.status = status;
    this.detail = detail;
  }
}

/** Map an upstream HTTP failure to a message that is safe and useful to show the user. */
function describeUpstreamError(status: number, provider: AIProviderName): string {
  const keyName = provider === 'gemini' ? 'GEMINI_API_KEY' : provider === 'nvidia' ? 'NVIDIA_API_KEY' : 'AI_API_KEY';
  if (status === 401 || status === 403) return `The AI provider rejected the API key. Check ${keyName} in .env.local.`;
  if (status === 404) return 'The configured AI model was not found. Check AI_MODEL in .env.local.';
  if (status === 429) return 'The AI provider is rate-limiting requests or your free credits ran out. Try again in a minute.';
  if (status >= 500) return 'The AI provider is having problems right now. Please try again shortly.';
  return `The AI provider returned an error (HTTP ${status}).`;
}

/**
 * Call the provider's /chat/completions endpoint with streaming enabled and
 * return a ReadableStream of plain-text tokens (Server-Sent Events are parsed here).
 */
export async function streamChatCompletion(
  config: AIProviderConfig,
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number; signal?: AbortSignal } = {}
): Promise<ReadableStream<Uint8Array>> {
  const models = [config.model, ...(config.fallbackModels ?? [])];
  let upstream: Response | null = null;
  let lastError: AIProviderError | null = null;

  for (let i = 0; i < models.length; i++) {
    if (options.signal?.aborted) throw new AIProviderError('Request cancelled.', 499);
    if (i > 0) await new Promise((r) => setTimeout(r, 800));

    // Abort only if response headers don't arrive in time; once streaming starts, the timer is cleared.
    const connect = new AbortController();
    const timer = setTimeout(() => connect.abort(), CONNECT_TIMEOUT_MS);
    const signal = options.signal ? AbortSignal.any([options.signal, connect.signal]) : connect.signal;

    let res: Response;
    try {
      res = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: models[i],
          messages,
          stream: true,
          temperature: options.temperature ?? 0.4,
          max_tokens: options.maxTokens ?? 4096,
          // Gemini 3 models always "think" first; keep it light so the token budget goes to the answer.
          ...(config.provider === 'gemini' ? { reasoning_effort: 'low' } : {}),
        }),
        signal,
      });
    } catch {
      clearTimeout(timer);
      if (options.signal?.aborted) throw new AIProviderError('Request cancelled.', 499);
      lastError = connect.signal.aborted
        ? new AIProviderError('The AI provider took too long to respond. Please try again.', 504)
        : new AIProviderError('Could not reach the AI provider. Check your internet connection.', 502);
      continue;
    }
    clearTimeout(timer);

    if (res.ok && res.body) {
      upstream = res;
      break;
    }

    // Log the provider's detail on the server; the route only forwards it to the browser in development.
    const detail = await res.text().catch(() => '');
    console.error(`[ai] ${config.provider}/${models[i]} HTTP ${res.status}: ${detail.slice(0, 500)}`);
    lastError = new AIProviderError(describeUpstreamError(res.status, config.provider), res.status, detail.slice(0, 500));

    // Only overloads and outages are worth retrying on another model; bad keys and bad requests are not.
    if (!(res.status === 429 || res.status >= 500)) break;
  }

  if (!upstream?.body) {
    throw lastError ?? new AIProviderError('The AI provider returned no response.', 502);
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();
  let buffer = '';

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let emitted = false;
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') {
            controller.close();
            await reader.cancel().catch(() => {});
            return;
          }
          try {
            const json = JSON.parse(data);
            const choice = json?.choices?.[0];
            const token: string | undefined = choice?.delta?.content;
            if (token) {
              controller.enqueue(encoder.encode(token));
              emitted = true;
            }
            if (choice?.finish_reason === 'length') {
              // Tell the user instead of silently ending mid-sentence.
              controller.enqueue(encoder.encode('\n\n_(Reply cut short. Ask me to continue.)_'));
              emitted = true;
            }
          } catch {
            // Ignore keep-alive comments and partial frames
          }
        }
        if (emitted) return;
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });
}
