import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenerativeAIStream, StreamingTextResponse } from 'ai';
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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages } = await req.json();

    const financialContext = await buildFinancialContext(session.user.id);

    // Build the prompt by injecting the system prompt and context as the first message
    // Gemini 1.5 expects systemInstructions in the model configuration, but we can also prepend it to the conversation history.
    const prompt = `${SYSTEM_PROMPT}\n\n${financialContext}\n\nUser Question: ${messages[messages.length - 1].content}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const responseStream = await model.generateContentStream(prompt);
    const stream = GoogleGenerativeAIStream(responseStream);

    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
