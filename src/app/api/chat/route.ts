import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { auth } from '@/lib/auth';
import { buildFinancialContext } from '@/lib/ai/financial-context';

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
`;

const nvidia = createOpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: process.env.NVIDIA_API_KEY || '',
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages } = await req.json();

    const financialContext = await buildFinancialContext(session.user.id);

    const result = await streamText({
      model: nvidia('meta/llama-3.1-70b-instruct') as any,
      system: `${SYSTEM_PROMPT}\n\nUSER FINANCIAL CONTEXT:\n${financialContext}`,
      messages,
    });

    return result.toAIStreamResponse();
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
