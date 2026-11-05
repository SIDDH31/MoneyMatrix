import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AIProviderError, getAIConfig, streamChatCompletion } from '../../src/lib/ai/provider';

const KEYS = ['AI_PROVIDER', 'NVIDIA_API_KEY', 'GEMINI_API_KEY', 'AI_API_KEY', 'AI_BASE_URL', 'AI_MODEL'];

function sseResponse(frames: string[], status = 200) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const f of frames) controller.enqueue(encoder.encode(f));
        controller.close();
      },
    }),
    { status }
  );
}

describe('getAIConfig', () => {
  beforeEach(() => KEYS.forEach((k) => delete process.env[k]));

  it('returns null when no key is configured', () => {
    expect(getAIConfig()).toBeNull();
  });

  it('ignores placeholder values copied from .env.example', () => {
    process.env.GEMINI_API_KEY = '"your-gemini-api-key"';
    expect(getAIConfig()).toBeNull();
  });

  it('auto-detects Gemini from its key', () => {
    process.env.GEMINI_API_KEY = 'g-key';
    expect(getAIConfig()).toMatchObject({ provider: 'gemini', model: 'gemini-3.8-flash' });
  });

  it('prefers NVIDIA when both keys are set, unless AI_PROVIDER overrides', () => {
    process.env.GEMINI_API_KEY = 'g-key';
    process.env.NVIDIA_API_KEY = 'nvapi-x';
    expect(getAIConfig()?.provider).toBe('nvidia');
    process.env.AI_PROVIDER = 'gemini';
    expect(getAIConfig()?.provider).toBe('gemini');
  });

  it('honours AI_MODEL', () => {
    process.env.NVIDIA_API_KEY = 'nvapi-x';
    process.env.AI_MODEL = 'meta/llama-3.3-70b-instruct';
    expect(getAIConfig()?.model).toBe('meta/llama-3.3-70b-instruct');
  });
});

describe('streamChatCompletion', () => {
  const config = { provider: 'nvidia' as const, apiKey: 'nvapi-x', baseURL: 'https://integrate.api.nvidia.com/v1', model: 'm' };

  afterEach(() => vi.unstubAllGlobals());

  it('parses SSE tokens split across chunk boundaries', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([
        'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\ndata: {"choi',
        'ces":[{"delta":{"content":"lo"}}]}\n\n: keepalive\n\ndata: [DONE]\n\n',
      ])
    );
    vi.stubGlobal('fetch', fetchMock);

    const stream = await streamChatCompletion(config, [{ role: 'user', content: 'hi' }]);
    expect(await new Response(stream).text()).toBe('Hello');

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://integrate.api.nvidia.com/v1/chat/completions');
    expect(init.headers.Authorization).toBe('Bearer nvapi-x');
    expect(JSON.parse(init.body)).toMatchObject({ model: 'm', stream: true });
  });

  it('turns a rejected key into a friendly error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('bad key', { status: 401 })));
    await expect(streamChatCompletion(config, [])).rejects.toThrow(/NVIDIA_API_KEY/);
  });

  it('falls back to the next model when the first is overloaded', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{"error":{"code":503}}', { status: 503 }))
      .mockResolvedValueOnce(sseResponse(['data: {"choices":[{"delta":{"content":"ok"}}]}\n\ndata: [DONE]\n\n']));
    vi.stubGlobal('fetch', fetchMock);

    const stream = await streamChatCompletion({ ...config, fallbackModels: ['backup'] }, []);
    expect(await new Response(stream).text()).toBe('ok');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).model).toBe('backup');
  });

  it('does not retry other models when the key is rejected', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi.fn().mockResolvedValue(new Response('bad key', { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(streamChatCompletion({ ...config, fallbackModels: ['backup'] }, [])).rejects.toThrow(/NVIDIA_API_KEY/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports network failures as 502', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(streamChatCompletion(config, [])).rejects.toMatchObject({ status: 502 });
    await expect(streamChatCompletion(config, [])).rejects.toBeInstanceOf(AIProviderError);
  });
});
