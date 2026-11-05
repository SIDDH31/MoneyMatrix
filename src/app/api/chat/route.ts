import { z } from 'zod';
import { auth } from '@/lib/auth';
import { buildFinancialContext } from '@/lib/ai/financial-context';
import { AIProviderError, getAIConfig, streamChatCompletion, type ChatMessage } from '@/lib/ai/provider';

export const runtime = 'nodejs';
export const maxDuration = 30;

const SYSTEM_PROMPT = `
You are the AI Financial Advisor for MoneyMatrix. Your role is to help the user understand their finances, answer questions based on their data, and provide actionable insights.

### STRICT GUARDRAILS
1. You are NOT a licensed financial advisor or fiduciary. You must clearly state that your advice is informational.
2. NEVER guarantee returns on investments or fabricate financial facts.
3. You MUST use the exact numbers provided in the USER FINANCIAL CONTEXT below. Do not perform your own math to calculate net worth, progress, or scores. Rely entirely on the provided metrics.
4. Distinguish between your assumptions (e.g., "assuming 8% return") and calculated facts.
5. Keep responses concise, supportive, and highly personalized. Use Markdown formatting (bullet points, bold text) to make it easy to read.
6. Do not include sensitive information like full account numbers in your output.
7. If the context shows missing data (e.g. no goals or no investments), say so and suggest adding it in MoneyMatrix instead of inventing numbers.
`;

/** Only keep the most recent turns so long chats stay within the model's context window. */
const MAX_HISTORY = 12;

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(4000),
      })
    )
    .min(1)
    .max(100),
});

function jsonError(message: string, status: number, detail?: string) {
  // Provider details help debugging locally but are never sent to the browser in production.
  const body = process.env.NODE_ENV === 'development' && detail ? { error: message, detail } : { error: message };
  return Response.json(body, { status });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError('Please sign in to use the AI advisor.', 401);
  }

  const config = getAIConfig();
  if (!config) {
    return jsonError(
      'The AI advisor is not set up yet. Add NVIDIA_API_KEY (or GEMINI_API_KEY) to .env.local and restart the dev server.',
      503
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid request body.', 400);
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Please send a non-empty message (up to 4,000 characters).', 400);
  }

  let financialContext: string;
  try {
    financialContext = await buildFinancialContext(session.user.id);
  } catch (error) {
    console.error('[ai] failed to build financial context:', error);
    return jsonError('Could not load your financial data. Please try again.', 500);
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: `${SYSTEM_PROMPT}\n\nUSER FINANCIAL CONTEXT:\n${financialContext}` },
    ...parsed.data.messages.slice(-MAX_HISTORY),
  ];

  try {
    const stream = await streamChatCompletion(config, messages, { signal: req.signal });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-AI-Provider': config.provider,
      },
    });
  } catch (error) {
    if (error instanceof AIProviderError) {
      // Report provider failures as 502 (or 429) so they are never confused with the user's own sign-in state.
      return jsonError(error.message, error.status === 429 ? 429 : 502, `HTTP ${error.status}: ${error.detail ?? ''}`);
    }
    console.error('[ai] unexpected error in chat route:', error);
    return jsonError('Something went wrong while contacting the AI advisor.', 500);
  }
}
